const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const eraseBtn = document.getElementById("eraseBtn");
const eraseAllBtn = document.getElementById("eraseAllBtn");
const colorPicker = document.getElementById("colorPicker");
const smoothnessSlider = document.getElementById("smoothnessSlider");
const smoothingStrengthSlider = document.getElementById(
  "smoothingStrengthSlider"
);

const socket = io();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50;

let erasing = false;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50;
});

let drawing = false;
let lastX, lastY;

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  [lastX, lastY] = [
    e.clientX - canvas.offsetLeft,
    e.clientY - canvas.offsetTop,
  ];
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.beginPath();
});

canvas.addEventListener("mousemove", draw);

colorPicker.addEventListener("click", (e) => {
  ctx.strokeStyle = e.target.value;
  erasing = false;
});

eraseBtn.addEventListener("click", () => (erasing = true));

eraseAllBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit("eraseAll");
});

smoothnessSlider.addEventListener("input", (e) => {
  ctx.lineWidth = e.target.value;
});

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

function draw(e) {
  if (!drawing) return;

  ctx.lineCap = "round";
  ctx.strokeStyle = erasing ? "#FFF" : colorPicker.value;
  ctx.lineWidth = smoothnessSlider.value;

  let currentX = e.clientX - canvas.offsetLeft;
  let currentY = e.clientY - canvas.offsetTop;

  let lerpFactor = (110 - smoothingStrengthSlider.value) / 100;

  let newX = lerp(lastX, currentX, lerpFactor);
  let newY = lerp(lastY, currentY, lerpFactor);

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(newX, newY);
  ctx.stroke();

  socket.emit("drawing", {
    x: newX,
    y: newY,
    lastX: lastX,
    lastY: lastY,
    strokeStyle: ctx.strokeStyle,
    lineWidth: ctx.lineWidth,
  });

  [lastX, lastY] = [newX, newY];
}

socket.on("drawing", (data) => {
  let currentStrokeStyle = ctx.strokeStyle;
  let currentLineWidth = ctx.lineWidth;

  ctx.strokeStyle = data.strokeStyle;
  ctx.lineWidth = data.lineWidth;

  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(data.lastX, data.lastY);
  ctx.lineTo(data.x, data.y);
  ctx.stroke();

  ctx.strokeStyle = currentStrokeStyle;
  ctx.lineWidth = currentLineWidth;
});

socket.on("eraseAll", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

ctx.strokeStyle = "#000";
ctx.lineWidth = smoothnessSlider.value;
socket.on("loadDrawing", (data) => {
  data.forEach((drawingData) => {
    let currentStrokeStyle = ctx.strokeStyle;
    let currentLineWidth = ctx.lineWidth;

    ctx.strokeStyle = drawingData.strokeStyle;
    ctx.lineWidth = drawingData.lineWidth;

    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(drawingData.lastX, drawingData.lastY);
    ctx.lineTo(drawingData.x, drawingData.y);
    ctx.stroke();

    ctx.strokeStyle = currentStrokeStyle;
    ctx.lineWidth = currentLineWidth;
  });
});
