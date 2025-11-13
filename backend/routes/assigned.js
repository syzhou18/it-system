const express = require('express');
const router = express.Router();
// 從 db.js 引入 MySQL 連線池
const pool = require('../db'); 

// 新增設備分配資料
router.post('/computer', async (req, res) => {
    console.log(req.body);
  const { employee_id, hostname } = req.body;
  if (!employee_id || !hostname) {
    return res.status(400).json({ error: 'Employee ID and Asset Number are required.' });
  }

  // 取得一個連線
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. 透過 asset_number 查詢 computer_id
    const [computerRows] = await connection.query(
      'SELECT computer_id FROM computers WHERE hostname = ?',
      [hostname]
    );

    if (computerRows.length === 0) {
      connection.release(); // 釋放連線
      return res.status(404).json({ message: 'Computer not found for this asset number.' });
    }
    const computer_id = computerRows[0].computer_id;

    // 2. 檢查此資產是否已被分配給其他人
    const [assignmentRows] = await connection.query(
      'SELECT computer_id FROM computer_assignments WHERE computer_id = ?',
      [computer_id]
    );

    if (assignmentRows.length > 0) {
      connection.release(); // 釋放連線
      return res.status(409).json({ message: 'This computer is already assigned to someone.' });
    }

    // 3. 將資料新增到 assignments 資料表
    const [newAssignmentResult] = await connection.query(
      'INSERT INTO computer_assignments (employee_id, computer_id, assigned_date) VALUES (?, ?, NOW())',
      [employee_id, computer_id]
    );
    // 使用 result.insertId 取得新插入的 ID
    const newAssignmentId = newAssignmentResult.insertId;

    connection.release(); // 釋放連線

    // 4. 回傳成功訊息
    res.status(201).json({
      message: 'Asset assigned successfully!',
      assignment_id: newAssignmentId
    });

  } catch (err) {
    console.error('Error creating assignment:', err);
    // 確保發生錯誤時連線也被釋放
    if (connection) {
      connection.release();
    }
    res.status(500).json({ error: 'An error occurred on the server.' });
  }
});

// 新增軟體分配資料
router.post('/software', async (req, res) => {
    console.log(req.body);
  const { software_id, hostname } = req.body;
  if (!software_id || !hostname) {
    return res.status(400).json({ error: 'Software ID and Hostname are required.' });
  }

  // 取得一個連線
  let connection;
  try {
    connection = await pool.getConnection();
    // 1. 透過 hostname 查詢 computer_id
    const [computerRows] = await connection.query(
      'SELECT computer_id FROM computers WHERE hostname = ?',
      [hostname]
    );
    if (computerRows.length === 0) {
      connection.release(); // 釋放連線
      return res.status(404).json({ message: 'Computer not found for this hostname.' });
    }
    const computer_id = computerRows[0].computer_id;

    // 2. 檢查此軟體是否已被分配給此電腦
    const [assignmentRows] = await connection.query(
      'SELECT software_id FROM software_assignments WHERE software_id = ? AND computer_id = ?',
      [software_id, computer_id]
    );
    if (assignmentRows.length > 0) {
      connection.release(); // 釋放連線
      return res.status(409).json({ message: 'This software is already assigned to this computer.' });
    }
    // 3. 將資料新增到 assignments 資料表
    const [newAssignmentResult] = await connection.query(
      'INSERT INTO software_assignments (software_id, computer_id, assigned_date) VALUES (?, ?, NOW())',
      [software_id, computer_id]
    );
    // 使用 result.insertId 取得新插入的 ID
    const newAssignmentId = newAssignmentResult.insertId;
    connection.release(); // 釋放連線

    // 4. 回傳成功訊息
    res.status(201).json({
      message: 'Software assigned successfully!',
      assignment_id: newAssignmentId
    });

  } catch (err) {
    console.error('Error creating software assignment:', err);
    // 確保發生錯誤時連線也被釋放
    if (connection) {
      connection.release();
    }
    res.status(500).json({ error: 'An error occurred on the server.' });
  }
});

module.exports = router;