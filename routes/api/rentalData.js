var express = require("express");
//for scraping SPA's
const puppeteer = require("puppeteer");
//for scraping SSR sites
const axios = require("axios");
const cheerio = require("cheerio");

const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: "AKIASWDEI5KKSVZIYCST",
  secretAccessKey: "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",
});

const BUCKET = 'ahcl-screenshots';

const uploadFile = (filePath, keyName) => {
  return new Promise((resolve, reject) => {
    try {
      var fs = require('fs');
      const file = fs.readFileSync(filePath);
      const BUCKET = 'ahcl-screenshots';

      const uploadParams = {
        Bucket: BUCKET,
        Key: keyName,
        Body: file
      };

      s3.upload(uploadParams, function (err, data) {
        if (err) {
          return reject(err);
        }
        if (data) {
          return resolve(data);
        }
      });
    } catch (err) {
      return reject(err);
    }
  })
};
//how to upload
//call('filepath','key');
//uploadFile('C:/Users/kyled/Documents/Waverly Menu/menuFiles/Assets/menuBackground.jpg', 'menuBackground.jpg');
//how to get




var router = express.Router();
//let rentalData = require('../../public/json/rentalData.json')
const RentalData = require("../../models/rentalData");
const HousingType = require("../../models/housingType");
const Municipality = require("../../models/municipality");
const StratifiedArea = require("../../models/stratifiedArea");
const UnitSize = require("../../models/unitSize");
const AgSecureListings = require("../../models/agSecureListings");
const { error } = require("console");
let objectIds = [];

/* GET /RentalData  */
router.get("/", async function (req, res, next) {
  var list = [];
  let agrentalData = await AgSecureListings.find({});

  for (const listing of agrentalData) {
    let tempObj = {
      "collectedFrom": listing.source,
      "dateCollected": listing.dateCollected,
      "address": listing.location.address,
      "area": listing.location.stratifiedArea,
      "municipality": listing.location.municipality,
      "geolocation": listing.location.geolocation,
      "bedrooms": listing.bedrooms,
      "rent": listing.rent,
      "rentFrequency": listing.rentFrequency,
      "unitSize": listing.unitSize,
      "description": listing.description,
      "utilitiesIncluded": listing.utilities.included,
      "utilitiesAdditional": listing.utilities.additional,
      "avaibility": listing.avaibility
    }
    await list.push(JSON.stringify(tempObj));
  }

  //remove duplicated by making a set from the list of stringified objects
  var uniqueListSet = new Set(list);

  //convert the set back to an array, stringify the array and parse that as json
  var uniqueListObj = JSON.parse(JSON.stringify(Array.from(uniqueListSet)));

  //send a response code of 200 for ok and respon with json and the object we just made
  res.status(200).json(uniqueListObj);

});

router.post("/sample", async (req, res, next) => {
  getAGSecureData();
});

let getAGSecureData = async () => {
  let baseURL = "https://www.agsecure.ca";
  const cities = [
    { endPoint: "Alliston", municipality: "New Tecumseth", stratifiedArea: "Bradford" },
    { endPoint: "Angus", municipality: "Essa", stratifiedArea: "Barrie" },
    { endPoint: "Barrie", municipality: "Barrie", stratifiedArea: "Barrie" },
    { endPoint: "Bradford", municipality: "Bradford West Gwillimbury", stratifiedArea: "Bradford" },
    { endPoint: "Collingwood", municipality: "Collingwood", stratifiedArea: "Collingwood" },
    { endPoint: "friday-harbour", municipality: "Innisville", stratifiedArea: "Barrie" },
    { endPoint: "Innisfil", municipality: "Innisfil", stratifiedArea: "Barrie" },
    { endPoint: "Midland", municipality: "Midland", stratifiedArea: "Midland" },
    { endPoint: "Orillia", municipality: "Orillia", stratifiedArea: "Orillia" },
    { endPoint: "Wasaga", municipality: "Wasaga Beach", stratifiedArea: "Collingwood" }];

  console.log(`fetching data for all the cities... please wait...`);

  for (const city of cities) {
    const url = `https://www.agsecure.ca/listings/${city.endPoint}/`;
    await agSecureFetch1(url, baseURL, city);
  }

  console.log(`DONE - fetching data for all the cities...`);
  console.log(`fetching Secondary data for all new OBJS`);

  for (const id of objectIds) {
    let tempObj = await AgSecureListings.findById(id);
    //perform another fetch on full listing and grab the rest of the data
    if(tempObj){
      if(tempObj.listingURL){
        await agSecureFetch2(tempObj.listingURL, tempObj._id);
      }
    }
  }
  console.log(`DONE - fetching Secondary data for all new OBJS`);
};


