const { createTransport } = require("nodemailer");
const CONFIG = require("../utilities/configReader");
const { getMissingFiles, getReceviedFiles } = require("../ftp/ftpTracker");



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
const sendMailEngine = async (from, to, cc, subject, html) => {
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

const sendMail = async (to, subject, html) => {
  const from = MAIL_CONFIG.from;
  const cc = MAIL_CONFIG.ccs;
   await sendMail(from, to, cc, subject, html);
}


module.exports = { sendMail };
