
const {
  formatDateFr,
  formatSizeString,
  formatSizeToTwoDecimals,
} = require("../utilities/utils");








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
    <table border="1" class="table">
      <thead>
        <tr>
          <th style="background-color: #FF2929; color: white; padding: 10px; text-align: left;">
            Nom de la base
          </th>
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
          <td class="small-column">${file.platform_name}</td>
          <td class="numeric-right">${formatSizeToTwoDecimals(
            file.size
          )} Mo</td>
        </tr>
      `
    )
    .join("");

  return `
      <table class="table">
        <thead>
          <tr>
            <th style="width: 35%;">Nom de la base</th> 
            <th style="width: 35%;">Nom du Fichier</th>
            <th class="small-column" style="width: 10%;">Application</th> 
            <th class="numeric-right" style="width: 15%;">Taille</th> 
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
  `;
};




const generateCombinedReportContentHtml = (missingFilesList, receivedFilesList) => {
    const tableHtmlMissing = generateMissingFilesTable(missingFilesList);
    const tableHtmlReceived = generateReceivedFilesTable(receivedFilesList);
    const html = `

        <h3>Fichiers Manquants</h3>
            ${tableHtmlMissing}
        <h3>Fichiers Reçus</h3>
            ${tableHtmlReceived}
    `;

    return html;
}


module.exports = { generateCombinedReportContentHtml };