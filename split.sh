#!/bin/bash

# Prendi il nome della puntata
filename=$(<data.filename)

# Comando per dividere il video
ffmpeg -i "${filename}.mp4" -c copy -map 0 -segment_time 2700 -f segment -reset_timestamps 1 "${filename} PART%03d.mp4"

# Comando per eliminare i file non necessari
rm -rf Logs
