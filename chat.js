// En chat.js

require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require('readline');

async function main() {
  try {
    console.log("Checkpoint 1: Script iniciado.");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Error: La variable de entorno GEMINI_API_KEY no se encontró.");
      return;
    }
    console.log("Checkpoint 2: API Key cargada correctamente.");

    // --- INICIO DEL BLOQUE DE DEPURACIÓN ---
    console.log("\n======================================================");
    console.log("DEPURACIÓN: Verificando la API Key que se usará.");
    console.log(`Tu clave empieza con: '${apiKey.substring(0, 5)}'`);
    console.log(`Tu clave termina con: '${apiKey.substring(apiKey.length - 5)}'`);
    console.log(`Longitud total de la clave: ${apiKey.length} caracteres.`);
    console.log(">>> Por favor, compara esto con la clave real en Google AI Studio.");
    console.log("======================================================\n");
    // --- FIN DEL BLOQUE DE DEPURACIÓN ---

    const genAI = new GoogleGenerativeAI(apiKey);
    // ... el resto del script no cambia ...

  } catch (error) {
    console.error("\n❌ Ocurrió un error CRÍTICO durante la inicialización del chat:", error.message);
  }
}

main();