
let isOn = false;

function togglePower() {
  isOn = !isOn;

  const status = document.getElementById("status");
  const button = document.getElementById("powerButton");
  const indicator = document.getElementById("indicator");

  if (isOn) {
    status.innerText = "ON";
    status.style.color = "#4ade80";
    button.innerText = "ปิดการใช้งาน";
    button.classList.add("active");
    indicator.style.background = "#22c55e";
  } else {
    status.innerText = "OFF";
    status.style.color = "#f87171";
    button.innerText = "เปิดใช้งาน";
    button.classList.remove("active");
    indicator.style.background = "#ef4444";
  }
}

