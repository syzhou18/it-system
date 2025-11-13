const express = require('express');
const router = express.Router();
// 從 db.js 引入連線池
const pool = require('../db');

// 取得設備資料 (已整合排序功能)
router.get('/', async (req, res) => {
  // 1. 從請求的查詢參數中獲取排序欄位和順序
  const { _sort, _order } = req.query;

  // 2. 建立一個允許排序的欄位白名單，防止 SQL 注入
  // 確保這些欄位名稱與您 `computers` 資料表中的完全一致
  const allowedSortKeys = [
    'computer_id', 'hostname', 'asset_number', 'status', 'mac_address',
    'type', 'os_version', 'purchase_date', 'warranty_end_date'
  ];

  // 3. 驗證排序參數
  const sortKey = allowedSortKeys.includes(_sort) ? _sort : 'computer_id'; // 如果欄位不合法，預設按 ID 排序
  const sortOrder = _order === 'desc' ? 'DESC' : 'ASC'; // 只允許 'asc' 或 'desc'，預設為 'asc'

  try {
    // 4. 建立動態且安全的 SQL 查詢語句
    // `??` 會被 mysql2 套件安全地替換為欄位名稱
    const sqlQuery = `SELECT * FROM company_assets.computers ORDER BY ?? ${sortOrder}`;
    
    // 5. 執行查詢，將 sortKey 作為參數傳入以防止注入
    const [rows] = await pool.query(sqlQuery, [sortKey]);
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching equipment:', err);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// 取得設備資料
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM company_assets.computers;`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching equipment:', err);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// 新增設備資料
router.post('/', async (req, res) => {
  console.log(req.body);
  const { company_id, hostname, asset_number, mac_address, type,  os_version, purchase_date, warranty_end_date, status} = req.body;
  if (!hostname || !asset_number || !mac_address) {
    return res.status(400).send('Hostname, Asset Number and MAC Address are required.');
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = "INSERT INTO computers (company_id, hostname, asset_number, mac_address, type,  os_version, purchase_date, warranty_end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [company_id, hostname, asset_number, mac_address, type,  os_version, purchase_date, warranty_end_date, status];
    const [result] = await connection.execute(sql, values);
    console.log('Equipment added successfully:', result);
    res.status(201).json({
      message: 'Equipment added successfully',
      id: result.insertId
    });
  } catch (err) {
    console.error('Failed to add equipment:', err);
    res.status(500).json({ error: 'Server error, unable to add equipment' });
  }
  finally {
    if (connection) connection.release();
  }
});


// 更新設備資料
router.put('/:id', async (req, res) => {

  const { id } = req.params;
  const { company_id, hostname, asset_number, mac_address, type,  os_version, purchase_date, warranty_end_date, status} = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE computers
        SET
          company_id = ?,
          hostname = ?,
          asset_number = ?,
          mac_address = ?,
          type = ?,
          os_version = ?,
          purchase_date = ?,
          warranty_end_date = ?,
          status = ?
        WHERE computer_id = ?`,
      [company_id, hostname, asset_number, mac_address, type,  os_version, purchase_date, warranty_end_date, status, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Equipment not found for this id' });
    } else {
      res.status(200).json({ message: 'Equipment updated successfully' });
    }
  } catch (err) {
    console.error('Error updating equipment:', err);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

router.put('/cancelassigned/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try { 
    const [result] = await pool.query(
      `UPDATE computers
        SET status = ?
        WHERE computer_id = ?`,
      [status, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Equipment not found for this id' });
    }
    else {
      res.status(200).json({ message: 'Equipment status updated to In Stock successfully' });
    }

  } catch (err) {
    console.error('Error updating equipment status:', err);
    res.status(500).json({ error: 'Failed to update equipment status' });
  }
});

// 刪除設備資料
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM computers WHERE computer_id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Equipment not found for this id' });   
    } else {
      res.status(200).json({ message: 'Equipment deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting equipment:', err);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});


module.exports = router;