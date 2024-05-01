import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from "./AdminForm.module.css"; // Import CSS module

const AdminForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/admin/login', { username, password });
            alert("Admin login successful!");
            navigate('/AdminPanel'); // Redirect to AdminPanel after successful login
        } catch (error) {
            alert("Admin login failed: " + error.response.data);
        }
    };

    return (
        <div>
            <h2 className={styles.centeredH2}>Admin Login</h2> {/* Add className */}
            <form onSubmit={handleSubmit} className={styles.adminForm}> {/* Add className */}
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" className={styles.adminButton}>Login as Admin</button> {/* Add className */}
            </form>
            <div className={styles.centeredBacklink} ><label >Back to user: <a href="/login">Login</a></label></div>
        </div>
    );
};

export default AdminForm;
