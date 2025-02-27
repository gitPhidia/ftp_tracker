class EmailReport {
  constructor(title, content, signature) {
    this.title = title;
    this.content = content;
    this.signature = signature;
  }

  generateHtml() {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* Général */
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            background-color: #f9f9f9;
            padding: 20px;
          }

          .container {
            width: 900px; /* Largeur fixe pour bien contenir la table */
            margin: auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.1);
          }

          h1 {
            color: #3D3BF3;
            text-align: center;
            font-size: 20px;
          }

          /* Tableaux */
         .table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            table-layout: fixed; /* Fixe la largeur des colonnes */
          }

          .table th, .table td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .table .small-column {
            text-align: center;
          }

          .table .numeric-right {
            text-align: right;
          }

          .table .numeric-center {
            text-align: center;
          }

          .signature {
            margin-top: 20px;
            font-style: italic;
            color: #555;
            text-align: center;
            font-size: 13px;
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
