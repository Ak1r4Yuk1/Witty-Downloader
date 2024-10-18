@echo off
setlocal enabledelayedexpansion

node app.js %1

echo Attendi finchè non scarico il video, potrebbe volerci un po..
:: Leggi il contenuto del file data.mpdurl
set /p mpd_file=<data.mpdurl

:: Leggi il contenuto del file data.key
set /p key_file=<data.key

:: Leggi il contenuto del file data.filename
set /p filename=<data.filename

:: Esegui il comando n_m3u8dl

N_m3u8DL-RE.exe "!mpd_file!" --key "!key_file!" --save-name "!filename!" -mt -M mp4 -sv best -sa best --del-after-done --log-level=OFF

@echo off

:: Elimina i file

del /f /q "data.mpdurl"
del /f /q "data.pssh"
del /f /q "data.key"
del /f /q "data.licurl"

echo File .mp4 scaricato con successo!

echo Adesso dividiamo il file in pezzi da 45 min ciascuno pronti per l'upload
split.cmd

endlocal

