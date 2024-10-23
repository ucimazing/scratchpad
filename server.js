require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;
app.use(express.static("public"));

// Store the drawing history
const drawingHistory = [];

io.on("connection", (socket) => {
  console.log("a user connected");

  // Send the entire drawing history to the newly connected user
  socket.emit("loadDrawing", drawingHistory);

  socket.on("drawing", (data) => {
    drawingHistory.push(data); // Store drawing data in history
    socket.broadcast.emit("drawing", data); // Send to all other clients
  });

  socket.on("eraseAll", () => {
    drawingHistory.length = 0; // Clear the drawing history
    socket.broadcast.emit("eraseAll");
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, () => {
  console.log("listening on *:3000");
});
