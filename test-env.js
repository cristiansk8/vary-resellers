// En el nuevo archivo: test-env.js

require('dotenv').config();

const myApiKey = process.env.GEMINI_API_KEY;

console.log("--- Probando la lectura del archivo .env ---");

if (myApiKey) {
  console.log("✅ ¡Éxito! La API Key fue encontrada.");
  console.log("   El valor encontrado empieza con:", myApiKey.substring(0, 5) + "..."); // Mostramos solo una parte por seguridad
} else {
  console.log("❌ ¡Fallo! La API Key NO fue encontrada en process.env.");
  console.log("   Revisa los puntos de la checklist de abajo.");
}

console.log("-----------------------------------------");