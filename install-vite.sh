#!/bin/bash
cd "$(dirname "$0")"
rm -rf node_modules/vite
mkdir -p node_modules/vite
cd node_modules/vite
npm pack vite@4.4.5 2>/dev/null
tar -xzf vite-4.4.5.tgz --strip-components=1
rm vite-4.4.5.tgz
cd ../..
mkdir -p node_modules/.bin
ln -sf ../vite/bin/vite.js node_modules/.bin/vite
chmod +x node_modules/.bin/vite
echo "Vite installed manually"
