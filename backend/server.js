const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB, parseItem } = require('./xmlStore');

const app = express();
app.use(cors());
app.use(express.json());

// ─── HOTELS ────────────────────────────────────────────────────────────────

app.get('/hotels', async (req, res) => {
  const db = await readDB();
  const hotels = (db.hotels[0].hotel || []).map(parseItem);
  res.json(hotels);
});

app.post('/hotels', async (req, res) => {
  const { name, city } = req.body;
  if (!name || !city) return res.status(400).json({ error: 'name and city required' });
  const db = await readDB();
  const hotel = { id: uuidv4(), name, city };
  db.hotels[0].hotel.push(hotel);
  writeDB(db);
  res.status(201).json(hotel);
});

app.put('/hotels/:id', async (req, res) => {
  const db = await readDB();
  const hotels = db.hotels[0].hotel || [];
  const idx = hotels.findIndex(h => parseItem(h).id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...parseItem(hotels[idx]), ...req.body };
  hotels[idx] = updated;
  writeDB(db);
  res.json(updated);
});

app.delete('/hotels/:id', async (req, res) => {
  const db = await readDB();
  const before = db.hotels[0].hotel.length;
  db.hotels[0].hotel = (db.hotels[0].hotel || []).filter(h => parseItem(h).id !== req.params.id);
  // cascade delete bookings
  db.bookings[0].booking = (db.bookings[0].booking || []).filter(b => parseItem(b).hotel_id !== req.params.id);
  if (db.hotels[0].hotel.length === before) return res.status(404).json({ error: 'Not found' });
  writeDB(db);
  res.json({ ok: true });
});

// ─── GUESTS ────────────────────────────────────────────────────────────────

app.get('/guests', async (req, res) => {
  const db = await readDB();
  const guests = (db.guests[0].guest || []).map(parseItem);
  res.json(guests);
});

app.post('/guests', async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'name and phone required' });
  const db = await readDB();
  const guest = { id: uuidv4(), name, phone };
  db.guests[0].guest.push(guest);
  writeDB(db);
  res.status(201).json(guest);
});

app.put('/guests/:id', async (req, res) => {
  const db = await readDB();
  const guests = db.guests[0].guest || [];
  const idx = guests.findIndex(g => parseItem(g).id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...parseItem(guests[idx]), ...req.body };
  guests[idx] = updated;
  writeDB(db);
  res.json(updated);
});

app.delete('/guests/:id', async (req, res) => {
  const db = await readDB();
  const before = db.guests[0].guest.length;
  db.guests[0].guest = (db.guests[0].guest || []).filter(g => parseItem(g).id !== req.params.id);
  db.bookings[0].booking = (db.bookings[0].booking || []).filter(b => parseItem(b).guest_id !== req.params.id);
  if (db.guests[0].guest.length === before) return res.status(404).json({ error: 'Not found' });
  writeDB(db);
  res.json({ ok: true });
});

// ─── BOOKINGS ──────────────────────────────────────────────────────────────

app.get('/bookings', async (req, res) => {
  const db = await readDB();
  const hotels = (db.hotels[0].hotel || []).map(parseItem);
  const guests = (db.guests[0].guest || []).map(parseItem);
  const bookings = (db.bookings[0].booking || []).map(b => {
    const bk = parseItem(b);
    bk.hotel = hotels.find(h => h.id === bk.hotel_id) || null;
    bk.guest = guests.find(g => g.id === bk.guest_id) || null;
    return bk;
  });
  res.json(bookings);
});

app.post('/bookings', async (req, res) => {
  const { hotel_id, guest_id, nights } = req.body;
  if (!hotel_id || !guest_id || !nights) return res.status(400).json({ error: 'hotel_id, guest_id and nights required' });
  const db = await readDB();
  const hotelExists = (db.hotels[0].hotel || []).some(h => parseItem(h).id === hotel_id);
  const guestExists = (db.guests[0].guest || []).some(g => parseItem(g).id === guest_id);
  if (!hotelExists) return res.status(400).json({ error: 'Hotel not found' });
  if (!guestExists) return res.status(400).json({ error: 'Guest not found' });
  const booking = { id: uuidv4(), hotel_id, guest_id, nights: String(nights) };
  db.bookings[0].booking.push(booking);
  writeDB(db);
  res.status(201).json(booking);
});

app.put('/bookings/:id', async (req, res) => {
  const db = await readDB();
  const bookings = db.bookings[0].booking || [];
  const idx = bookings.findIndex(b => parseItem(b).id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...parseItem(bookings[idx]), ...req.body };
  if (req.body.nights) updated.nights = String(req.body.nights);
  bookings[idx] = updated;
  writeDB(db);
  res.json(updated);
});

app.delete('/bookings/:id', async (req, res) => {
  const db = await readDB();
  const before = db.bookings[0].booking.length;
  db.bookings[0].booking = (db.bookings[0].booking || []).filter(b => parseItem(b).id !== req.params.id);
  if (db.bookings[0].booking.length === before) return res.status(404).json({ error: 'Not found' });
  writeDB(db);
  res.json({ ok: true });
});

// ─── XML VIEWER ────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, 'data.xml');

app.get('/xml-raw', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.type('text/plain').send('No data yet.');
  res.type('application/xml').send(fs.readFileSync(DATA_FILE, 'utf8'));
});

// ─── START ─────────────────────────────────────────────────────────────────

app.listen(3001, () => console.log('Hotel XML API running on http://localhost:3001'));
