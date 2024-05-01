import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoEditor from '../../components/PhotoEditor';

const RoomPage = ({ user, socket }) => {
    const navigate = useNavigate();

    // Retrieve the collabChoice from local storage
    const collabChoice = localStorage.getItem('collabChoice');

   

    return (
        <div>
            {collabChoice === 'photo' ? (
                <PhotoEditor socket={socket} />
            ) : (
                <div>
                    {/* Render a default component if collabChoice is not set */}
                    Please select an editor to collaborate.
                </div>
            )}
        </div>
    );
};

export default RoomPage;
