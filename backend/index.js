import express from "express";
import http from "http";
import { Server as socketIO } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import mysql2 from "mysql2";
import connection from "./db.js";

const app = express();
const server = http.createServer(app);
const io = new socketIO(server);

const PORT = process.env.PORT || 5000;

//db connection

// Initialize an empty array to store active rooms
const rooms = [];

// Middleware to handle JSON data
app.use(express.json());

// Lobby API - Create a room
app.post("/api/lobby/rooms", (req, res) => {
  const roomId = uuidv4();
  const newRoom = { id: roomId, users: [] };
  rooms.push(newRoom);
  res.json({ roomId });
});

// Lobby API - Join a room
app.post("/api/lobby/rooms/:roomId/join", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.find((r) => r.id === roomId);
  if (room && room.users.length < 2) {
    room.users.push({ username: req.body.username });
    res.sendStatus(200);
  } else {
    res.status(400).json({ error: "Room not found or already full." });
  }
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    // Update the client-side with the updated room details
    io.to(roomId).emit("room-updated", getRoomById(roomId));
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Handle user disconnection and remove user from rooms if needed
  });
});

// Helper function to get a room by its id
function getRoomById(roomId) {
  return rooms.find((room) => room.id === roomId);
}

function getRandomQuestion() {
  // Replace this with your logic to fetch questions from a database or static list
  const questions = [
    { id: 1, questionText: "What is the capital of France?", answer: "Paris" },
    {
      id: 2,
      questionText: "Who painted the Mona Lisa?",
      answer: "Leonardo da Vinci",
    },
    // Add more questions as needed
  ];

  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

// Socket.IO event handlers for gameplay
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    // Update the client-side with the updated room details
    io.to(roomId).emit("room-updated", getRoomById(roomId));
  });

  // Event handler for starting the game
  socket.on("start-game", (roomId) => {
    const room = getRoomById(roomId);
    if (room && room.users.length === 2) {
      // Send the first question to both players
      const question = getRandomQuestion();
      io.to(roomId).emit("show-question", { question });
    }
  });

  // Event handler for receiving player answers
  socket.on("submit-answer", ({ roomId, answer }) => {
    const room = getRoomById(roomId);
    if (room) {
      // Here you can compare the answer with the correct answer and calculate the score
      // For simplicity, let's assume a fixed score of 10 points for each correct answer
      const isCorrect = answer === room.currentQuestion.answer;
      const score = isCorrect ? 10 : 0;

      // Send the result to both players
      io.to(roomId).emit("answer-result", { isCorrect, score });

      // Move to the next question or end the game if all questions are answered
      if (room.currentQuestionIndex < 4) {
        // Assuming 5 questions (0-based index)
        const nextQuestion = getRandomQuestion();
        room.currentQuestionIndex++;
        room.currentQuestion = nextQuestion;
        io.to(roomId).emit("show-question", { question: nextQuestion });
      } else {
        io.to(roomId).emit("game-ended", {
          scores: room.users.map((user) => user.score),
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Handle user disconnection and remove user from rooms if needed
  });
});
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
