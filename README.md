# Witty-Downloader (Windows e Linux)

Witty-Downloader è uno strumento potente e semplice da usare per scaricare video da Witty TV. Con questo downloader, puoi facilmente salvare i tuoi programmi preferiti per la visione offline.

NOTA: Se lo script non funziona usa una VPN

## Requisiti

- Node.js
- npm
- N_m3u8dl-re (https://github.com/nilaoda/N_m3u8DL-RE) 
- Bento MP4Decrpt (https://github.com/axiomatic-systems/Bento4/blob/master/Source/C%2B%2B/Apps/Mp4Decrypt/Mp4Decrypt.cpp)

Sia per N_m3u8dl-re che per Bento MP4Decrpt ho gia messo gli eseguibili necessari, in ogni altro caso puoi scaricare e compilare dai relativi sorgenti entrambi gli eseguibili.

## Installazione

1. Scarica e installa Node.js e npm dal sito ufficiale.
2. Clona questo repository:
   ```bash
   git clone https://github.com/tuo-username/witty-downloader.git
   ```

3. Accedi alla directory del progetto
    ```bash
    cd witty-downloader
    ```
4. Installa le dipendenze necessarie
     ```bash
     npm install 
     ```
5. Su linux devi anche installare mp4decrypt e chromium-browser
     ```bash
     Scarica e compila seguendo questo link: https://github.com/axiomatic-systems/Bento4
     sudo apt-get install chromium-browser -y
     ```
6. Avvia l'applicazione (Windows)
     ```bash
     ./get_video.cmd LINK
     ```
6. Avvia l'applicazione (Linux)
     ```bash
     ./get_video.sh LINK
     ```
