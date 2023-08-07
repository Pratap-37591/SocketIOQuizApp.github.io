// Modal.jsx
import React from 'react';
import './modal.scss'
const Modal = ({ onClose, scores }) => {
    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Game Over!</h2>
                <p>Your final score: {scores}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Modal;
