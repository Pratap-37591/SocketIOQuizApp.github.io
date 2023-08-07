import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Timer from '../Timer/Timer';
import Modal from '../Modal/Modal';
import './gameplay.scss';
const socket = io(); // Replace with your Socket.IO server URL

function Gameplay({ roomId }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    // Fetch questions from the server when the component mounts
    async function fetchQuestions() {
      try {
        const response = await axios.get('/api/gameplay/questions');
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    }
    fetchQuestions();

    // Socket.IO event listeners for gameplay
    socket.on('start-game', handleStartGame);
    socket.on('show-question', handleShowQuestion);
    socket.on('answer-result', handleAnswerResult);
    socket.on('game-ended', handleGameEnded);

    return () => {
      // Clean up event listeners when the component unmounts
      socket.off('start-game', handleStartGame);
      socket.off('show-question', handleShowQuestion);
      socket.off('answer-result', handleAnswerResult);
      socket.off('game-ended', handleGameEnded);
    };
  }, []);

  const handleStartGame = () => {
    // Start the game by showing the first question
    socket.emit('join-room', roomId); // Inform the server that this user has joined the room
  };

  const handleShowQuestion = (data) => {
    // Show the current question and start the countdown timer
    setCurrentQuestionIndex(data.question);
    setTimeLeft(10);

    // Start the timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Clear the timer after 10 seconds
    setTimeout(() => {
      clearInterval(timer);
      setUserAnswer('');
      handleNextQuestion();
    }, 10000);
  };

  const handleAnswerResult = (result) => {
    // Handle the result of the user's answer
    if (result.isCorrect) {
      setScore((prevScore) => prevScore + result.score);
    }
  };

  const handleNextQuestion = () => {
    // Move to the next question or end the game
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      socket.emit('show-question', { question: questions[currentQuestionIndex + 1] });
    } else {
      socket.emit('game-ended', { scores: score });
    }
  };

  const handleSubmitAnswer = () => {
    // Submit the user's answer to the server
    socket.emit('submit-answer', { roomId, answer: userAnswer });
  };

  const handleGameEnded = (data) => {
    // Handle the end of the game and show the final scores modal
    setGameEnded(true);
    console.log('Game ended:', data.scores);
  };

  const handleCloseModal = () => {
    // Close the final scores modal
    setGameEnded(false);
  };

  return (
    <div className="gameplay">
      <h2>Gameplay</h2>
      {currentQuestionIndex < questions.length ? (
        <div>
          <h3>Question {currentQuestionIndex + 1}</h3>
          <p>{questions[currentQuestionIndex].questionText}</p>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter your answer"
          />
          <button onClick={handleSubmitAnswer}>Submit</button>
          <Timer timeLeft={timeLeft} />
        </div>
      ) : (
        <div>
          <h3>Game Over</h3>
          <p>Your final score: {score}</p>
        </div>
      )}
      {gameEnded && <Modal onClose={handleCloseModal} scores={score} />}
    </div>
  );
}

export default Gameplay;
