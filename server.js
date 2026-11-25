
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DEVICE_KEY = process.env.DEVICE_KEY || "CHANGE_THIS_KEY";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let desiredState = false;
let actualState = false;
let lastSeen = 0;

function isConnected() {
  return Date.now() - lastSeen < 10000;
}

// เว็บไซต์อ่านสถานะ
app.get("/api/status", (req, res) => {
  res.json({
    connected: isConnected(),
    on: actualState
  });
});

// เว็บไซต์ส่งคำสั่ง
app.post("/api/command", (req, res) => {
  if (typeof req.body.on !== "boolean") {
    return res.status(400).json({ success: false });
  }

  if (!isConnected()) {
    return res.status(503).json({
      success: false,
      message: "ESP32 is offline"
    });
  }

  desiredState = req.body.on;

  res.json({
    success: true,
    requestedState: desiredState
  });
});

// ตรวจสอบกุญแจของ ESP32
function verifyDevice(req, res, next) {
  if (req.get("x-device-key") !== DEVICE_KEY) {
    return res.status(401).json({ success: false });
  }
  next();
}

// ESP32 รับคำสั่งจาก Server
app.get("/api/esp/state", verifyDevice, (req, res) => {
  lastSeen = Date.now();

  res.json({
    on: desiredState
  });
});

// ESP32 รายงานสถานะรีเลย์กลับมา
app.post("/api/esp/status", verifyDevice, (req, res) => {
  if (typeof req.body.on !== "boolean") {
    return res.status(400).json({ success: false });
  }

  actualState = req.body.on;
  lastSeen = Date.now();

  res.json({ success: true });
});

// ตรวจสอบ Server
app.get("/ping", (req, res) => {
  res.send("Smart Plug Server is running");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Smart Plug Server running on port " + PORT);
});
