require('dotenv').config();

const bcrypt = require('bcryptjs');
const { query, pool } = require('./index');

const salons = [
  {
    id: 1,
    name: 'Алтан Салаан',
    description: 'Өндөр зэрэглэлийн үс засал, будах, арчилгааны төв. СБД-ийн төвд байрладаг.',
    address: 'СБД, 1-р хороо, Хүүхдийн 100',
    city: 'Улаанбаатар',
    lat: 47.9188,
    lng: 106.9176,
    rating: 4.8,
    photo_urls: ['https://example.com/salons/altan-1.jpg'],
  },
  {
    id: 2,
    name: 'Мөнх Гоо Салон',
    description: 'Эмэгтэйчүүдийн үс засал, гоёл чимэглэл, маникюр, педикюр үйлчилгээтэй салон.',
    address: 'ЧД, 5-р хороо, Ж.Самбуугийн гудамж 12',
    city: 'Улаанбаатар',
    lat: 47.9215,
    lng: 106.9055,
    rating: 4.6,
    photo_urls: ['https://example.com/salons/munkh-1.jpg'],
  },
  {
    id: 3,
    name: 'Наран Сэти',
    description: 'Орчин үеийн загвар, будах, эмчилгээний багц үйлчилгээ. Зайсангийн ойролцоо.',
    address: 'ХУД, 3-р хороо, Зайсангийн уурга',
    city: 'Улаанбаатар',
    lat: 47.8872,
    lng: 106.9358,
    rating: 4.7,
    photo_urls: ['https://example.com/salons/naran-1.jpg'],
  },
  {
    id: 4,
    name: 'Эрхэм Үс Салон',
    description: 'Гэр бүлийн үс засал, хүүхдийн үс засал, энгийн болон дэгдэмхий загвар.',
    address: 'БЗД, 26-р хороо, Содномын гудамж 45',
    city: 'Улаанбаатар',
    lat: 47.9124,
    lng: 106.9582,
    rating: 4.5,
    photo_urls: ['https://example.com/salons/erkhem-1.jpg'],
  },
  {
    id: 5,
    name: 'Гоёл Салон',
    description: 'Гоёл чимэглэл, үс засал, арьс арчилгааны цогц үйлчилгээ. БГД-ийн төв.',
    address: 'БГД, 4-р хороо, Энхтайваны өргөн чөлөө 8',
    city: 'Улаанбаатар',
    lat: 47.9146,
    lng: 106.8543,
    rating: 4.4,
    photo_urls: ['https://example.com/salons/goel-1.jpg'],
  },
];

const stylistNames = [
  ['Болортуяа', 'Сарангэрэл', 'Оюунбилэг'],
  ['Мөнхцэцэг', 'Номин', 'Батцэцэг'],
  ['Анужин', 'Цэцэгмаа', 'Халиун'],
  ['Дөлгөөн', 'Энхтуяа', 'Ганхуяг'],
  ['Солонго', 'Баярмаа', 'Туяа'],
];

const stylistBios = [
  '10 жилийн туршлагатай үс засалч.',
  'Будах, эмчилгээний мэргэжилтэн.',
  'Загвар үс, өдөр тутмын загварын мэргэжилтэн.',
];

const stylistSpecialties = [
  ['үс тайрах', 'загвар'],
  ['будах', 'эмчилгээ'],
  ['загвар', 'стайлинг'],
];

const serviceTemplates = [
  {
    key: 'haircut',
    name: 'Үс тайрах',
    description: 'Энгийн эсвэл загварчилсан үс тайрах үйлчилгээ',
    duration_minutes: 45,
    basePrice: 45000,
  },
  {
    key: 'coloring',
    name: 'Үс будах',
    description: 'Бүтэн эсвэл хэсэгчилсэн будах, өнгө сэргээх',
    duration_minutes: 120,
    basePrice: 180000,
  },
  {
    key: 'styling',
    name: 'Загвар үс',
    description: 'Өдөр тутмын болон баяр ёслолын загвар үс',
    duration_minutes: 60,
    basePrice: 65000,
  },
  {
    key: 'treatment',
    name: 'Үсний эмчилгээ',
    description: 'Чийгшүүлэх, сэргээх, хамгаалах эмчилгээний багц',
    duration_minutes: 90,
    basePrice: 95000,
  },
];

const salonPriceMultiplier = [1, 1.1, 1.15, 0.95, 1.05];

async function seedSalons() {
  console.log('Seeding salons...');
  for (const salon of salons) {
    await query(
      `INSERT INTO salons (id, name, description, address, city, lat, lng, rating, photo_urls)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        salon.id,
        salon.name,
        salon.description,
        salon.address,
        salon.city,
        salon.lat,
        salon.lng,
        salon.rating,
        salon.photo_urls,
      ]
    );
  }
}

async function seedStylists() {
  console.log('Seeding stylists...');
  let stylistId = 1;
  for (let salonIndex = 0; salonIndex < salons.length; salonIndex += 1) {
    const salonId = salons[salonIndex].id;
    const names = stylistNames[salonIndex];
    for (let i = 0; i < 3; i += 1) {
      await query(
        `INSERT INTO stylists (id, salon_id, name, photo_url, bio, specialties)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          stylistId,
          salonId,
          names[i],
          `https://example.com/stylists/${stylistId}.jpg`,
          stylistBios[i],
          stylistSpecialties[i],
        ]
      );
      stylistId += 1;
    }
  }
}

async function seedServices() {
  console.log('Seeding services...');
  let serviceId = 1;
  for (let salonIndex = 0; salonIndex < salons.length; salonIndex += 1) {
    const salonId = salons[salonIndex].id;
    const multiplier = salonPriceMultiplier[salonIndex];
    for (const template of serviceTemplates) {
      const price = Math.round(template.basePrice * multiplier);
      await query(
        `INSERT INTO services (id, salon_id, name, description, duration_minutes, price)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          serviceId,
          salonId,
          template.name,
          template.description,
          template.duration_minutes,
          price,
        ]
      );
      serviceId += 1;
    }
  }
}

async function seedUser() {
  console.log('Seeding test user...');
  const passwordHash = await bcrypt.hash('test1234', 10);
  await query(
    `INSERT INTO users (name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ['Test User', 'test@salon.com', '99001234', passwordHash]
  );
}

async function resetSequences() {
  await query(
    `SELECT setval(pg_get_serial_sequence('salons', 'id'), COALESCE((SELECT MAX(id) FROM salons), 1))`
  );
  await query(
    `SELECT setval(pg_get_serial_sequence('stylists', 'id'), COALESCE((SELECT MAX(id) FROM stylists), 1))`
  );
  await query(
    `SELECT setval(pg_get_serial_sequence('services', 'id'), COALESCE((SELECT MAX(id) FROM services), 1))`
  );
  await query(
    `SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1))`
  );
}

async function seed() {
  try {
    await seedSalons();
    await seedStylists();
    await seedServices();
    await seedUser();
    await resetSequences();
    console.log('Seed completed');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
