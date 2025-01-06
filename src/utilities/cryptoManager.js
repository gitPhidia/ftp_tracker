require("dotenv").config();
const crypto = require("crypto");


// Générer une clé secrète aléatoire de 32 octets (256 bits)
//const SECRET_KEY = crypto.randomBytes(32).toString("hex");

// Afficher la clé générée
//console.log("Generated SECRET_KEY:", SECRET_KEY);


// Vérifiez que la clé secrète est définie et a la bonne longueur
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY || SECRET_KEY.length !== 64) {
  // 64 caractères hex = 32 octets
  throw new Error("SECRET_KEY must be defined and 32 bytes long");
}

// Fonction pour chiffrer le mot de passe
const encryptPassword = (password) => {
  const iv = crypto.randomBytes(16); // Génère un vecteur d'initialisation
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY, "hex"),
    iv
  );

  let encrypted = cipher.update(password, "utf-8", "hex");
  encrypted += cipher.final("hex");

  // Retourne le vecteur d'initialisation et le mot de passe chiffré
  return iv.toString("hex") + ":" + encrypted;
};

// Fonction pour déchiffrer le mot de passe
const decryptPassword = (encryptedPassword) => {
  const [iv, encryptedText] = encryptedPassword.split(":");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
};



module.exports = {
  encryptPassword,
  decryptPassword,
};
