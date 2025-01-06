const { prepareRegex } = require("../utilities/utils");

class FileDetails {
  constructor(
    name,
    size = 0.0, // Taille par défaut à 0.0
    modifiedAt,
    extension,
    baseName,
    platform_id,
    platform_name,
    match_any_regex = false, // Par défaut à false
    regex = null // Par défaut à null
  ) {
    this.name = name;
    this.size = size;
    this.modifiedAt = modifiedAt;
    this.extension = extension;
    this.baseName = baseName;
    this.platform_id = platform_id;
    this.platform_name = platform_name;
    this.match_any_regex = match_any_regex;
    this.regex = regex ? prepareRegex(regex) : null; // Formater le regex s'il est fourni
  }

  // Fonction pour afficher les détails du fichier sous forme de chaîne
  toString() {
    return `File: ${this.name}, BaseName: ${this.baseName}, Platform: ${this.platform_name}, Match: ${this.match_any_regex}, Regex: ${this.regex}, Size: ${this.size} MB, Modified At: ${this.modifiedAt}, Extension: ${this.extension}`;
  }

  // Fonction pour retourner les détails du fichier sous forme de JSON
  toJson() {
    return {
      name: this.name,
      size: this.size,
      modifiedAt: this.modifiedAt,
      extension: this.extension,
      baseName: this.baseName,
      platform_id: this.platform_id,
      platform_name: this.platform_name,
      match_any_regex: this.match_any_regex,
      regex: this.regex,
    };
  }
}

module.exports = FileDetails;
