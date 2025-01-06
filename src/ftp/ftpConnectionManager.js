const ftp = require("basic-ftp");
const CONFIG = require("../utilities/configReader"); // Charger les infos depuis .env
const logger = require("../utilities/logger"); // Charger le logger pour les erreurs et les informations



class FTPConnectionManager {


  constructor() {
    this.client = new ftp.Client();
    //this.client.ftp.verbose = true; // Active les logs FTP (optionnel)
  }

  // Établir la connexion au serveur FTP
  async connect() {
    try {
      logger.info("Connecting to FTP server...");
      await this.client.access({
        host: CONFIG.HOST,
        user: CONFIG.USER,
        password: CONFIG.PASSWORD,
        secure: CONFIG.SECURE,
        port: CONFIG.PORT,
        secureOptions: {
          rejectUnauthorized: false, // Disable certificate validation (use cautiously)
        },
      });
      logger.info(`Connected to FTP server: ${CONFIG.HOST}`);
      return this.client;
    } catch (error) {
      logger.error(`Failed to connect to FTP server: ${error.message}`);
      throw new Error("FTP connection failed");
    }
  }

  // Fermer la connexion FTP
  disconnect() {
    try {
      this.client.close();
      logger.info("FTP connection closed.");
    } catch (error) {
      logger.warn(`Error while closing FTP connection: ${error.message}`);
    }
  }
  
}

module.exports = FTPConnectionManager;