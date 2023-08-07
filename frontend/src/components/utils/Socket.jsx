// utils/socket.js
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3001';
const socket = io(SOCKET_SERVER_URL);

export const createRoom = () => {
    socket.emit('create-room');
};

export const joinRoom = (roomId) => {
    socket.emit('join-room', roomId);
};

export const leaveRoom = (roomId) => {
    socket.emit('leave-room', roomId);
};

// Emit the 'start-game' event to the server to start the game
export const startGame = () => {
    socket.emit('start-game');
};

// Emit the 'show-question' event to the server to show a question to players
export const showQuestion = (question) => {
    socket.emit('show-question', question);
};

// Emit the 'submit-answer' event to the server to submit the user's answer
export const submitAnswer = (answer) => {
    socket.emit('submit-answer', answer);
};

// Socket.IO event listener for receiving questions
export const onReceiveQuestion = (callback) => {
    socket.on('show-question', callback);
};

// Socket.IO event listener for receiving the game start event
export const onGameStart = (callback) => {
    socket.on('start-game', callback);
};

// Socket.IO event listener for receiving the game end event
export const onGameEnd = (callback) => {
    socket.on('game-ended', callback);
};

// Socket.IO event listener for receiving the result of the user's answer
export const onAnswerResult = (callback) => {
    socket.on('answer-result', callback);
};

// Socket.IO event listener for receiving room updates
export const onRoomUpdated = (callback) => {
    socket.on('room-updated', callback);
};

// Add more utility functions for handling other Socket.IO events as needed
