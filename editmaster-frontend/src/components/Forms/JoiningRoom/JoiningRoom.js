import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JoiningRoom.module.css';

const JoiningRoomForm = ({uuid, socket, setUser}) =>{

    const [roomId, setRoomId] = useState("");
    const [name, setName] = useState("");

    const navigate = useNavigate();

    const handleJoinRoom = (e) => {
        e.preventDefault();
        const roomData ={
            name,
            roomId,
            userId: uuid(),
            host:false,
            presenter:false
        }
        setUser(roomData);
        navigate(`/Room/${roomId}`);
        socket.emit("userJoined" , roomData);
    };

    return(
        <form>
            <div>
                <input className={styles.jointags}  type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value) } />
            </div>
            <div>
                <input className={styles.jointags} type="text" placeholder="Enter Room Code"  value={roomId} onChange={(e) => setRoomId(e.target.value) } />
            </div>
            <button className={styles.joinbutton} type='submit' onClick={handleJoinRoom} >Join Room</button>
        </form>
    );
}

export default JoiningRoomForm;
