#!/bin/bash

# Trouver tous les fichiers route.ts et les renommer en route.js
find src/app -name "route.ts" -type f | while read file; do
    newfile="${file%.ts}.js"
    echo "Renommage de $file en $newfile"
    mv "$file" "$newfile"
done

echo "Conversion terminée !" 