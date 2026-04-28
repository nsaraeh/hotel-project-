const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const DATA_FILE = path.join(__dirname, "data.xml");

const parser = new xml2js.Parser({ explicitArray: true });
const builder = new xml2js.Builder({
  rootName: "database",
  xmldec: { version: "1.0", encoding: "UTF-8" },
});

function getEmptyDB() {
  return {
    hotels: [{ hotel: [] }],
    guests: [{ guest: [] }],
    bookings: [{ booking: [] }],
  };
}

async function readDB() {
  if (!fs.existsSync(DATA_FILE)) return getEmptyDB();
  const xml = fs.readFileSync(DATA_FILE, "utf8");
  try {
    const result = await parser.parseStringPromise(xml);
    const db = result.database;

    if (!db.hotels || !db.hotels[0]) db.hotels = [{ hotel: [] }];
    if (!db.hotels[0].hotel) db.hotels[0].hotel = [];

    if (!db.guests || !db.guests[0]) db.guests = [{ guest: [] }];
    if (!db.guests[0].guest) db.guests[0].guest = [];

    if (!db.bookings || !db.bookings[0]) db.bookings = [{ booking: [] }];
    if (!db.bookings[0].booking) db.bookings[0].booking = [];

    return db;
  } catch (e) {
    return getEmptyDB();
  }
}

function writeDB(db) {
  const xml = builder.buildObject(db);
  fs.writeFileSync(DATA_FILE, xml, "utf8");
}

function parseItem(item) {
  const out = {};
  for (const key of Object.keys(item)) {
    out[key] = Array.isArray(item[key]) ? item[key][0] : item[key];
  }
  return out;
}

module.exports = { readDB, writeDB, parseItem };
