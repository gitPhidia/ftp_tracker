









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
    <table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
      <thead>
        <tr>
          <th style="background-color: red; color: white; padding: 10px; text-align: left;">
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
          <td>${formatDateFr(file.inserted_at)}</td>
          <td>${file.platform_name}</td>
          <td style="text-align: right;">${formatSizeToTwoDecimals(
            file.size
          )} Mo</td>
        </tr>
      `
    )
    .join("");

  return `
    <table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
      <thead>
        <tr>
          <th>Nom de la base</th>
          <th>Nom du Fichier</th>
          <th>Date d'Insertion</th>
          <th>Application</th>
          <th style="width: 8%; text-align: right;">Taille</th>
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