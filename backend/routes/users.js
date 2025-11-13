const express = require('express');
const router = express.Router();
// 從 db.js 引入連線池
const pool = require('../db');

// 取得使用者資料
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM company_assets.employees');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 新增使用者資料
router.post('/', async (req, res) => {
  console.log(req.body);
  const { employee_id, name, job_title,department ,phone_number, email} = req.body;

  if (!employee_id || !name || !email) {
    return res.status(400).send('名稱和電子郵件為必填欄位');
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const sql = "INSERT INTO employees (employee_id, name, job_title,department , phone_number, email) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [employee_id, name, job_title,department , phone_number, email];
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

// 更新使用者資料
router.put('/:employee_id', async (req, res) => {
  console.log(req.body);
  console.log(req.params);
  const { employee_id } = req.params;
  const { name, job_title, phone_number, email } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE employees
       SET name = ?, job_title = ?, phone_number = ?, email = ?
       WHERE employee_id = ?`,
      [name, job_title, phone_number, email, employee_id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'User not found for this employee_id' });
    } else {
      res.status(200).json({ message: 'User updated successfully' });
    }
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// 刪除使用者資料
router.delete('/:employee_id', async (req, res) => {
  const { employee_id } = req.params;

  let connection;
  try {
    connection = await pool.getConnection();
    const sql = "DELETE FROM employees WHERE employee_id = ?";
    const [result] = await connection.execute(sql, [employee_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '找不到要刪除的資料' });
    }
    res.json({ message: '資料刪除成功' });
  } catch (err) {
    console.error('刪除資料失敗:', err);
    res.status(500).json({ error: '伺服器錯誤，無法刪除資料' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;