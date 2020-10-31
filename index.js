const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

const Listing = require("./model/Listing");

async function connectToDB() {
  await mongoose.connect("mongodb://mongo:27017/SFO-Craigslist-techjobs", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to mongoDb");
}

const url = `https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof`;

async function scrapeListings(page) {
  let listings = [];
  await page.goto(url);
  const html = await page.content();
  const $ = cheerio.load(html);
  $("div.result-info").each((index, el) => {
    const date = new Date(
      $(el).find("time.result-date").attr("datetime")
    ).toDateString();
    const neighborhoodData = $(el).find(".result-hood").text();
    const neighborhood = neighborhoodData.slice(2, neighborhoodData.length - 1);
    const anchor = $(el).find("a.result-title");
    listings.push({
      title: anchor.text(),
      link: anchor.attr("href"),
      date: date,
      neighborhood: neighborhood,
    });
  });
  return listings;
}

async function scrapeJobDescriptions(listings, page) {
  for (let i = 0; i < listings.length; i++) {
    await page.goto(listings[i].link);
    const html = await page.content();
    const $ = cheerio.load(html);
    const jobDescription = $("#postingbody").text().replace(/\n+/g, " ");
    listings[i].jobDescription = jobDescription;
    console.log(listings[i]);
    const listingModel = new Listing(listings[i]);
    await listingModel.save();
    await sleep(2000);
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await connectToDB();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  const listings = await scrapeListings(page);
  const listingsWithJobDescriptions = await scrapeJobDescriptions(
    listings,
    page
  );
  console.log(listings);
}

main();
