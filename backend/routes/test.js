const express = require('express');
const router = express.Router();
// 從 db.js 引入連線池
const pool = require('../db');

// 取得設備資料
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT
    c.hostname,
    c.asset_number,
    c.status,
    c.model,
    c.type,
    c.os_version,
    s.software_name,
    s.version,
    e.name,
    e.department,
    sa.assigned_date AS software_assigned_date,
    a.assigned_date AS computer_assigned_date
FROM
    software_assignments AS sa
JOIN
    software AS s ON sa.software_id = s.software_id
JOIN
    computers AS c ON sa.computer_id = c.computer_id
JOIN
    computer_assignments AS a ON c.computer_id = a.computer_id
JOIN
    employees AS e ON a.employee_id = e.employee_id
WHERE
    a.returned_date IS NULL;`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching equipment:', err);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

module.exports = router;