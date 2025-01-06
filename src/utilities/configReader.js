const dotenv = require("dotenv");
const path = require("path");
const logger = require("./logger"); // Charger le logger pour les erreurs et les informations
const crypto = require("crypto");
const crypt = require("./cryptoManager");

// Charger le fichier .env depuis le répertoire courant
const envPath = path.join(process.cwd(), ".env"); // Utiliser process.cwd() pour obtenir le répertoire de l'exécution
console.log("env path =>" + envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  logger.error(`Failed to load .env file: ${result.error.message}`);
  throw new Error("Could not load external environment variables.");
}

// Obtenir et préparer la configuration
const CONFIG = {
  HOST: process.env.HOST,
  USER: process.env.USER,
  PASSWORD: crypt.decryptPassword(process.env.PASSWORD),
  PORT: parseInt(process.env.PORT, 10),
  SECURE: process.env.SECURE === "true",
  SECRET_KEY: process.env.SECRET_KEY,
  REMOTE_PATH: process.env.REMOTE_PATH,
  LOG_PATH: path.join(process.cwd(), "logs"), // Dossier des logs généré au même niveau que .env

  // Configuration pour le serveur mail
  MAIL_CONFIG: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10),
    secure: process.env.MAIL_SECURE === "false", // true pour SSL, false pour STARTTLS
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
  },
};

// Vérification que toutes les variables sont présentes
function validateConfig(config) {
  const errors = [];

  console.log(
    " .......................... Reading .env content ..................................."
  );
  if (!config.HOST) errors.push("HOST is required");
  if (!config.USER) errors.push("USER is required");
  if (!config.PASSWORD) errors.push("PASSWORD is required");
  if (!config.PORT || isNaN(config.PORT))
    errors.push("PORT must be a valid number");
  if (config.SECURE !== true && config.SECURE !== false)
    errors.push("SECURE must be true or false");
  if (!config.SECRET_KEY) errors.push("SECRET_KEY is required");
  if (!config.REMOTE_PATH) errors.push("REMOTE_PATH is required");

  // Validation spécifique au MAIL_CONFIG
  if (!config.MAIL_CONFIG.host) errors.push("MAIL_HOST is required");
  if (!config.MAIL_CONFIG.port || isNaN(config.MAIL_CONFIG.port))
    errors.push("MAIL_PORT must be a valid number");
  if (config.MAIL_CONFIG.secure !== true && config.MAIL_CONFIG.secure !== false)
    errors.push("MAIL_SECURE must be true or false");
  if (!config.MAIL_CONFIG.user) errors.push("MAIL_USER is required");
  if (!config.MAIL_CONFIG.pass) errors.push("MAIL_PASS is required");
  if (!config.MAIL_CONFIG.from) errors.push("MAIL_FROM is required");

  if (errors.length > 0) {
    errors.forEach((error) => logger.error(error));
    throw new Error("Invalid environment configuration. See errors above.");
  }
}

validateConfig(CONFIG); // Valider les variables

// Log des informations pour vérifier que la configuration a bien été lue
logger.info("Loaded external configuration:");
logger.info(`HOST: ${CONFIG.HOST}`);
logger.info(`USER: ${CONFIG.USER}`);
logger.info(`PASSWORD: ${CONFIG.PASSWORD ? "********" : "Not set"}`); // Masquer le mot de passe pour la sécurité
logger.info(`PORT: ${CONFIG.PORT}`);
logger.info(`SECURE: ${CONFIG.SECURE}`);
logger.info(`SECRET_KEY: ${CONFIG.SECRET_KEY ? "********" : "Not set"}`);
logger.info(`REMOTE_PATH: ${CONFIG.REMOTE_PATH}`);
logger.info(`LOG_PATH: ${CONFIG.LOG_PATH}`);
logger.info(`MAIL_CONFIG: ${JSON.stringify(CONFIG.MAIL_CONFIG, null, 2)}`); // Log de la configuration email

module.exports = CONFIG;
