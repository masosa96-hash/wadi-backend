#!/bin/bash

echo "Instalando pnpm..."
npm install -g pnpm || true

echo "Instalando dependencias del monorepo..."
pnpm install

echo "Levantando backend en 4000..."
pnpm --filter api dev &

echo "Levantando frontend en 5173..."
pnpm --filter frontend dev
