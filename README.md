# Witty-Downloader (Solo Windows al momento)

Witty-Downloader è uno strumento potente e semplice da usare per scaricare video da Witty TV. Con questo downloader, puoi facilmente salvare i tuoi programmi preferiti per la visione offline.

## Requisiti

- Node.js
- npm
- N_m3u8dl-re (https://github.com/nilaoda/N_m3u8DL-RE) 
- Bento MP4Decrpt (https://github.com/axiomatic-systems/Bento4/blob/master/Source/C%2B%2B/Apps/Mp4Decrypt/Mp4Decrypt.cpp)

Sia per N_m3u8dl-re che per Bento MP4Decrpt ho gia messo gli eseguibili necessari, in ogni altro caso puoi scarricare e compilare dai relativi sorgenti entrambi gli eseguibili.

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
5. Avvia l'applicazione
     ```bash
     ./get_video.cmd LINK
     ```