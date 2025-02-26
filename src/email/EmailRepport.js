class EmailReport {
  /**
   * Constructeur du rapport d'email
   * @param {string} title - Le titre du rapport
   * @param {string} content - Le contenu HTML du rapport
   * @param {string} signature - La signature du mail
   */
  constructor(title, content, signature) {
    this.title = title;
    this.content = content;
    this.signature = signature;
  }

  /**
   * Génère le HTML final du mail avec les styles appliqués
   * @returns {string} - HTML complet du mail
   */
  generateHtml() {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #d9534f;
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #d9534f;
            color: white;
            text-transform: uppercase;
          }
          .signature {
            margin-top: 30px;
            font-style: italic;
            color: #555;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${this.title}</h1>
          <div>${this.content}</div>
          <div class="signature">${this.signature}</div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = EmailReport;
