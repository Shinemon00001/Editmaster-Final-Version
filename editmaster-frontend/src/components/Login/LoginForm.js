import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './LoginForm.module.css'; // Import CSS module

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', { email, password });
            alert("Login successful!");
            setEmail('');
            setPassword('');
            localStorage.setItem('currentUser', email); // Set current user in localStorage
            navigate('/home');
        } catch (error) {
            alert("Login failed: " + error.response.data);
        }
    };

    return (
        <div className={styles.loginContainer}> {/* Adjusted class name */}
            <h2 className={styles.centeredH2}>User Log-in</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.inputContainer}> {/* Adjusted class name */}
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className={styles.inputContainer}> {/* Adjusted class name */}
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className={styles.loginButton}>Login</button> {/* Adjusted class name */}
                <label className={styles.loginLabel}>Don't have an account? <Link to="/">Register</Link></label> {/* Adjusted class name */}
                <label className={styles.loginLabel}>Login as <Link to="/adminLogin">Admin</Link></label> {/* Adjusted class name */}
                <Link className={styles.loginLabel} to="/forgot-password">Forgot Password</Link> {/* Adjusted class name */}
            </form>
        </div>
    );
};

export default LoginForm;
