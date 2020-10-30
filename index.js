const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const url = `https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof`;

(async function () {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(url);
  const html = await page.content();
  const $ = cheerio.load(html);
  $(".result-title").each((index, el) => {
    console.log($(el).text());
  });
})();
