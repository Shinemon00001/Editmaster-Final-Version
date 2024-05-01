import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './components/Registration/RegisterForm';
import LoginForm from './components/Login/LoginForm';
import PdfEditor from './components/PDF-Editor/pdfeditor';
import AdminPanel from './components/AdminPanel/AdminPanel';
import AdminForm from './components/AdminLogin/AdminForm'; 
import ForgotPassword from './components/ForgotPassword/ForgotPassword'; 
import ResetPassword from './components/ResetPassword/ResetPassword'; 
import PhotoEditor from './components/PhotoEditor';
import Home from './pages/Home/Home'; 
import Profile from './pages/Profile/Profile'; 
import Forms from './components/Forms/Forms';
import Room from './pages/Room/Room';
import { v4 as uuidv4 } from 'uuid'; 
import io from 'socket.io-client';
import './App.css';

const socket = io("http://localhost:5000");

const App = () => {

  const [user,setUser] = useState(null);

  useEffect(() => {
    const handleUserJoined = (data) => {
        if (data.success) {
            console.log("userJoined");
        } else {
            console.log("userJoined error");
        }
    };

    socket.on("userIsJoined", handleUserJoined);

    return () => {
        // Clean up the listener when the component unmounts
        socket.off("userIsJoined", handleUserJoined);
    };
}, []);

  // Function to generate UUID
  const uuid = () => {
    return uuidv4();
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/pdf-editor" element={<PdfEditor  socket = {socket} />} />
          <Route path="/photo-editor" element={<PhotoEditor socket = {socket} />} />
          <Route path="/adminLogin" element={<AdminForm />} />
          <Route path="/adminPanel" element={<AdminPanel />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> 
          <Route path="/reset-password" element={<ResetPassword />} /> 
          <Route path="/home" element={<Home />} />
          <Route path="/Room" element={<Forms uuid={uuid} socket = {socket} setUser = {setUser} />} />
          <Route path="Room/:roomId" element={<Room  user = {user}  socket={socket} />} />
          <Route path="/profile" element={<Profile />} /> 
        </Routes>
      </Router>
    </div>
  );
};

export default App;
