import express from "express";
import http from "http";
import { Server as socketIO } from "socket.io";
import { v4 as uuidv4 } from "uuid";
const app = express();
const server = http.createServer(app);
const io = new socketIO(server);

const PORT = process.env.PORT || 5000;

const userRoomMap = new Map();

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);
  
    // Event handler for joining a room
    socket.on('join-room', (roomId) => {
      // Check if the user is already in a room
      if (userRoomMap.has(socket.id)) {
        const oldRoomId = userRoomMap.get(socket.id);
        socket.leave(oldRoomId);
      }
  
      // Join the new room
      socket.join(roomId);
      userRoomMap.set(socket.id, roomId);
    });
  
    // Event handler for user disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Remove the user from the user-room mapping on disconnection
      if (userRoomMap.has(socket.id)) {
        const roomId = userRoomMap.get(socket.id);
        userRoomMap.delete(socket.id);
        socket.leave(roomId);
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`Matchmaking server is running on port ${PORT}`);
  });
  
  