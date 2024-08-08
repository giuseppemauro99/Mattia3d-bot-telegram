// utils.js

const puppeteer = require('puppeteer');
const axios = require('axios');
const util = require('util');
var fs = require('fs');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = '-1002240721880';

// Create a global browser variable so puppeteer can run in the background and be accessed by other scripts (ie - puppeteer.js)
let browser;

async function launchBrowser() {
  if (!browser) {
    console.log("Creating browser object");
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu'
      ],
      headless: 'new' // Enable new Headless mode
    });
  }

  return browser;
}

async function testFunction() {
  // Get the existing Puppeteer browser instance
  const browser = await launchBrowser();

  // Check if the browser is initialized
  if (!browser) {
    console.error('Puppeteer browser is not initialized. Run the --run command first.');
    process.exit(1); // Exit with error status code
  }

  // Create a new page (tab) in the browser
  const page = await browser.newPage();

  // Navigate to the specified URL
  await page.goto('https://makerworld.com/en/@ValeriaMomo', {waitUntil: 'load', timeout: 0});

  // Take a screenshot of the page and save it to a file named 'example.png'
  await page.screenshot({ path: 'example.png' });

  
  const AllModels = await page.evaluate(() =>{
    //Estrai tutte i box dedicati ai modelli
    let img = document.querySelectorAll('.gif-image.lazy.portal-css-1e5ufbu');
    objToSend = [];

    for (const bx of img) {
      let src = bx.getAttribute('src').trim();
      let text = bx.getAttribute('alt').trim();
      objToSend.push({src: src, text: text});
    }
    return objToSend;
  });

  // Log the array of links to the console
  console.log(JSON.stringify(AllModels, null, 4));
  console.log('Trovati ' + AllModels.length + ' elementi');

  //Leggi dal file
  let AlreadyPostedObj = [];
  if (fs.existsSync('data/sended_post.json')){//Se il file esiste
    let rawdata = fs.readFileSync('data/sended_post.json');
    AlreadyPostedObj= JSON.parse(rawdata);
    console.log(AlreadyPostedObj);
  }
  console.log('Letti ' + AlreadyPostedObj.length + ' record dal file'); 

  for (const model of AllModels) {
    //Se non è presente nei file già inviati
    if(AlreadyPostedObj.find(x => x.src == model.src) == undefined){
      console.log('Oggetto: ' + model.src + ' ' + model.text + ' non presente nei file già inviati, devo inviarlo');
      await sendMsgOnTelegram(model.src, model.text);
    }
  }

  //Write all sended post to json to keep track of already sent model
  fs.writeFile ("data/sended_post.json", JSON.stringify(AllModels), function(err) {
      if (err) throw err;
      console.log('Write on json completed');
    }
  );
  
  // Close the page (tab)
  await page.close();

  console.log('Extraction and sent on telegram was successful.');
}

async function sendMsgOnTelegram(photoUrl, caption){
  const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

  try {
      const response = await axios.post(telegramUrl, {
          chat_id: CHAT_ID,
          photo: photoUrl,
          caption: caption
      });

      console.log('Foto inviata con successo');
  } catch (error) {
      console.error('Errore nell\'invio della foto a Telegram:', error.response ? error.response.data : error.message);
  }
}

module.exports = {
  launchBrowser,
  testFunction
};
