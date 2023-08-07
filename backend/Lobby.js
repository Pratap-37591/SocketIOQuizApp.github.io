import express from "express";
import http from "http";
import { Server as socketIO } from "socket.io";
import { v4 as uuidv4 } from "uuid";
const app = express();
const server = http.createServer(app);
const io = new socketIO(server);

const PORT = process.env.PORT || 5000;

const rooms = [];

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Emit the current list of rooms to the new user
  socket.emit("room-updated", rooms);

  // Event handler for creating a new room
  socket.on("create-room", () => {
    const newRoom = {
      id: uuidv4(),
      users: [],
    };
    rooms.push(newRoom);
    io.emit("room-updated", rooms);
  });

  // Event handler for joining a room
  socket.on("join-room", (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.users.length < 2) {
      room.users.push(socket.id);
      io.emit("room-updated", rooms);
    }
  });

  // Event handler for leaving a room
  socket.on("leave-room", (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      room.users = room.users.filter((userId) => userId !== socket.id);
      io.emit("room-updated", rooms);
    }
  });

  // Event handler for user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove the user from all rooms when disconnected
    rooms.forEach((room) => {
      room.users = room.users.filter((userId) => userId !== socket.id);
    });
    io.emit("room-updated", rooms);
  });
});

server.listen(PORT, () => {
  console.log(`Lobby server is running on port ${PORT}`);
});
