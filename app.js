const axios = require('axios');
const https = require('https');
const http = require('http'); // Importa il modulo http per richieste HTTP
const fs = require('fs');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin())


// Controlla se l'URL è stato passato come argomento sennò stampa l'help
checkArguments();

function checkArguments() {
  if (process.argv.length <= 2) {
    console.log("Nessun URL passato allo script. Inserisci un URL come esempio:\n**\nnode app.js https://www.wittytv.it/temptation-island/prima-puntata-martedi-10-settembre/\n**");
    process.exit(1); // Termina lo script con un codice di uscita diverso da 0
  }
}

// Salva argomento in targetURL ed esegui lo scraping
const targetUrl = process.argv[2];
printMpdRequestPssh(targetUrl);

// Se non ci sono argomenti
const arg = process.argv[2];

// Definisci una regex per estrarre la parte desiderata dell'URL
const regex = /https:\/\/www\.wittytv\.it\/[^\/]+\/([^\/]+)\/?/;

// Applica la regex all'argomento
const match = arg.match(regex);

// Dall'argomento estrai il filename e salva il filename dentro data.filename
if (match && match[1]) {
    const extractedPart = match[1];
    //console.log(extractedPart);
    fs.writeFile('data.filename', extractedPart, (err) => {
      if (err) {
        console.error('Errore durante la scrittura del file:', err);
      } else {
        // console.log(`Parte estratta salvata in data.filename: ${extractedPart}`);
      }
    });
} else {
    console.log('URL non valido o parte desiderata non trovata.');
}

// Avvia il browser per estrarre il file MPD
async function printMpdRequestPssh(url) {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true, // Imposta a true per non mostrare il browser
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});
  const page = await browser.newPage();

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  // Inizializza un Set per tenere traccia degli URL già stampati/salvati
  const printedUrls = new Set();
  // Variabile per memorizzare l'URL della licenza catturato
  let capturedLicenseUrl = null;

  page.on('request', async (request) => {
    const url = request.url(); // Prendi l'URL una sola volta

    // Logica esistente per l'URL MPD
    if (url.endsWith('.mpd')) {
      const mpdUrl = url;
      if (!printedUrls.has(mpdUrl)) {
        console.log(`MPD URL: ${mpdUrl}`);
        fs.writeFile('data.mpdurl', mpdUrl, (err) => {
          if (err) {
            console.error('Errore durante la scrittura del file MPD:', err);
          }
        });
        printedUrls.add(mpdUrl);
      }
    }

    // Nuova logica per l'URL della licenza
    if (url.startsWith('https://widevine.entitlement.theplatform.eu/wv/web/ModularDrm/getRawWidevineLicense')) {
      const licenseUrl = url;
      if (!printedUrls.has(licenseUrl)) {
        console.log(`License URL: ${licenseUrl}`);
        fs.writeFile('data.licenseurl', licenseUrl, (err) => {
          if (err) {
            console.error('Errore durante la scrittura del file della licenza:', err);
          }
        });
        printedUrls.add(licenseUrl);
        capturedLicenseUrl = licenseUrl; // Assegna l'URL della licenza alla variabile esterna
      }
    }
  });

await page.goto(url);
console.log("Sto estraendo le chiavi necessarie per il decrypt...per favore attendi...potrebbe volerci 1 o 2 min");
await sleep(4000);

// Verifica se il primo bottone esiste e cliccalo se esiste (es: cookie consent)
const firstButton = await page.$('#rti-privacy-accept-btn-screen1-id');
if (firstButton) {
    await page.click('#rti-privacy-accept-btn-screen1-id');
    //console.log("Primo bottone cliccato.");
} else {
    //console.log("Primo bottone non trovato.");
}

// Aspetta 5 secondi
await sleep(5000);

// Verifica se il secondo bottone esiste e cliccalo se esiste (es: popup)
const secondButton = await page.$('#modalpopup556171 > div > div > div > button');
if (secondButton) {
    await page.click('#modalpopup556171 > div > div > div > button');
    //console.log("Secondo bottone cliccato.");
} else {
    //console.log("Secondo bottone non trovato.");
}

await sleep(35000); // Aspetta 35 secondi
await browser.close();

// Assicurati che printedUrls contenga almeno un URL MPD
if (printedUrls.size === 0) {
  console.error("Nessun URL MPD catturato. Impossibile procedere.");
  return; // Termina la funzione se non ci sono URL MPD
}

// Prendi il primo URL MPD catturato. Nota: Set non garantisce l'ordine, ma per un singolo MPD va bene.
const [MPDurl] = printedUrls; 


