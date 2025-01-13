<<<<<<< HEAD
  const { createTransport } = require("nodemailer");
const { MAIL_CONFIG } = require("../utilities/configReader");
const { getMissingFiles } = require("../ftp/ftpTracker");
const { formatDateFr } = require("../utilities/utils")

const { createTransport } = require("nodemailer");
const  CONFIG  = require("../utilities/configReader");
const { getMissingFiles, getReceviedFiles } = require("../ftp/ftpTracker");
const { formatDateFr } = require("../utilities/utils");

const MAIL_CONFIG = CONFIG.MAIL_CONFIG;

console.log (MAIL_CONFIG)


/**
 * Créer un transporteur Nodemailer pour envoyer un e-mail via le serveur SMTP configuré.
 * @returns {Transporter} Transporteur Nodemailer
 */
const transporter = createTransport({
  host: MAIL_CONFIG.host,
  port: MAIL_CONFIG.port,
  secure: MAIL_CONFIG.secure, // Si le transporteur utilise STARTTLS, définissez secure à false
  auth: {
    user: MAIL_CONFIG.user,
    pass: MAIL_CONFIG.pass,
  },
});




/**
 * Fonction générique pour envoyer un e-mail.
 * @param {string} from - Adresse e-mail de l'expéditeur.
 * @param {string} to - Adresse e-mail du destinataire principal.
 * @param {string} cc - Liste des destinataires en copie (séparée par des virgules).
 * @param {string} subject - Sujet de l'e-mail.
 * @param {string} html - Contenu HTML de l'e-mail.
 */
const sendMail = async (from, to, cc, subject, html) => {
  try {
    // Options de l'e-mail
    const mailOptions = {
      from: from,   // Expéditeur
      to: to,       // Destinataire principal
      cc: cc,       // Destinataires en copie (facultatif)
      subject: subject, // Sujet de l'e-mail
      html: html,   // Contenu HTML
    };

    // Envoi de l'e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log(`E-mail envoyé : ${info.messageId}`);
  } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail :", error.message);
  }
};


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
    <table border="1" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>Base Name Manquant</th>
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
    console.log(missingFiles)
    // Créer le tableau HTML
    const tableHtml = generateMissingFilesTable(missingFiles);

    // Paramètres pour l'e-mail
    const from = MAIL_CONFIG.from;  // Adresse de l'expéditeur
    const to = "loicRavelo05@gmail.com";    // Adresse du destinataire principal
    const cc = "loicRavelo@outlook.com , tahina@phidia.onmicrosoft.com ";  // Optionnel, pour les copies
        const subject = `Rapport des fichiers manquants - ${formatDateFr(forDate)}`;
    const html = `
      <p>Bonjour,</p>
      <p>Voici la liste des fichiers manquants pour la date : <strong>${formatDateFr(forDate)}</strong>.</p>
      ${tableHtml}
      <p>Cordialement,</p>
      <p>L'équipe de surveillance FTP</p>
    `;

    // Appel à la fonction sendMail
    await sendMail(from, to, cc, subject, html);
  } catch (error) {
    console.error("Erreur lors de l'envoi du rapport des fichiers manquants :", error.message);
  }
};




module.exports = { sendMissingFilesReport };
