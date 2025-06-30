@echo off
setlocal enabledelayedexpansion

:: Esegue lo script Node.js per estrarre MPD, PSSH e Key
node app.js %1

echo Attendi finchè non scarico il video, potrebbe volerci un po'..

:: Leggi il contenuto del file data.mpdurl
set /p mpd_file=<data.mpdurl

:: Leggi il contenuto del file data.key
set /p key_file=<data.key

:: Leggi il contenuto del file data.filename
set /p filename=<data.filename

:: Esegui il comando n_m3u8dl per scaricare e decriptare il video
N_m3u8DL-RE.exe "!mpd_file!" --key "!key_file!" --save-name "!filename!" -mt -M mp4 -sv best -sa best --del-after-done --log-level=OFF --thread-count 32

@echo off

:: Elimina i file temporanei
del /f /q "data.mpdurl"
del /f /q "data.pssh"
del /f /q "data.key"
del /f /q "data.licurl"
del /f /q "data.filename"
del /f /q "data.licenseurl"

echo File .mp4 scaricato con successo!

:: Chiede all'utente se vuole dividere il file
echo.
set /p split_choice="Vuoi dividere il file in pezzi da 45 min ciascuno pronti per l'upload? (s/n): "

:: Converte l'input in minuscolo per un confronto case-insensitive
if /i "!split_choice!"=="s" (
    echo Adesso dividiamo il file...
    call split.cmd
) else if /i "!split_choice!"=="n" (
    echo Finito :D
) else (
    echo Scelta non valida. La divisione del file e' stata annullata.
)

endlocal