// Fai request a MPD ed estrai PSSH e salva dentro psshValue

  async function fetchAndExtractPssh(url) {
    try {
      const response = await axios.get(url);
      const mpdContent = response.data;
  
      // Estrai il contenuto di <cenc:pssh>
      const psshMatch = mpdContent.match(/<cenc:pssh>(.*?)<\/cenc:pssh>/);
      if (psshMatch) {
        const psshValue = psshMatch[1];
        //console.log(`Valore PSSH estratto: ${psshValue}`);
        return psshValue;
      } else {
        console.log('PSSH non trovato nel contenuto MPD.');
        return null;
      }
    } catch (error) {
      console.error('Errore durante il fetch dell\'MPD:', error);
      return null;
    }
  }
  
  // Esegui la richiesta GET all'URL estratto
  const psshValue = await fetchAndExtractPssh(MPDurl);

  // Solo se psshValue e capturedLicenseUrl sono disponibili, procedi
  if (psshValue && capturedLicenseUrl) {
    fs.writeFile('data.pssh', psshValue, (err) => {
      if (err) {
        console.error('Errore durante la scrittura del file PSSH:', err);
      } else {
        // Chiama get_key passando sia psshValue che capturedLicenseUrl
        get_key(psshValue, capturedLicenseUrl); 
      }
    });
  } else {
    console.error("Impossibile estrarre PSSH o License URL. Assicurati che siano stati catturati correttamente.");
  }
}

// GET request per estrarre la key
// Ora la funzione accetta license_url_param come argomento
function get_key(psshkey, license_url_param) { 
    // URL dell'API a cui inviare la richiesta (dal tuo comando curl)
    const api_url = "http://108.181.133.95:8080/wv";
    // Usa l'argomento passato alla funzione per license_url
    const license_url = license_url_param; 
    // Il PSSH viene passato come argomento alla funzione
    const pssh = psshkey;

    console.log("PSSH ricevuto: ", psshkey);
    console.log("License URL ricevuto: ", license_url); // Aggiunto per debug

    // Headers della richiesta (dal tuo comando curl)
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'it,it-IT;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Origin': 'http://108.181.133.95:8080',
        'Pragma': 'no-cache',
        'Referer': 'http://108.181.133.95:8080/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
    };

    // Payload della richiesta (dal tuo comando curl --data-raw)
    // Nota che 'headers' qui è una stringa all'interno del JSON
    const payload = JSON.stringify({
        "license": license_url, // Usa l'URL della licenza passato
        "headers": "accept: \"*/*\"\ncontent-length: \"316\"\nConnection: keep-alive",
        "pssh": pssh, // Usa il psshkey dinamico passato alla funzione
        "buildInfo": "google/sdk_gphone_x86/generic_x86:8.1.0/OSM1.180201.037/6739391:userdebug/dev-keys",
        "proxy": "",
        "cache": true
    });

    // Opzioni per la richiesta HTTP
    const options = {
        method: 'POST',
        headers: headers,
        // Parsa l'URL per ottenere hostname, port e path per http.request
        hostname: new URL(api_url).hostname,
        port: new URL(api_url).port,
        path: new URL(api_url).pathname,
    };

    // Effettua la richiesta HTTP
    const req = http.request(options, (res) => {
        let data = '';

        // Raccogli i dati della risposta
        res.on('data', (chunk) => {
            data += chunk;
        });

        // Quando la risposta è completa
        res.on('end', () => {
            // Controlla se la risposta contiene il tag di successo HTML
            if (data.includes('<h2>SUCCESS</h2>')) {
                // Espressione regolare per trovare il contenuto all'interno dei tag <li>
                const regex = /<li[^>]*>(.*?)<\/li>/g;
                let match;
                const keys = [];

                // Estrai tutte le chiavi trovate
                while ((match = regex.exec(data)) !== null) {
                    keys.push(match[1].trim());
                }

                if (keys.length > 0) {
                    const firstKey = keys[0]; // Prendi la prima chiave
                    console.log("KEY estratta: ", firstKey);

                    // Salva la chiave nel file data.key
                    fs.writeFile('data.key', firstKey, (err) => {
                        if (err) {
                            console.log("Non sono riuscito a salvare la chiave nel file data.key.");
                            console.error('Errore durante la scrittura del file data.key:', err);
                        } else {
                            console.log("Chiave salvata con successo in data.key.");
                        }
                    });
                } else {
                    console.log("Nessuna chiave trovata nella risposta HTML del server.");
                }

                // L'URL della licenza è già noto dal payload della richiesta
                console.log("License URL: ", license_url);
                console.log("Chiavi estratte, adesso scarichiamo il video. (Ci vogliono 5/8 min tra download e muxing - STIMA SU UN VIDEO DI 3 ORE)");

                // Salva l'URL della licenza nel file data.licurl
                fs.writeFile('data.licurl', license_url, (err) => {
                    if (err) {
                        console.error('Errore durante la scrittura del file data.licurl:', err);
                    } else {
                        console.log("License URL salvata con successo in data.licurl.");
                    }
                });
            } else {
                // Se la risposta non contiene il tag di successo, stampa l'intera risposta
                console.log("Risposta inattesa dal server (non è la pagina SUCCESS HTML).");
                console.log("Risposta completa dal server:\n", data);
            }
        });
    });

    // Gestione degli errori della richiesta
    req.on('error', (error) => {
        console.log("C'è stato un errore durante la richiesta HTTP, riprova!.");
        console.error('Errore:', error.message);
    });

    // Invia il payload della richiesta
    req.write(payload);
    // Termina la richiesta
    req.end();
}
