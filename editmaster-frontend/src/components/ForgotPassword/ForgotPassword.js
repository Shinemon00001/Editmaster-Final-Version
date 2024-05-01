import React, { useState } from 'react';
import axios from 'axios';
import styles from "./ForgotPassword.module.css"; // Import CSS module

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSendMail = async () => {
        try {
            await axios.post('http://localhost:5000/forgot-password', { email });
            setMessage('Password reset email sent successfully!');
        } catch (error) {
            setMessage('Failed to send password reset email');
        }
    };

    return (
        <div className={styles.centeredH2} >
            <h2>Forgot Password</h2>
            <input type="email" className={styles.forgotEmail} placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required /> {/* Updated class name */}
            <button className={styles.forgotButton} onClick={handleSendMail}>Send Email</button> {/* Updated class name */}
            <p>{message}</p>
        </div>
    );
};

export default ForgotPassword;
