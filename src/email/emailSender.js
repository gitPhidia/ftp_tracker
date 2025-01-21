const { createTransport } = require("nodemailer");
const CONFIG = require("../utilities/configReader");
const { getMissingFiles, getReceviedFiles } = require("../ftp/ftpTracker");
const { formatDateFr } = require("../utilities/utils");


const MAIL_CONFIG = CONFIG.MAIL_CONFIG;

console.log(MAIL_CONFIG);

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
 * @param {string[]} cc - tableau des cc.
 * @param {string} subject - Sujet de l'e-mail.
 * @param {string} html - Contenu HTML de l'e-mail.
 */
const sendMail = async (from, to, cc, subject, html) => {
  try {
    // Options de l'e-mail
    console.log(cc)
    const mailOptions = {
      from: from, // Expéditeur
      to: to, // Destinataire principal
      cc: cc, // Destinataires en copie (facultatif)
      subject: subject, // Sujet de l'e-mail
      html: html, // Contenu HTML
    };

    // Envoi de l'e-mail
    console.log(mailOptions)
    const info = await transporter.sendMail(mailOptions);
    console.log(`E-mail envoyé : ${info.messageId}`);
  } catch (error) {
    console.log(error);
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
          <td>${file.size} Mo</td>
        </tr>
      `
    )
    .join("");

  return `
    <table border="1" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>Base Name</th>
          <th>Nom du Fichier</th>
          <th>Date d'Insertion</th>
          <th>Plateform</th>
          <th>taille</th>
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

module.exports = { sendMissingFilesReport, sendCombinedFilesReport };
