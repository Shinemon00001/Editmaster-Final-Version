-- schema.sql

-- Create a table to store uploaded photos
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imageData TEXT,
  userEmail TEXT,
  FOREIGN KEY (userEmail) REFERENCES users(email)
);

-- Create a table to store edited PDF files
CREATE TABLE IF NOT EXISTS EditedPDF (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pdfData BLOB,
  userEmail TEXT,
  FOREIGN KEY (userEmail) REFERENCES users(email)
);

-- Create a table to store user information
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  isActive BOOLEAN DEFAULT 1,
  resetToken TEXT DEFAULT NULL,
  isOnline BOOLEAN DEFAULT NULL,
  collaborators TEXT DEFAULT NULL -- New column to store collaborators
);
