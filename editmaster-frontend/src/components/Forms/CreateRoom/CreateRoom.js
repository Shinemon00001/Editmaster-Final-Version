import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateRoom.module.css';

const CreateRoomForm = ({ uuid, socket, setUser }) => {

    const [roomId,setRoomId] = useState(uuid());
    const [name,setName] = useState("");

    const navigate = useNavigate();

    const handleCreateRoom = (e) =>{
            e.preventDefault();
            const roomData ={
                name,
                roomId,
                userId: uuid(),
                host:true,
                presenter:true
            }
            setUser(roomData);
            navigate(`/Room/${roomId}`);
            console.log(roomData);
            socket.emit("userJoined" , roomData);
    }

    return (
        <form>
            <div>
                <input className={styles.Inputtags} type="text" placeholder="Enter your name" value={name} onChange={(e)=> setName(e.target.value)} />
            </div>
            <div className={styles.buttonContainer}>
                <input className={styles.Inputtags} type="text" placeholder="Generate Room Code" value={roomId} disabled />
                <button type="button" onClick={ () => setRoomId(uuid())} >Generate</button>
                <button type="button">Copy</button>
            </div>
            <button className={styles.submitbutton} type='submit' onClick={handleCreateRoom} >Create Room</button>
        </form>
    )
}

export default CreateRoomForm;
