const mongoose = require('mongoose');

const rentalListingSchema = new mongoose.Schema({
    source: { type: String, required: true }, // baseURL of the website the ad was captured from
    listingURL: { type: String, required: true }, // link to the listing
    dateCollected: { type: Date, required: true }, // date the ad was posted
    LastUpdated: { type: Date, required: true },
    updated:  { type: Boolean, required: true },// date the ad was posted
  location: {
    stratifiedArea: { type: String, required: true }, // local stratified area of rental unit
    municipality: { type: String, required: true }, // local municipality of rental unit
    address: { type: String, required: true }, // full address of rental unit
    geolocation: { type: String } // geolocation coordinates if available
  },
  bedrooms: { type: Number, required: true }, // number of bedrooms
  rent: { type: Number, required: true }, // monthly rent in Canadian dollars (excluding fees)
  rentFrequency: { type: String}, // The frequency at which rent payments are due, for example, every month.
  unitSize: { type: String, required: true }, //}
  description: { type: String }, // open text field for poster-provided descriptions
  utilities: {
    included: { type: String, required: true}, // are utilities included
    additional: { type: Array }, // which additional utilities are required to be paid for by the tenant
  },
  avaibility: { type: String}, // when is the lease available to sign
  screenshot: { type: String }, // screenshot of the ad for verification during cleaning/analysis
});

const RentalListing = mongoose.model('agSecureListing', rentalListingSchema);

module.exports = RentalListing;
