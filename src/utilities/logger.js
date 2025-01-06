const path = require("path");
const fs = require("fs");
const winston = require("winston");

// Utiliser le répertoire courant de l'application, là où .env est situé
const logPath = path.join(process.cwd(), "logs"); // Générer le chemin des logs dans le même dossier que .env

// Créer le répertoire des logs s'il n'existe pas
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath, { recursive: true });
}

// Créer un logger avec winston qui enregistre dans un fichier et dans la console
const logger = winston.createLogger({
  level: "info", // Niveau de log (info, debug, warn, error)
  format: winston.format.combine(
    winston.format.timestamp(), // Ajouter un timestamp à chaque log
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }) // Format lisible pour les humains
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logPath, "app.log") }), // Fichier de log
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Ajouter des couleurs pour chaque niveau de log
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }), // Affichage dans la console
  ],
});

module.exports = logger;
