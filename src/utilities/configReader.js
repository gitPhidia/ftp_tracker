// Charger le fichier .env depuis le répertoire courant
const dotenv = require("dotenv");
const path = require("path");
const logger = require("./logger"); // Charger le logger pour les erreurs et les informations
const crypt = require("./cryptoManager");

const envPath = path.join(process.cwd(), ".env"); // Utiliser process.cwd() pour obtenir le répertoire de l'exécution
const result = dotenv.config({ path: envPath });

if (result.error) {
  logger.error(`Failed to load .env file: ${result.error.message}`);
  throw new Error("Could not load external environment variables.");
}

// Obtenir et préparer la configuration
const CONFIG = {
  HOST: process.env.HOST,
  USER: "web",
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
    secure: process.env.MAIL_SECURE === "true", // true pour SSL, false pour STARTTLS
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
  },

  // Configuration pour la base de données
  DB_CONFIG: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_NAME,
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
  const mailConfig = config.MAIL_CONFIG;
  if (!mailConfig.host) errors.push("MAIL_HOST is required");
  if (!mailConfig.port || isNaN(mailConfig.port))
    errors.push("MAIL_PORT must be a valid number");
  if (mailConfig.secure !== true && mailConfig.secure !== false)
    errors.push("MAIL_SECURE must be true or false");
  if (!mailConfig.user) errors.push("MAIL_USER is required");
  if (!mailConfig.pass) errors.push("MAIL_PASS is required");
  if (!mailConfig.from) errors.push("MAIL_FROM is required");

  // Validation spécifique au DB_CONFIG
  const dbConfig = config.DB_CONFIG;
  if (!dbConfig.user) errors.push("DB_USER is required");
  if (!dbConfig.password) errors.push("DB_PASSWORD is required");
  if (!dbConfig.host) errors.push("DB_HOST is required");
  if (!dbConfig.port || isNaN(dbConfig.port))
    errors.push("DB_PORT must be a valid number");
  if (!dbConfig.database) errors.push("DB_NAME is required");

  if (errors.length > 0) {
    errors.forEach((error) => logger.error(error));
    throw new Error("Invalid environment configuration. See errors above.");
  }
}

validateConfig(CONFIG); // Valider les variables

// Log des informations pour vérifier que la configuration a bien été lue
logger.info("Loaded external configuration:");
logger.info(`HOST: ${CONFIG.HOST}`);
logger.info(`MAIL_CONFIG: ${JSON.stringify(CONFIG.MAIL_CONFIG, null, 2)}`);
logger.info(`DB_CONFIG: ${JSON.stringify(CONFIG.DB_CONFIG, null, 2)}`);

module.exports = CONFIG;
