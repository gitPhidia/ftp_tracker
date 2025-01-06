// ftpTracker.js
const { trackFtpFiles } = require("./ftpOperation");
const logger = require("../utilities/logger"); // Pour afficher les logs de l'application
const {
  insertFile,
  updateFile,
  fileExists,
  getAllFilesFromDatabase,
  markFileAsDeleted,
  getMissingExpectedFiles,
} = require("../services/dataService");


/**
 * Fonction pour afficher les fichiers avec leurs détails.
 */
async function displayFilesWithDetails() {
  try {
    // Obtenez la liste des fichiers avec leurs détails
    const fileDetails = await trackFtpFiles();

    // Si des fichiers sont récupérés
    if (fileDetails.length > 0) {
      logger.info(`Found ${fileDetails.length} file(s).`);
      fileDetails.forEach(file => {
        // Afficher chaque fichier avec ses détails en utilisant toString()
       // logger.info(file.toString()); // Utilisation de la méthode toString
      });
    } else {
      logger.info("No files found.");
    }
  } catch (error) {
      logger.error("Error displaying files:", error.message);
      console.log(error);
    throw error
   
  }
}


/**
 * Synchronise les fichiers FTP avec la base de données PostgreSQL.
 */
async function syncFtpWithDatabase() {
  try {
    console.log("Starting synchronization...");

    // 1. Récupérer les fichiers FTP avec leur association aux plateformes
    const filesWithPlatform = await trackFtpFiles();
    console.log(`Processed ${filesWithPlatform.length} files from FTP.`);

    // 2. Récupérer les fichiers actuellement présents dans la base de données
    const existingFiles = await getAllFilesFromDatabase(); // Récupère tous les fichiers existants dans la base de données

    // 3. Créer un ensemble des noms de fichiers présents sur le serveur FTP pour la comparaison
    const ftpFileNames = new Set(filesWithPlatform.map((file) => file.name));

    // 4. Identifier les fichiers qui ne sont plus présents sur le serveur FTP
    const filesToDelete = existingFiles.filter(
      (file) => !ftpFileNames.has(file.name)
    );

    // 5. Marquer ces fichiers comme supprimés dans la base de données
    for (const file of filesToDelete) {
    // console.log("makato = > " + file.name)
      await markFileAsDeleted(file.name); // Marque uniquement la date de suppression
    }

    // 6. Traiter les fichiers provenant du FTP : insérer ou mettre à jour
    for (const file of filesWithPlatform) {
      const exists = await fileExists(file.name); // Vérifie si le fichier existe déjà dans la base

      if (!exists) {
        // 6.1 Insérer un nouveau fichier si ce n'est pas le cas
        await insertFile(file);
        console.log(`Inserted new file ${file.name} into the database`);
      } else {
        // 6.2 Mettre à jour un fichier existant
        await updateFile(file);
        console.log(`Updated file ${file.name} in the database`);
      }
    }

    console.log("Synchronization complete.");
  } catch (error) {
    console.log(error)  
    console.error("Error during synchronization:", error.message);
    throw error;
  }
}


/**
 * Obtient une liste des fichiers attendus mais manquants pour une date donnée.
 * @param {string} forDate - La date au format "YYYY-MM-DD".
 * @returns {Promise<Array<string>>} - Liste des noms des fichiers manquants.
 */
async function getMissingFiles(forDate) {
  try {
    const rawResult = await getMissingExpectedFiles(forDate);
    return rawResult;// Extrait uniquement les noms
  } catch (error) {
    console.error("Error in service fetching missing files:", error.message);
    throw error;
  }
}


module.exports = {
  displayFilesWithDetails,
  syncFtpWithDatabase,
  getMissingFiles,
};
