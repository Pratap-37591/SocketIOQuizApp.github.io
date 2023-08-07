// Timer.js
import React, { useEffect, useState } from 'react';
import './timer.scss';
const Timer = ({ timeLeft }) => {
    const [seconds, setSeconds] = useState(timeLeft);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prevSeconds) => prevSeconds - 1);
        }, 1000);

        // Clean up the timer when the component unmounts or when timeLeft changes
        return () => {
            clearInterval(timer);
        };
    }, [timeLeft]);

    return (
        <div className="timer">
            <p>Time Left: {seconds} seconds</p>
        </div>
    );
};

export default Timer;
