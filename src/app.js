const CONFIG = require("./utilities/configReader"); // Charger la configuration
const logger = require("./utilities/logger"); // Charger le logger
const { syncFtpWithDatabase, getMissingFiles } = require("./ftp/ftpTracker");
const {
  sendMissingFilesReport,
  sendCombinedFilesReport,
} = require("./email/emailSender");
const cron = require('node-cron');


/**
 * Fonction pour obtenir la date d'hier (currentDate - 1).
 */
function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1); // Soustraire un jour
  return yesterday.toISOString().split("T")[0]; // Formater la date en YYYY-MM-DD
}



//console.log(getYesterdayDate());

/**
 * Fonction pour gérer la synchronisation des fichiers FTP avec la base de données.
 */
async function handleSynchronization() {
  try {
    logger.info("Starting synchronization process...");
    await syncFtpWithDatabase();
    logger.info("Synchronization process completed successfully.");
  } catch (error) {
    logger.error("Error in synchronization process:", error.message);
    throw error;
  }
}

/**
 * Fonction pour vérifier les fichiers attendus manquants.
 */
async function handleMissingFilesCheck() {
  try {
    const targetDate = new Date('2025-01-05'); // Date actuelle au format "YYYY-MM-DD"
    logger.info(`Checking for missing files for date: ${targetDate}...`);
    
    const missingFiles = await getMissingFiles(targetDate);
    
    if (missingFiles.length === 0) {
      logger.info(`No missing files for ${targetDate}.`);
    } else {
      logger.warn(`Missing files for ${targetDate}: ${missingFiles.join(", ")}`);
    }
  } catch (error) {
    logger.error("Error in missing files check:", error.message);
    throw error;
  }
}


/**
 * Fonction principale.
 */
async function handleMissingFileReport() {
  const yesterdayDate = getYesterdayDate(); // Obtenir la date d'hier
 // const date = '2025-01-07';
  try {
    console.log(`Lancement du rapport des fichiers manquants pour la date : ${yesterdayDate}`);
    await sendCombinedFilesReport(yesterdayDate); 
    console.log("Rapport des fichiers manquants envoyé avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'envoi du rapport des fichiers manquants :", error.message);
  }
}
/**
 * Fonction principale pour orchestrer l'application.
 */
async function main() {
  try {
    // Appeler la logique de synchronisation
   // await handleSynchronization();

    // Vérifier les fichiers attendus manquants
    // await handleMissingFilesCheck();

    await handleMissingFileReport(); // Appeler la fonction mail_test

    logger.info("All processes completed successfully.");
  } catch (error) {
    logger.error("Error in main process:", error.message);
    process.exit(1); // Arrêter avec un code d'erreur
  }
}


// Planification avec node-cron pour exécuter la fonction toutes les 10 minutes
cron.schedule('*/10 * * * *', async () => {
  try {
    console.log("Starting synchronization process...");
    await handleSynchronization();
  } catch (error) {
    console.error("Error during synchronization:", error.message);
  }
});


cron.schedule('0 9 * * *', async () => {
   try {
    console.log("Start sending repport  process...");
    await handleMissingFileReport();
  } catch (error) {
    console.error("Error during sending report:", error.message);
  }
})

// Exécuter l'application principale
handleMissingFileReport();