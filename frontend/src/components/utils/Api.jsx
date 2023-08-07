// utils/api.js
import axios from 'axios';

// Replace this with your backend server URL
const API_BASE_URL = 'http://localhost:3001/api';

// Fetch questions from the server
export const fetchQuestions = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/gameplay/questions`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching questions:', error);
    }
};

// Create a new room on the server
export const createRoom = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/lobby/rooms`);
        return response.data.roomId;
    } catch (error) {
        throw new Error('Error creating room:', error);
    }
};

// Join a room on the server
export const joinRoom = async (roomId) => {
    try {
        await axios.post(`${API_BASE_URL}/lobby/rooms/${roomId}/join`);
    } catch (error) {
        throw new Error('Error joining room:', error);
    }
};
