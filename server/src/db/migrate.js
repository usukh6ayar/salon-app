require('dotenv').config();

const { query, pool } = require('./index');

const migrations = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    email VARCHAR UNIQUE,
    phone VARCHAR,
    password_hash VARCHAR,
    avatar_url VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS salons (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    description TEXT,
    address VARCHAR,
    city VARCHAR,
    lat DECIMAL,
    lng DECIMAL,
    rating DECIMAL DEFAULT 0,
    photo_urls TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS stylists (
    id SERIAL PRIMARY KEY,
    salon_id INT REFERENCES salons(id),
    name VARCHAR,
    photo_url VARCHAR,
    bio TEXT,
    specialties TEXT[]
  )`,
  `CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    salon_id INT REFERENCES salons(id),
    name VARCHAR,
    description TEXT,
    duration_minutes INT,
    price DECIMAL
  )`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    salon_id INT REFERENCES salons(id),
    stylist_id INT REFERENCES stylists(id),
    service_id INT REFERENCES services(id),
    booking_date DATE,
    booking_time TIME,
    status VARCHAR DEFAULT 'pending',
    total_price DECIMAL,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    user_id INT REFERENCES users(id),
    amount DECIMAL,
    method VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS saved_cards (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    last4 VARCHAR,
    brand VARCHAR,
    exp_month INT,
    exp_year INT
  )`,
];

async function migrate() {
  try {
    for (const sql of migrations) {
      await query(sql);
    }
    console.log('Migrations completed');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
