#!/bin/bash
clear 
echo "📦 Instalador de Dependências"
echo "==============================="

# Perguntar qual gerenciador usar
read -p "Usar npm ou yarn? (npm/yarn): " manager

if [[ "$manager" != "npm" && "$manager" != "yarn" ]]; then
  echo "❌ Gerenciador inválido. Use 'npm' ou 'yarn'."
  exit 1
fi

# Lista de dependências
dependencies=(
  "@hapi/boom"
  "@whiskeysockets/baileys"
  "@vitalets/google-translate-api"
  "axios"
  "chalk"
  "fluent-ffmpeg"
  "gtts"
  "moment-timezone"
  "node-fetch"
  "pino"
  "qrcode"
  "qrcode-terminal"
  "yt-search"
  "ytdl-core"
  "cheerio"
  "googleapis"
  "instagram-web-api"
  "megajs"
  "wa-sticker-formatter"
  "gif-encoder-2"
)

echo "📋 Instalando ${#dependencies[@]} pacotes..."

# Instalar dependências
if [[ "$manager" == "npm" ]]; then
  npm init -y 2>/dev/null || true
  npm install "${dependencies[@]}"
else
  yarn init -y 2>/dev/null || true
  yarn add "${dependencies[@]}"
fi

echo "✅ Todas as dependências foram instaladas com sucesso usando $manager!"
echo "📊 Versões instaladas:"
"$manager" list --depth=0 | grep -E "$(echo "${dependencies[@]}" | tr ' ' '|')" || true