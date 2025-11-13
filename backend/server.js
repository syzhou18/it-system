const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// 使用 CORS 中介軟體
app.use(cors());
// 解析 JSON 請求主體
app.use(express.json());

// 引入並掛載路由檔案
// 請確保這些路徑是相對應的，例如您的 routes 資料夾在 server.js 的同一個層級
const usersRouter = require('./routes/users');
const equipmentRouter = require('./routes/equipments');
const assignedRouter = require('./routes/assigned');
const softwaresRouter = require('./routes/softwares');
const testRouter = require('./routes/test');

// 測試路由
app.use('/api/test', testRouter);

// 將與軟體相關的請求導向 softwaresRouter
app.use('/api/softwares', softwaresRouter);

// 將與使用者相關的請求導向 usersRouter
app.use('/api/users', usersRouter);

// 將與設備相關的請求導向 equipmentRouter
app.use('/api/equipment', equipmentRouter);

// 將與設備分配相關的請求導向 assignedRouter
app.use('/api/assigned', assignedRouter);

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});