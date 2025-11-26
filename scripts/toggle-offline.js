#!/usr/bin/env node

/**
 * WADI Offline Mode Toggle
 * Script para activar/desactivar el modo offline para desarrollo
 */

const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');

function toggleOfflineMode() {
  try {
    let envContent = fs.readFileSync(ENV_PATH, 'utf-8');
    
    const currentMode = envContent.match(/OFFLINE_MODE=(true|false)/);
    
    if (!currentMode) {
      console.error('❌ OFFLINE_MODE no encontrado en .env');
      process.exit(1);
    }
    
    const isOffline = currentMode[1] === 'true';
    const newMode = !isOffline;
    
    envContent = envContent.replace(
      /OFFLINE_MODE=(true|false)/,
      `OFFLINE_MODE=${newMode}`
    );
    
    fs.writeFileSync(ENV_PATH, envContent);
    
    console.log(`\n✅ Modo offline ${newMode ? 'ACTIVADO' : 'DESACTIVADO'}`);
    console.log(`\n${newMode ? '🔴' : '🟢'} Estado: ${newMode ? 'SIN INTERNET (modo mock)' : 'CON INTERNET (API real)'}`);
    console.log('\n💡 Recordá reiniciar el backend para aplicar los cambios:');
    console.log('   pnpm dev:api\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar
toggleOfflineMode();
