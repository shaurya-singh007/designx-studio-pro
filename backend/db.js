const mysql = require('mysql2/promise');

let pool = null;

async function getDB() {
  if (pool) return pool;
  
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'designx_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test connection
    const conn = await pool.getConnection();
    console.log('✅ MySQL Pool Created & Connected');
    conn.release();
    return pool;
  } catch (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
    return null;
  }
}

module.exports = { getDB };
