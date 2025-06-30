#!/bin/bash

# Esegue lo script Node.js per estrarre MPD, PSSH e Key
node app-linux.js "$1"

echo "$1"
echo "Attendi finchè non scarico il video, potrebbe volerci un po'.."

# Leggi il contenuto del file data.mpdurl
mpd_file=$(<data.mpdurl)

# Leggi il contenuto del file data.key
key_file=$(<data.key)

# Leggi il contenuto del file data.filename
filename=$(<data.filename)

# Esegui il comando n_m3u8dl per scaricare e decriptare il video
./N_m3u3DL-RE "$mpd_file" --key "$key_file" --save-name "$filename" -mt -M mp4 -sv best -sa best --del-after-done --log-level=OFF --thread-count 32

# Elimina i file temporanei
rm -f data.mpdurl data.pssh data.key data.licurl data.filename data.licenseurl

echo "File .mp4 scaricato con successo!"

# Chiede all'utente se vuole dividere il file
echo ""
read -p "Vuoi dividere il file in pezzi da 45 min ciascuno pronti per l'upload? (s/n): " split_choice

# Converte l'input in minuscolo per un confronto case-insensitive
split_choice=$(echo "$split_choice" | tr '[:upper:]' '[:lower:]')

if [[ "$split_choice" == "s" ]]; then
    echo "Adesso dividiamo il file..."
    ./split.sh
elif [[ "$split_choice" == "n" ]]; then
    echo "Divisione del file annullata."
else
    echo "Scelta non valida. La divisione del file e' stata annullata."
fi

