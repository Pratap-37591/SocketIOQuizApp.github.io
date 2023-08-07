import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './lobby.scss';

const socket = io(); // Replace with your Socket.IO server URL

function 
Lobby() {
    const [rooms, setRooms] = useState([]);
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Socket.IO event listener for room updates
        socket.on('room-updated', handleRoomUpdated);

        // Fetch the list of available rooms when the component mounts
        fetchRooms();

        return () => {
            // Clean up event listener when the component unmounts
            socket.off('room-updated', handleRoomUpdated);
        };
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axios.get('/api/lobby/rooms');
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const handleRoomUpdated = (data) => {
        // Update the list of rooms when a room is created or a user joins/leaves a room
        setRooms(data);
    };

    const handleCreateRoom = async () => {
        try {
            const response = await axios.post('/api/lobby/rooms');
            joinRoom(response.data.roomId);
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    const handleJoinRoom = async (roomId) => {
        try {
            joinRoom(roomId);
        } catch (error) {
            console.error('Error joining room:', error);
        }
    };

    const joinRoom = (roomId) => {
        // Emit the 'join-room' event to the server when a user clicks on the "Join" button for a room
        socket.emit('join-room', roomId);
    };

    const handleLeaveRoom = (roomId) => {
        // Emit the 'leave-room' event to the server when a user leaves a room
        socket.emit('leave-room', roomId);
    };

    return (
        <div className="lobby">
            <h2>Lobby</h2>
            <div>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                />
            </div>
            <button onClick={handleCreateRoom}>Create Room</button>
            <div>
                <h3>Available Rooms</h3>
                <ul>
                    {rooms.map((room) => (
                        <li key={room.id}>
                            Room {room.id}
                            <button onClick={() => handleJoinRoom(room.id)}>Join</button>
                            <button onClick={() => handleLeaveRoom(room.id)}>Leave</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Lobby;
