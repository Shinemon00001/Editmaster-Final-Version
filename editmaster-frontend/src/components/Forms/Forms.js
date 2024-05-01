import React from 'react';
import CreateRoomForm from './CreateRoom/CreateRoom';
import JoiningRoomForm from './JoiningRoom/JoiningRoom';
import styles from './Forms.module.css';


const Forms = ({ uuid, socket, setUser }) => {
    return (
        <div className={styles.container}>
            <h1>Collaborate with Users </h1>
            <div className={styles.section}>
                <h2>Create Room</h2>
                <CreateRoomForm uuid={uuid} socket = {socket} setUser={setUser} />
            </div>

            <div className={styles.section}>
                <h2>Join Room</h2>
                <JoiningRoomForm  uuid={uuid} socket = {socket} setUser={setUser} />
            </div>
        </div>
    )
}

export default Forms;
