const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let conn;
  try {
    // Connect without DB first to create it
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const statements = schema.split(';').filter(s => s.trim());

    for (const stmt of statements) {
      if (stmt.trim()) {
        await conn.query(stmt);
      }
    }

    console.log('✅ Database setup complete!');
    console.log('✅ Sample data inserted!');
    console.log('\n📋 Tables created: departments, halls, students, exams, seating_arrangements');
    console.log('\n🚀 You can now start the backend: cd backend && npm start');
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.end();
  }
}

setupDatabase();
