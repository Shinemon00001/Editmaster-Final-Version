import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './RegisterForm.module.css'; // Import CSS module

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/register', { email, password });
            // Store the current email in localStorage
            localStorage.setItem('currentUser', email);
            alert("Registration successful!");
            setEmail('');
            setPassword('');
            navigate('/home');
        } catch (error) {
            alert("Registration failed: " + error.response.data);
        }
    };

    return (
        <div className={styles.registerContainer}> {/* Adding class */}
            <h2>Welcome to Edit-master</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.inputContainer}> {/* Adding class */}
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className={styles.inputContainer}> {/* Adding class */}
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className={styles.registerButton}>Register</button> {/* Adding class */}
            </form>
            <label className={styles.registerlabel}>Already have an account? <Link to="/login">Login</Link></label> {/* Adding class */}
        </div>
    );
};

export default RegisterForm;