let agSecureFetch1 = async (url, baseUrl, city) => {
  try {
    const response = await axios.get(url);
    ////console.log(response);
    const $ = cheerio.load(response.data);
    ////console.log($);
    const noOfProperties = $(".listing");
    //console.log(`${noOfProperties.length} are open for rent in ${city.endPoint} in ${city.municipality} in ${city.stratifiedArea} on ${url}`);

    for (let i = 0; i < noOfProperties.length; i++) {
      let priceSpan = $(noOfProperties[i].children[3].children[3]).text();
      indexOfDollarSign = priceSpan.indexOf("$");
      let indexOfFirstSpace = priceSpan.indexOf(" ");
      indexOfPer = priceSpan.indexOf("per ");

      let priceDollars = priceSpan.slice(
        indexOfDollarSign + 1,
        indexOfFirstSpace
      );
      let period = priceSpan.slice(indexOfPer + 4);
      let address = $(noOfProperties[i].children[3].children[1].children[0]).text();
      address = address.trim();
      let unitSize = $(noOfProperties[i].children[3].children[9].children).text();
      unitSize = unitSize.replace(/\s+/g, ' ').replace(' READ MORE', '').trim();
      let pttrn = /^\s*/;
      let spacesBeforeText = String(unitSize).match(pttrn)[0].length;
      let numberOfBedrooms = unitSize.slice(spacesBeforeText, spacesBeforeText + 1);
      numberOfBedrooms = (numberOfBedrooms === 'b' || numberOfBedrooms === 'B') ? 1 : numberOfBedrooms;
      let adLink = `${baseUrl}${$(noOfProperties[i].children[3].children[9].children[3].children[0]).attr("href")}`;


      //console.log(`numberOfBedrooms: ${numberOfBedrooms}`);
      //console.log(`unitSize: ${unitSize} `);
      //console.log(address);
      //console.log(`price: ${priceDollars}`);
      //console.log(`period ${period}`);
      //console.log(`adLink  ${adLink}`);

      // populate object from noOfProperties[i]
      let tempObject = {
        source: `${baseUrl}`,
        listingURL: `${adLink}`,
        dateCollected: Date.now(),
        LastUpdated: Date.now(),
        updated: false,
        location: {
          stratifiedArea: `${city.stratifiedArea}`,
          municipality: `${city.municipality}`,
          address: `${address}`,
          geolocation: `0, 0`, // in 3rd script of map = start_lat / start_long // from 2nd listing page
        },
        bedrooms: `${numberOfBedrooms}`,
        rent: `${priceDollars}`,
        rentFrequency: `${period}`,
        unitSize: `${unitSize}`,
        description: ``, // from 2nd listing page
        utilities: { // from 2nd listing page
          included: 'unknown',// from 2nd listing page
          additional: [],// from 2nd listing page
        },
        avaibility: `${''}`,// from 2nd listing page
        screenshot: ``, // puppeteer or ?
      };



      //check if this listing already exists in the databse, and if it does update that record
      try {
        let tempFetch = await AgSecureListings.findOne({ 'location.address': address });
        console.log(tempFetch._id);
        if (tempFetch._id == undefined) {
          throw new Error('No matching record found, throwing error and creating one from catch instead');
        }
        else {
          // get & update db object if there was a matching record
          await AgSecureListings.findById(tempFetch._id)
            .then(async (dbObj) => {
              dbObj.dateCollected = tempFetch.dateCollected;
              dbObj.listingURL = tempObject.listingURL;
              dbObj.updated = true;
              dbObj.LastUpdated = Date.now();
              dbObj.location.stratifiedArea = Array.from(new Set([...dbObj.location.stratifiedArea, ...tempObject.location.stratifiedArea]));
              dbObj.location.municipality = Array.from(new Set([...dbObj.location.municipality, ...tempObject.location.municipality]));
              dbObj.bedrooms = tempObject.bedrooms;
              dbObj.rent = tempObject.rent;
              dbObj.rentFrequency = tempObject.rentFrequency;
              dbObj.unitSize = tempObject.unitSize;
              await AgSecureListings.findOneAndUpdate(tempFetch._id, dbObj);
              objectIds = [tempFetch._id, ...objectIds];
            });
        }
      }// If no matching record is found, create a new database record instead
      catch {
        let tempDBoBJ = await new AgSecureListings(tempObject).save();
        objectIds = [tempDBoBJ._id, ...objectIds];
      }
    }
  } catch (e) {
    console.error(`Error while fetching rental properties for ${city} on ${url}`);
    console.error(e);
  }
};

