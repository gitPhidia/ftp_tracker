const { createTransport } = require("nodemailer");
const CONFIG = require("../utilities/configReader");
const { getMissingFiles, getReceviedFiles } = require("../ftp/ftpTracker");
const {
  formatDateFr,
  formatSizeString,
  formatSizeToTwoDecimals,
} = require("../utilities/utils");

const { sendMail } = require("./emailSender");

const { EmailReport } = require("./EmailRepport");

const { generateCombinedReportContentHtml } = require("./emailTemplate");

const MAIL_CONFIG = CONFIG.MAIL_CONFIG;

console.log(MAIL_CONFIG);



/**
 * Générer un tableau HTML pour afficher les fichiers manquants.
 * @param {Array} missingFiles - Liste des fichiers manquants.
 * @returns {string} Tableau HTML
 */
const generateMissingFilesTable = (missingFiles) => {
  if (!missingFiles || missingFiles.length === 0) {
    return "<p>Aucun fichier manquant trouvé pour la date spécifiée.</p>";
  }

  const rows = missingFiles
    .map((file) => `<tr><td>${file.missing_base_name}</td></tr>`)
    .join("");

  return `
    <table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
      <thead>
        <tr>
          <th style="background-color: red; color: white; padding: 10px; text-align: left;">
            Nom de la base
          </th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

/**
 * Générer un tableau HTML pour afficher les fichiers reçus.
 * @param {Array} receivedFiles - Liste des fichiers reçus.
 * @returns {string} Tableau HTML
 */
const generateReceivedFilesTable = (receivedFiles) => {
  if (!receivedFiles || receivedFiles.length === 0) {
    return "<p>Aucun fichier reçu trouvé pour la date spécifiée.</p>";
  }

  const rows = receivedFiles
    .map(
      (file) => `
        <tr>
          <td>${file.base_name}</td>
          <td>${file.name}</td>
          <td>${formatDateFr(file.inserted_at)}</td>
          <td>${file.platform_name}</td>
          <td style="text-align: right;">${formatSizeToTwoDecimals(
            file.size
          )} Mo</td>
        </tr>
      `
    )
    .join("");

  return `
    <table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
      <thead>
        <tr>
          <th>Nom de la base</th>
          <th>Nom du Fichier</th>
          <th>Date d'Insertion</th>
          <th>Application</th>
          <th style="width: 8%; text-align: right;">Taille</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

/**
 * Envoyer un rapport par e-mail pour les fichiers manquants.
 * @param {string} forDate - Date pour laquelle les fichiers manquants sont récupérés.
 */
const sendMissingFilesReport = async (forDate) => {
  try {
    // Récupérer les fichiers manquants
    const missingFiles = await getMissingFiles(forDate);
    console.log(missingFiles);
    // Créer le tableau HTML
    const tableHtml = generateMissingFilesTable(missingFiles);

    // Paramètres pour l'e-mail
    const from = MAIL_CONFIG.from; // Adresse de l'expéditeur
    const to = "loicRavelo05@gmail.com"; // Adresse du destinataire principal
    // const cc = "loicRavelo@outlook.com , tahina@phidia.onmicrosoft.com ";  // Optionnel, pour les copies
    const cc = MAIL_CONFIG.ccs; // Adresses en copie sous forme de tableau
    const subject = `Rapport des fichiers manquants - ${formatDateFr(forDate)}`;
    const html = `
      <p>Bonjour,</p>
      <p>Voici la liste des fichiers manquants pour la date : <strong>${formatDateFr(
        forDate
      )}</strong>.</p>
      ${tableHtml}
      <p>Cordialement,</p>
      <p>L'équipe de surveillance FTP</p>
    `;

    // Appel à la fonction sendMail
    await sendMail(from, to, cc, subject, html);
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi du rapport des fichiers manquants :",
      error.message
    );
  }
};

/**
 * Envoyer un rapport par e-mail combinant les fichiers manquants et reçus.
 * @param {string} forDate - Date pour laquelle les rapports sont générés.
 */
const sendCombinedFilesReport = async (forDate) => {
  try {
    // Récupérer les fichiers manquants et reçus
    const missingFiles = await getMissingFiles(forDate);
    const receivedFiles = await getReceviedFiles(forDate);

    console.log(receivedFiles);

    // Générer les tableaux HTML pour les deux types de fichiers
    const tableHtmlMissing = generateMissingFilesTable(missingFiles);
    const tableHtmlReceived = generateReceivedFilesTable(receivedFiles);

    // Paramètres pour l'e-mail
    const from = MAIL_CONFIG.from; // Adresse de l'expéditeur
    const to = "loicRavelo05@gmail.com"; // Adresse du destinataire principal
    const cc = MAIL_CONFIG.ccs; // Optionnel, pour les copies
    const subject = `Rapport combiné - ${formatDateFr(forDate)}`;
    const html = `
      <p>Bonjour,</p>
      <p>Voici les rapports des fichiers pour la date : <strong>${formatDateFr(
        forDate
      )}</strong>.</p>
      
      <h3>Fichiers Manquants</h3>
      ${tableHtmlMissing}
      
      <h3>Fichiers Reçus</h3>
      ${tableHtmlReceived}
      
      <p>Cordialement,</p>
      <p>L'équipe de surveillance FTP</p>
    `;

    // Appel à la fonction sendMail
    await sendMail(from, to, cc, subject, html);

    console.log(
      `Rapport combiné envoyé avec succès pour la date : ${formatDateFr(
        forDate
      )}`
    );
  } catch (error) {
    console.log(error);
    console.error("Erreur lors de l'envoi du rapport combiné :", error.message);
  }
};


const reporting = async ( to , subject , repportTitle , repport , signature) => {
    const report = new EmailReport(repportTitle, repport, signature);
    console.log(report);
    await sendMail(to, subject, report.generateHtml() , signature);
}


const sendDailyCombinedRepport = async (forDate) => {

    console.log(" daily repporting .........")

   
     const subject = `Rapport combiné - ${formatDateFr(forDate)}`;
     const to = "loic@mgbi.mg";
     const repportTitle = ` 
         <p>Voici les rapports des fichiers pour la date : <strong>${formatDateFr(
           forDate
         )}</strong>.</p>
      
    `;
     const signature = `
      <p>Cordialement,</p>
      <p>L'équipe de surveillance FTP</p>
    `;

    try {
        console.log("fetching data ..............")
        const missingFiles = await getMissingFiles(forDate);
        console.log("fetching data 1 ..............");
       // const receivedFiles = await getReceviedFiles(forDate);
       // console.log(receivedFiles);
        console.log("fetching data 2..............");
        //  const repportHtml = generateCombinedReportContentHtml(
        //      missingFiles,
              receivedFiles
        //    );
          console.log("data fetched .........")
          //await reporting(to , subject , repportTitle , repportHtml ,signature);
    }
    catch (error) {
         console.log(error);
         console.error(
           "Erreur lors de l'envoi du rapport combiné :",
           error.message
         );
    }

  
    
}

(async () => {
  try {
    console.log("Testing getMissingFiles...");
    const testFiles = await getMissingFiles("2024-02-26"); // Remplace par une date valide
    console.log("Test result:", testFiles);
  } catch (error) {
    console.error("Error in getMissingFiles:", error);
  }
})();



module.exports = { sendMissingFilesReport, sendCombinedFilesReport , sendDailyCombinedRepport };
