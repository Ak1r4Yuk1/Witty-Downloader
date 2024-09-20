@echo off
setlocal enabledelayedexpansion

:: Prendi il nome della puntata
set /p filename=<data.filename

::Comando per dividere il video
ffmpeg -i "!filename!.mp4" -c copy -map 0 -segment_time 2700 -f segment -reset_timestamps 1 "!filename! PART%%03d.mp4"

:Comando per eliminare i files non necessari
del /f /q "data.filename"
rmdir /s /q Logs
