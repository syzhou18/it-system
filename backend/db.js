const mysql = require('mysql2/promise');

// 建立資料庫連線池並匯出
//const pool = mysql.createPool({
//  host: 'db',
//  user: 'root', // 你的 MySQL 使用者名稱
//  password: '1qazZSE$', // 你的 MySQL 密碼
//  database: 'company_assets',
//  timezone: 'Z', // 設定時區為 UTC
//  waitForConnections: true,
//  connectionLimit: 10,
//  queueLimit: 0
//);

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST, // 必須是 process.env.DATABASE_HOST，而不是硬編碼 'db'
  user: process.env.DATABASE_USER, 
  password: process.env.DATABASE_PASSWORD, 
  database: process.env.DATABASE_NAME,

});

// 匯出連線池，讓其他檔案可以重複使用
module.exports = pool;