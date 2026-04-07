import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Hotel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchantId INTEGER NOT NULL,
    nameZh TEXT NOT NULL,
    nameEn TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    star INTEGER NOT NULL,
    description TEXT NOT NULL,
    openYear INTEGER NOT NULL,
    coverImage TEXT NOT NULL,
    galleryImages TEXT NOT NULL,
    tags TEXT NOT NULL,
    facilities TEXT NOT NULL,
    nearbyInfo TEXT NOT NULL,
    discountInfo TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    auditStatus TEXT NOT NULL DEFAULT 'pending',
    auditReason TEXT,
    publishStatus TEXT NOT NULL DEFAULT 'draft',
    isOffline BOOLEAN NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchantId) REFERENCES User(id) ON DELETE RESTRICT ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS RoomType (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hotelId INTEGER NOT NULL,
    roomName TEXT NOT NULL,
    bedType TEXT NOT NULL,
    breakfastIncluded BOOLEAN NOT NULL DEFAULT 0,
    cancelPolicy TEXT NOT NULL,
    price REAL NOT NULL,
    originalPrice REAL NOT NULL,
    stock INTEGER NOT NULL,
    roomArea INTEGER NOT NULL,
    maxGuests INTEGER NOT NULL,
    roomImage TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotelId) REFERENCES Hotel(id) ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Banner (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    targetHotelId INTEGER NOT NULL,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    isActive BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (targetHotelId) REFERENCES Hotel(id) ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Booking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hotelId INTEGER NOT NULL,
    roomTypeId INTEGER NOT NULL,
    checkInDate DATETIME NOT NULL,
    checkOutDate DATETIME NOT NULL,
    nights INTEGER NOT NULL,
    guestCount INTEGER NOT NULL,
    totalPrice REAL NOT NULL,
    contactName TEXT NOT NULL,
    contactPhone TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotelId) REFERENCES Hotel(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (roomTypeId) REFERENCES RoomType(id) ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS OperationLog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
  );
`);

db.close();
console.log(`Database initialized at ${dbPath}`);
