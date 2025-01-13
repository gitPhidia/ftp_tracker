const { Pool } = require("pg");
const CONFIG = require("../utilities/configReader")

const  DB_CONFIG = CONFIG.DB_CONFIG

// Configurer la connexion à PostgreSQL
const pool = new Pool({
  user: DB_CONFIG.user,
  password: DB_CONFIG.password,
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  database: DB_CONFIG.database,
});

/**
 * Exécute une requête SQL avec des paramètres facultatifs.
 * @param {string} query - La requête SQL à exécuter.
 * @param {Array} params - Les paramètres pour la requête SQL.
 * @returns {Promise<Object>} - Résultat de la requête.
 */
async function executeQuery(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    //console.log(query);
    return result.rows;
  } catch (error) {
    console.error("Error executing query:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Ferme la connexion à la base de données.
 */
async function closeConnection() {
  await pool.end();
}

module.exports = { executeQuery, closeConnection };
