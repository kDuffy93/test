var express = require('express');
var router = express.Router();
const AgSecureListings = require("../../models/agSecureListings");


/* GET /heatMap  */
router.get("/", async function (req, res, next) {
    var list = [];
    let agrentalData = await AgSecureListings.find({});

    for (const listing of agrentalData) {
      let tempObj = {
        "collectedFrom": listing.source,
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

module.exports = router;













