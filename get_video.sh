#!/bin/bash

node app-linux.js $1

echo $1
echo "Attendi finchè non scarico il video, potrebbe volerci un po.."

# Leggi il contenuto del file data.mpdurl
mpd_file=$(<data.mpdurl)

# Leggi il contenuto del file data.key
key_file=$(<data.key)

# Leggi il contenuto del file data.filename
filename=$(<data.filename)

# Esegui il comando n_m3u8dl
./N_m3u8DL-RE "$mpd_file" --key "$key_file" --save-name "$filename" -mt -M mp4 -sv best -sa best --del-after-done --log-level=OFF

# Elimina i file
rm -f data.mpdurl data.pssh data.key data.licurl

echo "File .mp4 scaricato con successo!"

echo "Adesso dividiamo il file in pezzi da 45 min ciascuno pronti per l'upload"
./split.sh
