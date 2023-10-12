const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const eraseBtn = document.getElementById("eraseBtn");
const eraseAllBtn = document.getElementById("eraseAllBtn");
const colorPicker = document.getElementById("colorPicker");
const smoothnessSlider = document.getElementById("smoothnessSlider");
const smoothingStrengthSlider = document.getElementById(
  "smoothingStrengthSlider"
);
const smoothnessValueDisplay = document.getElementById("smoothnessValue");
smoothnessSlider.addEventListener("input", (e) => {
  ctx.lineWidth = e.target.value;
  smoothnessValueDisplay.textContent = e.target.value; // Update UI with current slider value
});

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

canvas.addEventListener("pointerdown", (e) => {
  drawing = true;
  [lastX, lastY] = [
    e.clientX - canvas.offsetLeft,
    e.clientY - canvas.offsetTop,
  ];
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  ctx.beginPath();
});

//canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointermove", function (e) {
  e.preventDefault();
  draw(e);
});

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

//for capture screenshot
const captureScreenBtn = document.getElementById("captureScreenBtn");
captureScreenBtn.addEventListener("click", captureScreen);

//transparent background
// function captureScreen() {
//   const dataURL = canvas.toDataURL("image/png");
//   const link = document.createElement("a");
//   link.href = dataURL;
//   link.download = "canvas_capture.png";
//   link.click();
// }

//as it is background
function captureScreen() {
  // Create a temporary canvas of the same size as the original
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");

  // Fill the temporary canvas with a white background
  tempCtx.fillStyle = "#FFFFFF";
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // Draw the original canvas onto the temporary canvas
  tempCtx.drawImage(canvas, 0, 0);

  // Save the combined image as PNG
  const dataURL = tempCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "canvas_capture.png";
  link.click();
}
// for window resize

window.addEventListener("resize", function () {
  location.reload(); // Refreshes the page
});
