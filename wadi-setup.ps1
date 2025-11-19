param(
  [string]$Mode = "--init"
)

function Section($t) { Write-Host "`n=== $t ===" -ForegroundColor Cyan }
function Ok($t)      { Write-Host "✔ $t" -ForegroundColor Green }
function Warn($t)    { Write-Host "⚠ $t" -ForegroundColor Yellow }
function Err($t)     { Write-Host "❌ $t" -ForegroundColor Red }

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Apps = Join-Path $Root "apps"
$Api  = Join-Path $Apps "api"
$ApiSrc = Join-Path $Api "src"
$ApiBrain = Join-Path $ApiSrc "brain"
$Front = Join-Path $Apps "frontend"
$FrontSrc = Join-Path $Front "src"

function Ensure-Tool($cmd, $name) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Err "$name no está instalado o no está en PATH."
    exit 1
  }
}

function Ensure-Env() {
  Section "Chequeando herramientas"
  Ensure-Tool "node" "Node.js"
  Ensure-Tool "pnpm" "pnpm"
  Ok "Node y pnpm OK"
}

function Do-Init() {
  Ensure-Env
  Section "Creando estructura de monorepo"
  New-Item -ItemType Directory -Force -Path $Apps | Out-Null
  New-Item -ItemType Directory -Force -Path $ApiBrain | Out-Null
  New-Item -ItemType Directory -Force -Path $FrontSrc | Out-Null

@"
packages:
  - 'apps/*'
"@ | Set-Content -Path (Join-Path $Root "pnpm-workspace.yaml") -Encoding UTF8

@"
{
  "name": "wadi-monorepo",
  "private": true,
  "packageManager": "pnpm@10.21.0",
  "scripts": {
    "dev:api": "pnpm --filter api run dev",
    "dev:front": "pnpm --filter frontend run dev"
  }
}
"@ | Set-Content -Path (Join-Path $Root "package.json") -Encoding UTF8

  Do-Backend
  Do-Frontend
  Ok "INIT completo"
}

function Do-Backend() {
  Ensure-Env
  Section "Backend: estructura y archivos"

  New-Item -ItemType Directory -Force -Path $ApiBrain | Out-Null

@"
{
  "name": "api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
  },
  "dependencies": {
    "body-parser": "^2.2.0",
    "cors": "^2.8.5",
    "express": "^5.1.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.5",
    "@types/node": "^24.10.1",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.9.3"
  }
}
"@ | Set-Content -Path (Join-Path $Api "package.json") -Encoding UTF8

@"
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": false,
    "outDir": "dist",
    "types": ["node"]
  },
  "include": ["src"]
}
"@ | Set-Content -Path (Join-Path $Api "tsconfig.json") -Encoding UTF8

@"
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { stylizeReply } from './brain/adaptiveStyle.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(process.cwd(), 'apps/api/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({}), 'utf8');

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '{}');
  } catch { return {}; }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9áéíóúñü\s]/gi, ' ').split(/\s+/).filter(Boolean);
}

function updateProfile(profile, message) {
  const tokens = tokenize(message);
  tokens.forEach(t => profile.wordCounts[t] = (profile.wordCounts[t] || 0) + 1);
  profile.updatedAt = Date.now();
}

function interpretIntent(msg) {
  const m = msg.toLowerCase();
  if (m.includes('idea')) return 'Concepto detectado. ¿Querés que lo estructure?';
  if (m.includes('plan')) return 'Armamos un mini plan: objetivo, acción y métrica.';
  if (m.includes('vender')) return 'Pensá en identidad, gancho y oferta.';
  return 'Anotado. ' + ['👌', '😉', '😎'][Math.floor(Math.random()*3)];
}

app.post('/chat', (req, res) => {
  const userMsg = req.body.message || '';
  const userId = req.body.userId || 'local';
  const users = loadUsers();
  if (!users[userId]) users[userId] = { id: userId, wordCounts: {}, updatedAt: Date.now() };
  updateProfile(users[userId], userMsg);
  saveUsers(users);
  const reply = interpretIntent(userMsg);
  const adaptiveReply = stylizeReply(reply, users[userId]);
  res.json({ answer: adaptiveReply, profile: users[userId] });
});

app.listen(PORT, () => console.log('🚀 API activa en http://localhost:' + PORT));
"@ | Set-Content -Path (Join-Path $ApiSrc "index.ts") -Encoding UTF8

@"
export function stylizeReply(reply, profile) {
  const tone = Math.random();
  if (tone < 0.3) return reply.replace('.', '...');
  if (tone < 0.6) return reply + ' 😎';
  return reply;
}
"@ | Set-Content -Path (Join-Path $ApiBrain "adaptiveStyle.ts") -Encoding UTF8

  Push-Location $Api
  pnpm install | Out-Host
  Pop-Location
  Ok "Backend listo"
}

function Do-Frontend() {
  Ensure-Env
  Section "Frontend: estructura y archivos"

@"
<!doctype html>
<html>
  <head>
    <meta charset='utf-8'/>
    <meta name='viewport' content='width=device-width, initial-scale=1'/>
    <title>WADI</title>
  </head>
  <body style='margin:0;background:#0a0a0f;color:#e5e5e5;font-family:Inter,system-ui,sans-serif'>
    <div id='root'></div>
    <script type='module' src='/src/main.tsx'></script>
  </body>
</html>
"@ | Set-Content -Path (Join-Path $Front "index.html") -Encoding UTF8

@"
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
const el = document.getElementById('root');
createRoot(el).render(<App />);
"@ | Set-Content -Path (Join-Path $FrontSrc "main.tsx") -Encoding UTF8

@"
import React, { useState } from 'react';
const API = 'http://localhost:4000';
export default function App() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  async function send() {
    if (!input.trim()) return;
    const msg = input; setInput('');
    setChat(prev => [...prev, {role:'user', msg}]);
    const res = await fetch(API+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,userId:'local'})});
    const data = await res.json();
    setChat(prev => [...prev,{role:'bot',msg:data.answer}]);
  }
  return (
    <div style={{padding:20}}>
      <h2>Wadi</h2>
      <div>{chat.map((c,i)=><div key={i}><b>{c.role}:</b> {c.msg}</div>)}</div>
      <input value={input} onChange={e=>setInput(e.target.value)} style={{width:'80%'}}/>
      <button onClick={send}>Enviar</button>
    </div>
  );
}
"@ | Set-Content -Path (Join-Path $FrontSrc "App.tsx") -Encoding UTF8

  Push-Location $Front
  pnpm add react react-dom | Out-Host
  pnpm add -D typescript vite @vitejs/plugin-react @types/react @types/react-dom | Out-Host
  Pop-Location
  Ok "Frontend listo"
}

switch ($Mode) {
  "--init"     { Do-Init; break }
  "--backend"  { Do-Backend; break }
  "--frontend" { Do-Frontend; break }
  default      { Warn "Modo no reconocido. Usa --init | --backend | --frontend" }
}

Write-Host "`n✔ Instalación finalizada. Ejecutá pnpm dev:api o pnpm dev:front" -ForegroundColor Green
