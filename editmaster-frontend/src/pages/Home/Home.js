import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Reset the collab choice when component mounts
        localStorage.setItem('collabChoice', null);
    }, []);
    const handleCollabClick = (choice) => {
        // Set the collab choice in local storage
        localStorage.setItem('collabChoice', choice);
    
        // Redirect to the specified link if choice is 'pdf'
        if (choice === 'pdf') {
            window.location.href = 'http://localhost:3001/index.html';
        }
    };
    

    return (
        <div className="dashboard" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={styles.leftSection} >
                <div>
                    <h2><Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</Link></h2>
                </div>
                <div>
                    <h3><Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Logout</Link></h3>
                </div>
            </div>
            <div className={styles.rightSection} >
                <div className={styles.editorSection} >
                    <h2 className={styles.editorTitle}>PDF Editor</h2>
                    <Link to="/pdf-editor"><button className={styles.editorButton} onClick={() => handleCollabClick(null)}>Edit PDF</button></Link>
                    <button className={styles.editorButton} onClick={() => handleCollabClick('pdf')}>Collaborate</button>
                </div>
                <div className={styles.editorSection}>
                    <h2  className={styles.editorTitle}>Photo Editor</h2>
                    <Link to="/photo-editor"><button className={styles.editorButton} onClick={() => handleCollabClick(null)}>Edit Photo</button></Link>
                    <Link to="/Room"><button className={styles.editorButton} onClick={() => handleCollabClick('photo')}>Collaborate</button></Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
