const db = require("../db/db");

/**
 * Récupère la configuration des fichiers depuis la base de données.
 * @returns {Promise<Object>} - La configuration des fichiers organisée par plateforme.
 */
async function fetchFileConfig() {
  const query = `
    SELECT platforms.name AS platform, platforms.platform_regex, expected_basenames.basename
    FROM expected_basenames
    JOIN platforms ON platforms.id = expected_basenames.platform_id;
  `;

  const rows = await db.executeQuery(query);

  // Organiser les données pour correspondre au format attendu
  const fileConfig = rows.reduce(
    (acc, { platform, platform_regex, basename }) => {
      if (!acc[platform]) {
        acc[platform] = {
          platformRegex: new RegExp(platform_regex),
          expectedBasenames: [],
        };
      }
      acc[platform].expectedBasenames.push(basename);
      return acc;
    },
    {}
  );
 // console.log(fileConfig)
  return fileConfig;
}

async function getAllPlatforms() {
  const query = " SELECT * FROM PLATFORMS ";
  const rows = await db.executeQuery(query);
  return rows;
}





/**
 * Insère un fichier traité dans la base de données.
 * @param {Object} fileData - Données sur le fichier à insérer.
 * @param {string} fileData.fileName - Nom du fichier.
 * @param {string} fileData.platform - Plateforme associée.
 * @param {string} fileData.baseName - BaseName du fichier.
 * @param {string} fileData.date - Date associée au fichier.
 * @param {string} fileData.time - Heure associée au fichier.
 */
async function insertProcessedFile(fileData) {
  const query = `
    INSERT INTO processed_files (file_name, platform, base_name, file_date, file_time)
    VALUES ($1, $2, $3, $4, $5);
  `;

  const { fileName, platform, baseName, date, time } = fileData;
  await db.executeQuery(query, [fileName, platform, baseName, date, time]);
}



/**
 * Insère un fichier dans la base de données.
 * @param {Object} file - Données du fichier à insérer.
 */
async function insertFile(file) {
  //console.log(file);
  const query = `
    INSERT INTO files (name, size, modified_at, extension, base_name, platform_id, platform_name, match_any_regex, inserted_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  const values = [
    file.name,
    file.size,
    file.modifiedAt,
    file.extension,
    file.baseName,
    file.platform_id,
    file.platform_name,
    file.match_any_regex,
  ];

  try {
    await db.executeQuery(query, values);
    console.log(`Inserted file: ${file.name}`);
  } catch (error) {
    console.error(`Error inserting file ${file.name}:`, error.message);
    throw error;
  }
}



/**
 * Met à jour les informations d’un fichier existant.
 * @param {Object} file - Données du fichier à mettre à jour.
 */
async function updateFile(file) {
  const query = `
    UPDATE files 
    SET size = $1, modified_at = $2, extension = $3, base_name = $4, 
        platform_id = $5, platform_name = $6, match_any_regex = $7, updated_at = CURRENT_TIMESTAMP
    WHERE name = $8
  `;

  const values = [
    file.size,
    file.modifiedAt,
    file.extension,
    file.baseName,
    file.platform_id,
    file.platform_name,
    file.match_any_regex,
    file.name,
  ];

  try {
    await db.executeQuery(query, values);
    console.log(`Updated file: ${file.name}`);
  } catch (error) {
    console.error(`Error updating file ${file.name}:`, error.message);
    throw error;
  }
}



/**
 * Vérifie si un fichier existe déjà dans la base de données.
 * @param {string} fileName - Nom du fichier.
 * @returns {Promise<boolean>} - `true` si le fichier existe, sinon `false`.
 */
async function fileExists(fileName) {
  const query = `
    SELECT 1 FROM files WHERE name = $1
  `;

  const rows = await db.executeQuery(query, [fileName]);
  return rows.length > 0;
}



/**
 * Met à jour uniquement la date de suppression d'un fichier dans la base de données.
 * @param {string} fileName - Le nom du fichier à marquer comme supprimé.
 */
async function markFileAsDeleted(fileName) {
  // S'assurer que le fichier n'a pas déjà été marqué comme supprimé
  const query = `
    UPDATE files
    SET deleted_at = NOW()
    WHERE name = $1 AND deleted_at IS NULL; 
  `;
  //console.log(query);
  await db.executeQuery(query, [fileName]);
  console.log(`Marked ${fileName} as deleted in the database.`);
}


// Récupère tous les fichiers dans la base de données
async function getAllFilesFromDatabase() {
  const query = "SELECT name FROM files WHERE deleted_at IS NULL";  // Vous pouvez filtrer ici si nécessaire
  const rows = await db.executeQuery(query);
  return rows;  // Renvoie un tableau des fichiers existants dans la base de données
}


// Récupère tous les fichiers manquantes
async function getMissingExpectedFiles(forDate) {
  const query = `
    WITH daily_files AS (
        SELECT DISTINCT base_name
        FROM files
        WHERE DATE(inserted_at) = $1
          AND deleted_at IS NULL
    )
    SELECT eb.basename AS missing_base_name
    FROM expected_basenames eb
    LEFT JOIN daily_files df ON eb.basename = df.base_name
    WHERE df.base_name IS NULL;
  `;

  const result = await db.executeQuery(query, [forDate]);
  return result;
}

async function getReceviedExpectedFiles(fordate) {
  const query = `
      SELECT 
        base_name, 
        name,
        COALESCE(size , 0) as size ,
        platform_name ,
        inserted_at 
      FROM files
      WHERE DATE(inserted_at) = $1
        AND deleted_at IS NULL AND base_name IS NOT NULL
      ORDER BY base_name ASC ;
    `;
  const result = await db.executeQuery(query, [fordate]);
  //console.log("ito => " + fordate + " => "+ result)
  return result;
}


module.exports = {
  fetchFileConfig,
  insertProcessedFile,
  getAllPlatforms,
  insertFile,
  updateFile,
  fileExists,
  markFileAsDeleted,
  getAllFilesFromDatabase,
  getMissingExpectedFiles,
  getReceviedExpectedFiles,
};
