import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css'
import axios from 'axios'; // Import axios for HTTP requests

const Profile = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Retrieve email from local storage
        const storedEmail = localStorage.getItem('currentUser');
        setEmail(storedEmail);
    }, []);

    const handleResetPassword = async () => {
        try {
            await axios.post('http://localhost:5000/reset-password', { email, password, confirmPassword });
            setMessage('Password reset successfully!');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage('Failed to reset password');
        }
    };

    return (
        <div  className={styles.container}>
            <h1>{email}</h1>
            <h2 style={{fontSize: "2rem"}}>Change Password</h2>
            <input className={styles.InputTags}  type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required /> {/* Updated class name */}
            <input className={styles.InputTags}  type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /> {/* Updated class name */}
            <button className={styles.Reset} onClick={handleResetPassword}>Reset Password</button> {/* Updated class name */}
            <p style={{marginBottom: '30px'}} >{message}</p>
            <h2>User's History</h2>
        </div>
    );
};

export default Profile;
