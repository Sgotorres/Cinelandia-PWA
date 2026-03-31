const { Pool } = require('pg');
require('dotenv').config();

// Configuramos la conexión usando los datos de tu archivo .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Prueba rápida de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.stack);
  } else {
    console.log('✅ ¡Conexión exitosa! La base de datos de Sistemas-Pedidos responde.');
  }
});

module.exports = pool;