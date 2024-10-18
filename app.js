const axios = require('axios');
const https = require('https');
const fs = require('fs');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin())


//Controlla se l'URL è stato passato come argomento sennò stampa l'help
checkArguments();

function checkArguments() {
  if (process.argv.length <= 2) {
    console.log("Nessun URL passato allo script. Inserisci un URL come esempio:\n**\nnode app.js https://www.wittytv.it/temptation-island/prima-puntata-martedi-10-settembre/\n**");
    process.exit(1); // Termina lo script con un codice di uscita diverso da 0
  }
}

//salva pargomento in targetURL ed esegui lo scraping
const targetUrl = process.argv[2];
printMpdRequestPssh(targetUrl);

//Se non ci sono argomenti
const arg = process.argv[2];

// Definisci una regex per estrarre la parte desiderata dell'URL
const regex = /https:\/\/www\.wittytv\.it\/[^\/]+\/([^\/]+)\/?/;

// Applica la regex all'argomento
const match = arg.match(regex);

//Dall'argomento estrai il filename e salva il filename dentro data.filename
if (match && match[1]) {
    const extractedPart = match[1];
    //console.log(extractedPart);
    fs.writeFile('data.filename', extractedPart, (err) => {
      if (err) {
        console.error('Errore durante la scrittura del file:', err);
      } else {
        
      }
    });
} else {
    console.log('URL non valido o parte desiderata non trovata.');
}

//Avvia il browser per estrarre il file MPD
async function printMpdRequestPssh(url) {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});
  const page = await browser.newPage();

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  //salva MDP url nella variabile printedUrls
  const printedUrls = new Set();
  
  page.on('request', async (request) => {
    //console.log(request.url())
    if (request.url().endsWith('.mpd')) {
      const mpdUrl = request.url();
      if (!printedUrls.has(mpdUrl)) {
          console.log(`MPD URL: ${mpdUrl}`);
          fs.writeFile('data.mpdurl', mpdUrl, (err) => {
            if (err) {
              console.error('Errore durante la scrittura del file:', err);
            }
          });
          printedUrls.add(mpdUrl); // Aggiungi l'URL all'insieme
        }
    }
});

await page.goto(url);
console.log("Sto estraendo le chiavi necessarie per il decrypt...per favore attendi...potrebbe volerci 1 o 2 min");
await sleep(4000);

// Verifica se il primo bottone esiste e cliccalo se esiste
const firstButton = await page.$('#rti-privacy-accept-btn-screen1-id');
if (firstButton) {
    await page.click('#rti-privacy-accept-btn-screen1-id');
    //console.log("Primo bottone cliccato.");
} else {
    //console.log("Primo bottone non trovato.");
}

// Aspetta 5 secondi
await sleep(5000);

// Verifica se il secondo bottone esiste e cliccalo se esiste
const secondButton = await page.$('#modalpopup556171 > div > div > div > button');
if (secondButton) {
    await page.click('#modalpopup556171 > div > div > div > button');
    //console.log("Secondo bottone cliccato.");
} else {
    //console.log("Secondo bottone non trovato.");
}

console.log("Manca poco...");
await sleep(35000); // Aspetta 35 secondi
await browser.close();
const [MPDurl] = printedUrls;


//fai request a MPD ed estrai PSSH e salva dentro psshValue

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
      console.error('Errore durante il fetch:', error);
      return null;
    }
  }
  
  // Esegui la richiesta GET all'URL estratto
  const psshValue = await fetchAndExtractPssh(MPDurl);
  fs.writeFile('data.pssh', psshValue, (err) => {
    if (err) {
      console.error('Errore durante la scrittura del file:', err);
    } else {
      get_key(psshValue)
    }
  });
  

}

//GET request per estrarre la key

function get_key(psshkey){
  const api_url = "https://keysdb.net/api";
  const license_url = "https://cwip-shaka-proxy.appspot.com/no_auth";
  const pssh = psshkey;
  console.log("PSSH: ", psshkey)
  const headers = {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (Ktesttemp, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
      "Content-Type": "application/json",
      "X-API-Key": '5d495f0922131a61bf595fef94828be247765ffae86c6f003c40b0c8112cdfaa',
  };
  const payload = JSON.stringify({
      "license_url": license_url,
      "pssh": pssh,
  });
  
  const options = {
      method: 'POST',
      headers: headers,
  };
  
  const req = https.request(api_url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
          data += chunk;
      });
  
      res.on('end', () => {
          const response = JSON.parse(data);
          const firstKey = response.keys[0].key;
          const licenseURL = response.keys[0].license_url
          console.log("KEY: ", firstKey);
          fs.writeFile('data.key', firstKey, (err) => {
            if (err) {
              console.log("Non sono riuscito a trovare la chiave, riprova!.")
              //console.error('Errore durante la scrittura del file:', err);
            } else {
            }
          });
          console.log("License URL:", licenseURL)
          console.log("Chiavi estratte, adesso scarichiamo il video")
          fs.writeFile('data.licurl', licenseURL, (err) => {
            if (err) {
              console.error('Errore durante la scrittura del file:', err);
            } else {
            }
          });
      });
  });
  
  req.on('error', (error) => {
    console.log("C'è stato un errore, riprova!."); 
    //console.error('Error:', error);
  });
  
  req.write(payload);
  req.end();
  
  
}


