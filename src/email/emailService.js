const { createTransport } = require("nodemailer");
const CONFIG = require("../utilities/configReader");
const {
  getMissingFiles,
  getReceviedFiles,
} = require("../ftp/ftpTracker");
const {
  formatDateFr,
  formatSizeString,
  formatSizeToTwoDecimals,
} = require("../utilities/utils");

const { sendMail } = require("./emailSender");

const  EmailReport  = require("./EmailRepport");

const { generateCombinedReportContentHtml } = require("./emailTemplate");

const {
  getReceviedExpectedFilesByCustomer,
  getCustomerContacts,
  getCustomerById,
  getCustomersCompanyContacts,
  getMissingExpectedFilesByCustomer,
  getCustomersToNotify,
} = require("../services/dataService");

const MAIL_CONFIG = CONFIG.MAIL_CONFIG;

console.log(MAIL_CONFIG);




const reporting = async ( to , subject , repportTitle , repport , signature) => {
    const report = new EmailReport(repportTitle, repport, signature);
    console.log(report);
    await sendMail(to, subject, report.generateHtml() , signature);
}


const sendDailyCombinedRepport = async (forDate) => {

     const subject = `Rapport  de sauvgarde pour la date du  - ${formatDateFr(forDate)}`;
     const to = "loic@mgbi.mg";
     const repportTitle = ` 
         <p> Voici le rapport des fichiers de sauvegarde daté du  <strong>${formatDateFr(
           forDate
         )}</strong>.</p>
      
    `;
     const signature = `
      <p>Cordialement,</p>
      <p>L'équipe de surveillance de sauvgarde</p>
    `;

    try {
      
       const missingFiles = await getMissingFiles(forDate);
        
       const receivedFiles = await getReceviedFiles(forDate);
    
       const repportHtml = generateCombinedReportContentHtml(
                missingFiles,
                receivedFiles
              );
         
       await reporting(to , subject , repportTitle , repportHtml ,signature);
    }
    catch (error) {
         console.log(error);
         console.error(
           "Erreur lors de l'envoi du rapport combiné :",
           error.message
         );
    }

  
    
}


const dailyCustomersCombinedRepport = async (forDate, customersId) => {
  try {
    const customer = await getCustomerById(customersId);
    const customerContacts = await getCustomerContacts(customersId);

    // Vérifier si la liste des contacts est vide
    if (!customerContacts || customerContacts.length === 0) {
      console.log(
        `⛔ Aucun contact trouvé pour ${customer.customer_name}. Email non envoyé.`
      );
      return; // Stoppe uniquement pour ce client, mais continue pour les autres
    }

    // Liste des destinataires
    const to = customerContacts.map((contact) => contact.mail).join(",");

    const missingFiles = await getMissingExpectedFilesByCustomer(
      forDate,
      customersId
    );
    const receivedFiles = await getReceviedExpectedFilesByCustomer(
      forDate,
      customersId
    );
    const subject = `Rapport  de sauvegarde - ${formatDateFr(forDate)}`;
    const companyContacts = await getCustomersCompanyContacts(customersId);

    /*

    Voici le rapport de sauvegarde pour le dossier MGBI, daté du lundi 3 mars 2025.

    */

    const repportTitle = `<p>
      Voici le rapport des fichiers de sauvegarde pour  ${
        customer.customer_name
      } , daté du  ${formatDateFr(forDate)}
    </p>`;

    // Génération de la signature avec les emails
    let contactsEmails = companyContacts
      .map((contact) => contact.mail)
      .join(", ");

    const signature = `
      <p>Cordialement,</p>
      <p>Merci de ne pas répondre, pour plus d'informations merci de contacter : <strong>${contactsEmails}</strong></p>
      <p>L'équipe  ${customer.company_name}</p>
    `;

    const repportHtml = generateCombinedReportContentHtml(
      missingFiles,
      receivedFiles
    );

    await reporting(to, subject, repportTitle, repportHtml, signature);
  } catch (error) {
    console.error(
      `❌ Erreur lors du rapport pour ${customersId} :`,
      error.message
    );
    // Continue l'exécution même si une erreur survient
  }
};


/**
 * Fonction pour envoyer les notifications à tous les clients à notifier.
 * @param {string} forDate - Date du rapport (format YYYY-MM-DD).
 */
const notifyAllCustomers = async (forDate) => {
  try {
    console.log(`📢 Début de l'envoi des rapports pour la date : ${formatDateFr(forDate)}`);

    // Récupérer tous les clients qui doivent être notifiés
    const customers = await getCustomersToNotify();

    if (!customers || customers.length === 0) {
      console.log("✅ Aucun client à notifier aujourd'hui.");
      return;
    }

    console.log(`📩 ${customers.length} clients à notifier.`);

    // Traiter chaque client un par un
    for (const customer of customers) {
      await dailyCustomersCombinedRepport(forDate, customer.id);
    }

    console.log("✅ Tous les rapports ont été envoyés avec succès.");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi des notifications :", error.message);
  }
};

/*

(async () => {
  try {
    console.log("Testing getMissingFiles...");
    const testFiles = await notifyAllCustomers("2025-03-01"); // Remplace par une date valide
    console.log("Test result:", testFiles);
  } catch (error) {
    console.error("Error in getMissingFiles:", error);
  }
})();

*/


module.exports = { sendDailyCombinedRepport  , notifyAllCustomers};
