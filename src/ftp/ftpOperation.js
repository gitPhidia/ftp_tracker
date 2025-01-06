const logger = require("../utilities/logger");
const FTPConnectionManager = require("./ftpConnectionManager");
const path = require("path");
const { bytesToMo , matchesRegex, extractBaseName } = require("../utilities/utils"); // Importer les fonctions de conversion
const FileDetails = require("./fileDetails");  // Importer le modèle des détails des fichiers
const { getAllPlatforms } = require("../services/dataService");


const CONFIG = require("../utilities/configReader"); // Votre fichier de configuration, contenant les infos FTP

/**
 * Liste les fichiers d'un répertoire distant avec leurs informations (nom, taille, date de modification).
 * @returns {Promise<Array>} - Liste des fichiers avec leurs métadonnées.
 */

const listFilesWithDetails = async () => {
  const ftpManager = new FTPConnectionManager();
  const remotePath = CONFIG.REMOTE_PATH; // Chemin distant à partir de .env

  try {
    const client = await ftpManager.connect(); // Établir la connexion
    logger.info(`Fetching file details from remote directory: ${remotePath}`);

    // Liste des fichiers et leurs métadonnées
    const files = await client.list(remotePath);

    // Filtrer pour ignorer les dossiers et garder seulement les fichiers .zip, .bak, .sql
    const validExtensions = [".zip", ".bak", ".sql" , ".txt"];

    const filteredFiles = files.filter(
      (file) =>
        file.type !== "d" &&
        validExtensions.includes(path.extname(file.name).toLowerCase())
    );

    const fileDetails = filteredFiles.map((file) => {
      const sizeInMo = bytesToMo(file.size); // Taille en Mo
      const extension = path.extname(file.name).toLowerCase(); // Extension du fichier
      const modifiedAt = file.rawModifiedAt || file.modifiedAt; // Date de modification

      // Créer une nouvelle instance de FileDetails
      return new FileDetails(file.name, sizeInMo, modifiedAt, extension);
    });

    logger.info(`Found ${fileDetails.length} valid files in ${remotePath}`);
    return fileDetails;
  } catch (error) {
    logger.error(`Error listing files in ${remotePath}: ${error.message}`);
    throw error;
  } finally {
    ftpManager.disconnect(); // Toujours fermer la connexion
  }
};

/**
 * Crée un objet FileDetails à partir des informations d'un fichier et d'une plateforme.
 * Si aucune correspondance n'est trouvée, les valeurs de base sont `null` et `match_any_regex` est `false`.
 * @param {Object} file - L'objet fichier avec les détails.
 * @param {Object|null} platform - L'objet plateforme avec l'ID et le nom. Peut être null.
 * @returns {FileDetails} - L'objet FileDetails créé.
 */
function createFileDetails(file, platform) {
  const baseName = platform
    ? extractBaseName(file.name, platform.platform_regex)
    : null;

  const fileDetails = new FileDetails(
    file.name,
    file.size || null,
    file.modifiedAt || null,
    path.extname(file.name).toLowerCase() || null,
    baseName || null,
    platform ? platform.id : null,
    platform ? platform.name : null,
    !!platform, // Si une plateforme est fournie, match_any_regex est true
    platform ? platform.platform_regex : null // Attribuer le regex si la plateforme est fournie
  );

  return fileDetails;
}

/**
 * Vérifie la correspondance de chaque fichier avec les plateformes et crée les objets FileDetails.
 * Si aucune plateforme ne correspond, la fonction crée un FileDetails avec les informations disponibles.
 * @param {Array} files - Liste des fichiers à traiter.
 * @returns {Promise<Array>} - Liste des objets FileDetails correspondant aux fichiers.
 */
async function processFiles(files) {
  const platforms = await getAllPlatforms();  // Récupérer toutes les plateformes depuis la base de données

  return files.map((file) => {
    let matchedPlatform = null;

    // Vérifier chaque fichier pour chaque plateforme en fonction du regex
    for (const platform of platforms) {
      if (matchesRegex(file.name, platform.platform_regex)) {
        matchedPlatform = platform;
        break; // Sortir dès qu'une correspondance est trouvée
      }
    }

    // Créer un objet FileDetails pour le fichier, avec une plateforme ou null si aucune correspondance
    return createFileDetails(file, matchedPlatform);
  });
}


/**
 * Liste les fichiers du serveur FTP et associe chaque fichier à une plateforme.
 * @returns {Promise<void>} - Affiche les fichiers avec leurs plateformes associées.
 */
async function trackFtpFiles() {
  try {
    // Récupérer les fichiers du serveur FTP
    const files = await listFilesWithDetails();

    // Associer les fichiers aux plateformes et créer les objets FileDetails
    const filesWithPlatform = await processFiles(files);

    // Afficher les détails des fichiers
    console.log("Files and their associated platform:");
    filesWithPlatform.forEach((file) => {
      console.log(file.toJson());  // Affiche chaque fichier avec ses détails
    });
      return filesWithPlatform;
  } catch (error) {
    //console.log(error);
    console.error("Error tracking FTP files:", error.message);
  }
}



module.exports = { trackFtpFiles };
