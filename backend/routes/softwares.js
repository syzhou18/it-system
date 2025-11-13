const express = require('express');
const router = express.Router();
// 從 db.js 引入連線池
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM company_assets.software');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching softwares:', err);
    res.status(500).json({ error: 'Failed to fetch softwares' });
  }
});

// 新增軟體資料
router.post('/', async (req, res) => {
  console.log(req.body);
  const {software_name, license_key, registered_account, version, purchase_date, status, license_type } = req.body;

    if (!software_name) {
    return res.status(400).send('軟體名稱為必填欄位');
    }

    let connection;
    try {
    connection = await pool.getConnection();
    const sql = "INSERT INTO software (software_name, license_key, registered_account, version, purchase_date, status, license_type) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [software_name, license_key, registered_account, version, purchase_date, status, license_type];
    const [result] = await connection.execute(sql, values);
    console.log('資料新增成功:', result);
    res.status(201).json({
      message: '資料新增成功',
      id: result.insertId
    });
  } catch (err) {
    console.error('資料新增失敗:', err);
    res.status(500).json({ error: '伺服器錯誤，無法新增資料' });
  } finally {
    if (connection) connection.release();
  }
});

// 更新軟體資料
router.put('/:software_id', async (req, res) => {
  console.log(req.body);
  console.log(req.params);
  const { software_id } = req.params;
  const { software_name, license_key, registered_account, version, purchase_date, status, license_type } = req.body;
    try {
    const [result] = await pool.query(
        `UPDATE software
        SET software_name = ?, license_key = ?, registered_account = ?, version = ?, purchase_date = ?, status = ?, license_type = ?
        WHERE software_id = ?`,
        [software_name, license_key, registered_account, version, purchase_date, status, license_type, software_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '找不到指定的軟體' });
    }
    res.json({ message: '資料更新成功' });
    } catch (err) {
    console.error('更新軟體資料失敗:', err);
    res.status(500).json({ error: '伺服器錯誤，無法更新資料' });
    }
});

// 刪除軟體資料
router.delete('/:software_id', async (req, res) => {
  const { software_id } = req.params;
    try {
    const [result] = await pool.query('DELETE FROM software WHERE software_id = ?', [software_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '找不到指定的軟體' });
    }
    res.json({ message: '資料刪除成功' });
    } catch (err) {
    console.error('刪除軟體資料失敗:', err);
    res.status(500).json({ error: '伺服器錯誤，無法刪除資料' });
    }
});    
    
module.exports = router;