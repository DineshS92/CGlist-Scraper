const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: String,
  date: Date,
  neighborhood: String,
  link: String,
  jobDescription: String,
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
