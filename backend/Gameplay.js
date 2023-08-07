import express from "express";
import http from "http";
import { Server as socketIO } from "socket.io";
import { v4 as uuidv4 } from "uuid";
const app = express();
const server = http.createServer(app);
const io = new socketIO(server);

const PORT = process.env.PORT || 5000;

// Sample questions data for demonstration purposes
const questions = [
  {
    id: 1,
    questionText: "What is the capital of France?",
    answer: "Paris",
  },
  {
    id: 2,
    questionText: "What is the largest mammal?",
    answer: "Blue Whale",
  },
  {
    id: 3,
    questionText: "What is 2 + 2?",
    answer: "4",
  },
  // Add more questions here...
];

const { v4: uuidv4 } = require("uuid"); // Import the uuid package for generating unique room IDs

// Store the list of active rooms and their players
const activeRooms = {};

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Event handler for starting the game
  socket.on("start-game", (roomId) => {
    // Implement your logic here to start the game for the specified room
    // You can fetch questions from the database and send them to the clients
    // For demonstration purposes, we'll just pick a random set of questions
    const randomQuestions = getRandomQuestions(questions, 5); // Pick 5 random questions

    // Store the current state of the game in the activeRooms object
    activeRooms[roomId] = {
      questions: randomQuestions,
      currentQuestionIndex: 0,
      scores: {},
    };

    // Show the first question to all players in the room
    io.to(roomId).emit("show-question", { question: randomQuestions[0] });
  });

  // Event handler for showing the next question
  socket.on("show-question", (data) => {
    const { roomId, question } = data;
    // Implement your logic here to show the question to the users
    // Set a timer for 10 seconds for the users to answer the question
    const timer = setTimeout(() => {
      // Time is up, handle the end of the question
      handleQuestionEnd(roomId, question);
    }, 10000);

    // Collect and validate the answers from the users
    socket.on("submit-answer", (userAnswer) => {
      clearTimeout(timer); // Clear the timer as the user has submitted an answer
      const isCorrect = userAnswer === question.answer;
      const score = isCorrect ? 10 : 0;

      // Store the user's score in the activeRooms object
      const { scores } = activeRooms[roomId];
      scores[socket.id] = (scores[socket.id] || 0) + score;

      // Send the result (whether the answer is correct and the score) to the user
      socket.emit("answer-result", { isCorrect, score });

      // Move to the next question or end the game if all questions have been asked
      const { questions, currentQuestionIndex } = activeRooms[roomId];
      const nextQuestionIndex = currentQuestionIndex + 1;
      if (nextQuestionIndex < questions.length) {
        const nextQuestion = questions[nextQuestionIndex];
        activeRooms[roomId].currentQuestionIndex = nextQuestionIndex;
        io.to(roomId).emit("show-question", { question: nextQuestion });
      } else {
        io.to(roomId).emit("game-ended", {
          scores: activeRooms[roomId].scores,
        });
        // Clear the room after the game ends
        delete activeRooms[roomId];
      }
    });
  });

  // Event handler for user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Implement your logic here to handle user disconnection, if needed
    // For example, you can remove the user from the active room or update their status
  });
});

// Helper function to get random questions from the list
function getRandomQuestions(questions, count) {
  const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
  return shuffledQuestions.slice(0, count);
}

// Helper function to handle the end of a question when the time is up
function handleQuestionEnd(roomId, question) {
  // Implement your logic here to handle the end of the question
  // You can decide whether to show the correct answer or proceed to the next question immediately
  // For this example, we'll proceed to the next question immediately
  // You may also want to broadcast to all users in the room that the question is over
  const { questions, currentQuestionIndex } = activeRooms[roomId];
  const nextQuestionIndex = currentQuestionIndex + 1;
  if (nextQuestionIndex < questions.length) {
    const nextQuestion = questions[nextQuestionIndex];
    activeRooms[roomId].currentQuestionIndex = nextQuestionIndex;
    io.to(roomId).emit("show-question", { question: nextQuestion });
  }
}

server.listen(PORT, () => {
  console.log(`Gameplay server is running on port ${PORT}`);
});