let agSecureFetch2 = async (url, id) => {
  //function level consts
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const listingLeft = $(".listing-left");
  const listingMaps = $(".listing-map");

  //function level vars
  let description;
  let avaibility;
  let UtilitiesIncluded;
  let AdditionalUtilities = [];
  let lat;
  let long;

  // to get geolocation
  for (let i = 0; i < listingMaps.length; i++) {
    let listingMapScripts = $(listingMaps[i]).children('script');
    let scriptText = $(listingMapScripts[2]).html();
    let indexOfLatStart = scriptText.indexOf('var start_lat = ');
    let indexOfLatEnd = scriptText.indexOf(';', indexOfLatStart);
    let indexOfLongStart = scriptText.indexOf('var start_long = ');
    let indexOfLongEnd = scriptText.indexOf(';', indexOfLongStart);
    lat = scriptText.slice(indexOfLatStart + 16, indexOfLatEnd);
    long = scriptText.slice(indexOfLongStart + 17, indexOfLongEnd);
  }



  for (let i = 0; i < listingLeft.length; i++) {
    // to get description
    let listingDescription = String($(listingLeft[i]).text());
    description = listingDescription;
    description = description.replace(/\s+/g, ' ').trim();
    //Availability
    let indexOfAvailable = listingDescription.indexOf(`Available`);
    let indexOfAvailableEnd = listingDescription.indexOf(`\n`, indexOfAvailable + 10);
    avaibility = listingDescription.slice(indexOfAvailable + 10, indexOfAvailableEnd).replace(/^\s+|\s+$/g, '');
    avaibility == '' ? avaibility = 'Unknown' : avaibility;

    //utilities Included?
    let indexOfUtilitiesIncluded = listingDescription.indexOf(`Utilities Included`);
    UtilitiesIncluded = indexOfUtilitiesIncluded == -1 ? 'No' : 'Yes';

    //utilities Additional   additional
    let indexOfPlusHeat = listingDescription.indexOf(`Plus Heat`);
    let indexOfPlusWater = listingDescription.indexOf(`Plus Water`);
    let indexOfPlusHydro = listingDescription.indexOf(`Plus Hydro`);
    indexOfPlusHeat == -1 ? AdditionalUtilities.push('Plus Heat') : null;
    indexOfPlusWater == -1 ? AdditionalUtilities.push('Plus Water') : null;
    indexOfPlusHydro == -1 ? AdditionalUtilities.push('Plus Hydro') : null;
  }

  // get & update db object 
  await AgSecureListings.findById(id).then((dbObj) => {
    dbObj.location.geolocation = `${lat == "" ? lat = "0" : lat},${long == "" ? long = "0" : long}`; // in 3rd script of map = start_lat / start_long // from 2nd listing page

    dbObj.description = description.replace(dbObj.unitSize, '').replace('EMAIL US TENANT APPLICATION', ''); // from 2nd listing page
    //cleaning the description of extra stuff 
    let indexOfRent = dbObj.description.indexOf('Rent $');
    dbObj.description = dbObj.description.slice(0, indexOfRent == -1 ? dbObj.description.length : indexOfRent);
    let indexOfRent2 = dbObj.description.indexOf('Rent:');
    dbObj.description = dbObj.description.slice(0, indexOfRent2 == -1 ? dbObj.description.length : indexOfRent2);
    let indexOfIfInterested = dbObj.description.indexOf('IF INTERESTED PLEASE SEND US AN EMAIL AT');
    dbObj.description = dbObj.description.slice(0, indexOfIfInterested == -1 ? dbObj.description.length : indexOfIfInterested);
    let indexOfAvailable = dbObj.description.indexOf(`Available`);
    dbObj.description = dbObj.description.slice(0, indexOfAvailable == -1 ? dbObj.description.length : indexOfAvailable);
    let indexOfAvailable2 = dbObj.description.indexOf(`Available:`);
    dbObj.description = dbObj.description.slice(0, indexOfAvailable2 == -1 ? dbObj.description.length : indexOfAvailable2);

    dbObj.utilities.included = UtilitiesIncluded;  // from 2nd listing page
    dbObj.utilities.additional = AdditionalUtilities;  // from 2nd listing page
    dbObj.avaibility = String(avaibility);// from 2nd listing page
    dbObj.screenshot = `https://ahcl-screenshots.s3.us-east-2.amazonaws.com/menuBackground.jpg`; // puppeteer or ?
    return dbObj;
  })
    .then(async (dbObj) => {
      await AgSecureListings.findByIdAndUpdate(id, dbObj);
      //console.log(await AgSecureListings.findById(dbObj.id));
    });
};

module.exports = router;

/* 

sample axios + cheerio call >

(async () => {
  const args = process.argv.slice(2);
  const postCode = args[0] || 2000;
  const url = `https://www.domain.com.au/rent/?postcode=${postCode}&excludedeposittaken=1`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const noOfProperties = $('h1>strong').text();
    //console.log(`${noOfProperties} are open for rent in ${postCode} postcode of Australia on Domain`);
  } catch (e) {
    console.error(`Error while fetching rental properties for ${postCode} - ${e.message}`);
  }
})();


sample puppeteer call > 


(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation();

    await page.goto('https://jobs.workable.com/');
    await page.setViewport({ width: 1440, height: 744 });
    await navigationPromise;

    await page.waitForSelector('ul li h3 a');
    let jobTitles = await page.$$eval('ul li h3 a', titles => {
      return titles.map(title => title.innerText);
    });
    //console.log(`Job Titles on first page of Workable are: ${jobTitles.join(', ')}`);
    await browser.close();
  } catch (e) {
    //console.log(`Error while fetching workable job titles ${e.message}`);
  }
})();

*/
