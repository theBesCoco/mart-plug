
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// อ่านข้อมูล JSON
app.use(express.json());

// เปิดให้เว็บไซต์ใช้งาน
app.use(express.static(path.join(__dirname, "public")));

// สถานะระบบ
let desiredState = false;
let actualState = false;
let lastSeen = 0;

// ตรวจสอบว่า ESP32 ยังเชื่อมต่ออยู่หรือไม่
function isConnected() {
  return Date.now() - lastSeen < 10000;
}

// เว็บไซต์ขอสถานะ
app.get("/api/status", (req, res) => {
  res.json({
    connected: isConnected(),
    on: actualState
  });
});

// เว็บไซต์ส่งคำสั่งเปิด / ปิด
app.post("/api/command", (req, res) => {
  if (typeof req.body.on !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Invalid command"
    });
  }

  desiredState = req.body.on;

  res.json({
    success: true,
    message: "Command received",
    requestedState: desiredState
  });
});

// ESP32 เรียกเพื่อรับคำสั่ง
app.get("/api/esp/state", (req, res) => {
  lastSeen = Date.now();

  res.json({
    on: desiredState
  });
});

// ESP32 ส่งสถานะจริงกลับมา
app.post("/api/esp/status", (req, res) => {
  if (typeof req.body.on !== "boolean") {
    return res.status(400).json({
      success: false
    });
  }

  lastSeen = Date.now();
  actualState = req.body.on;

  res.json({
    success: true
  });
});

// ตรวจสอบ Server
app.get("/ping", (req, res) => {
  res.send("Smart Plug Server is running");
});

// เริ่มทำงาน
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Smart Plug Server running on port ${PORT}`);
});
