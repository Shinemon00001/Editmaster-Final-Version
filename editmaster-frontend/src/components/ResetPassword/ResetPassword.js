import React, { useState } from 'react';
import axios from 'axios';
import styles from "./ResetPassword.module.css"; // Import CSS module

const ResetPassword = () => {
    const [email, setEmail] = useState(''); // Define email state variable
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleResetPassword = async () => {
        try {
            await axios.post('http://localhost:5000/reset-password', { email, password, confirmPassword });
            setMessage('Password reset successfully!');
        } catch (error) {
            setMessage('Failed to reset password');
        }
    };

    return (
        <div className={styles.centeredH2} >
            <h2>Reset Password</h2>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.resetFields} /> {/* Updated class name */}
            <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.resetFields} /> {/* Updated class name */}
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={styles.resetFields} /> {/* Updated class name */}
            <button onClick={handleResetPassword} className={styles.resetButtonWidth}>Reset Password</button> {/* Updated class name */}
            <p>{message}</p>
        </div>
    );
};

export default ResetPassword;
