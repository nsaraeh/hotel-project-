# HotelXML — Hotel Management System (XML Backend)

## Stack
- **Backend**: Node.js + Express — stores all data in `data.xml`
- **Frontend**: Plain HTML/CSS/JS — no build step needed

## Structure
```
hotel-xml/
├── backend/
│   ├── server.js       # Express REST API
│   ├── xmlStore.js     # XML read/write utility (xml2js)
│   └── data.xml        # Auto-created on first write
└── frontend/
    └── index.html      # Full management UI
```

## Run

### 1. Start the backend
```bash
cd backend
node server.js
# → Running on http://localhost:3001
```

### 2. Open the frontend
Open `frontend/index.html` in your browser (double-click or use a local server).

## API Endpoints

| Method | Endpoint         | Description          |
|--------|-----------------|----------------------|
| GET    | /hotels          | List all hotels      |
| POST   | /hotels          | Create hotel         |
| PUT    | /hotels/:id      | Update hotel         |
| DELETE | /hotels/:id      | Delete hotel + bookings |
| GET    | /guests          | List all guests      |
| POST   | /guests          | Create guest         |
| PUT    | /guests/:id      | Update guest         |
| DELETE | /guests/:id      | Delete guest + bookings |
| GET    | /bookings        | List bookings (with joined hotel/guest) |
| POST   | /bookings        | Create booking       |
| PUT    | /bookings/:id    | Update booking       |
| DELETE | /bookings/:id    | Delete booking       |
| GET    | /xml-raw         | View raw XML file    |

## XML Schema
```xml
<?xml version="1.0" encoding="UTF-8"?>
<database>
  <hotels>
    <hotel>
      <id>uuid</id>
      <name>Hotel Name</name>
      <city>City</city>
    </hotel>
  </hotels>
  <guests>
    <guest>
      <id>uuid</id>
      <name>Guest Name</name>
      <phone>+213...</phone>
    </guest>
  </guests>
  <bookings>
    <booking>
      <id>uuid</id>
      <hotel_id>uuid (FK → hotel)</hotel_id>
      <guest_id>uuid (FK → guest)</guest_id>
      <nights>3</nights>
    </booking>
  </bookings>
</database>
```
