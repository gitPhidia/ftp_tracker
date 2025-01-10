/**
 * Convertit une taille en bytes en megabytes.
 * @param {number} bytes - La taille en bytes.
 * @returns {number} - La taille convertie en megabytes.
 */
function bytesToMegabytes(bytes) {
  if (typeof bytes !== "number" || bytes < 0) {
    throw new Error("Invalid input: bytes must be a non-negative number");
  }
  return bytes / (1024 * 1024);
}

/**
 * Convertit une taille en bytes en Mo (mégaoctets).
 * @param {number} bytes - La taille en bytes.
 * @returns {number} - La taille convertie en Mo (nombre à deux décimales).
 */
function bytesToMo(bytes) {
  if (typeof bytes !== "number" || bytes < 0) {
    throw new Error("La taille doit être un nombre non négatif.");
  }
  return parseFloat((bytes / (1024 * 1024)).toFixed(2)); // Conversion et arrondi
}


/**
 * Prépare la regex en remplaçant les doubles barres obliques inversées par une seule.
 * @param {string} regexPattern - Le pattern regex à préparer.
 * @returns {RegExp} - La regex prête à être utilisée dans JavaScript.
 */
function prepareRegex(regexPattern) {
  // Remplacer les doubles barres obliques inversées par une seule pour JavaScript
  const preparedPattern = regexPattern.replace(/\\\\/g, '\\');
  return new RegExp(preparedPattern);
}


/**
 * Vérifie si une chaîne correspond à une regex préparée.
 * @param {string} str - La chaîne à vérifier.
 * @param {string} regexPattern - Le pattern regex à utiliser.
 * @returns {boolean} - Si la chaîne correspond à la regex.
 */
function matchesRegex(str, regexPattern) {
  const regex = prepareRegex(regexPattern);
  return regex.test(str);
}
/**
 * Extrait le baseName d'une chaîne en utilisant une regex.
 * @param {string} str - La chaîne à analyser.
 * @param {string} regexPattern - Le pattern regex pour extraire le baseName.
 * @returns {string|null} - Le baseName extrait ou null si aucune correspondance.
 */
function extractBaseName(str, regexPattern) {
  const regex = new RegExp(prepareRegex(regexPattern));
  const match = str.match(regex);
  return match ? match.groups.baseName : null;
}




const formatDateFr = (dateInput) => {
  // Si l'entrée est une chaîne de caractères, la convertir en objet Date
  const dateObj = new Date(dateInput);

  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) {
    throw new Error("La date fournie n'est pas valide.");
  }

  // Formatage de la date en français
  return dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",  // Jour de la semaine en long (ex: lundi, mardi)
    year: "numeric",  // Année en format numérique (ex: 2025)
    month: "long",    // Mois en format long (ex: janvier, février)
    day: "numeric",   // Jour du mois en format numérique (ex: 8)
  });
};

module.exports = {
  bytesToMegabytes,
  bytesToMo,
  matchesRegex,
  extractBaseName,
  prepareRegex,
  formatDateFr
};
