const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", 
      methods: ["GET", "POST"]
    },
});

let roomIdGlobal,ImageJSONGlobal;

// Socket.IO connection event
io.on("connection", (socket) => {
      console.log("User connected");

      socket.on("disconnect", () => {
        console.log("User disconnected");
    });

      socket.on("userJoined",(data)=>{
        const {name, userId, roomId, host, presenter} = data;
        roomIdGlobal = roomId ;
        socket.join(roomId);
        socket.emit("userIsJoined", {success: true});
        // socket.broadcast.to(roomId).emit("allUsers");
        socket.broadcast.to(roomId).emit("ImageDataResponse",{
            ImageJSON: ImageJSONGlobal,
        })
    })
    socket.on("collabPhotoSend",(data)=>{
        ImageJSONGlobal = data;
        socket.broadcast.to(roomIdGlobal).emit("ImageDataResponse",{
            ImageJSON: ImageJSONGlobal,
        })
    });
});



const db = new sqlite3.Database('./db/editmasters.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    createTables();
  }
});

// Create tables
const createTables = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      isActive BOOLEAN DEFAULT 1,
      resetToken TEXT DEFAULT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created successfully.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imageData TEXT,
      userEmail TEXT,
      FOREIGN KEY (userEmail) REFERENCES users(email)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating photos table:', err.message);
    } else {
      console.log('Photos table created successfully.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS EditedPDF (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pdfData BLOB,
      userEmail TEXT,
      FOREIGN KEY (userEmail) REFERENCES users(email)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating EditedPDF table:', err.message);
    } else {
      console.log('EditedPDF table created successfully.');
    }
  });
};


// User registration endpoint
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    
    // Check if email ends with "@gmail.com"
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).send("Invalid email. Please provide a Gmail address.");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run("INSERT INTO users (email, password, isActive) VALUES (?, ?, ?)", [email, hashedPassword, true], (err) => {
            if (err) {
                res.status(400).send("User already exists");
            } else {
                res.status(201).send("User registered successfully");
            }
        });
    } catch (error) {
        res.status(500).send("Internal server error");
    }
});

// User login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
        if (err) {
            res.status(500).send("Internal server error");
        } else if (!row) {
            res.status(404).send("User not found");
        } else {
            if (!row.isActive) {
                res.status(403).send("You are blocked by the admin");
            } else {
                try {
                    const match = await bcrypt.compare(password, row.password);
                    if (match) {
                        res.status(200).send("Login successful");
                    } else {
                        res.status(401).send("Invalid password");
                    }
                } catch (error) {
                    res.status(500).send("Internal server error");
                }
            }
        }
    });
});

// Admin login endpoint
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '123') {
        res.status(200).send("Admin login successful");
    } else {
        res.status(401).send("Admin login failed");
    }
});

// Get all users endpoint (for admin panel)
app.get('/admin/users', (req, res) => {
    db.all("SELECT id, email, isActive FROM users", (err, rows) => {
        if (err) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(rows);
        }
    });
});

// Update user status endpoint
app.patch('/admin/users/:userId', (req, res) => {
    const userId = req.params.userId;
    const { isActive } = req.body;
    
    // Update user status in the database
    db.run("UPDATE users SET isActive = ? WHERE id = ?", [isActive, userId], (err) => {
        if (err) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).send("User status updated successfully");
        }
    });
});


// User forgot password endpoint
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Generate reset token 
        const resetToken = generateResetToken();

        // Save reset token in the database for the user
        await saveResetToken(user.id, resetToken);        //error

        // Send email with reset password link
        const resetLink = `http://localhost:3000/reset-password`;
        await sendResetPasswordEmail(email, resetLink);

        res.status(200).send("Reset password link sent successfully");
    } catch (error) {
        res.status(500).send("Internal server error");
    }
});

// Helper function to get user by email
const getUserByEmail = async (email) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Helper function to generate reset token
const generateResetToken = () => {
    // Generate a random token 
    return Math.random().toString(36).substring(7);
};

// Helper function to save reset token in the database
const saveResetToken = async (userId, resetToken) => {
    return new Promise((resolve, reject) => {
        // Save reset token in the database for the user
        db.run("UPDATE users SET resetToken = ? WHERE id = ?", [resetToken, userId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Helper function to send reset password email
const sendResetPasswordEmail = async (email, resetLink) => {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
  auth: {
    user: 'qq03917@gmail.com',   // This gmail will not work you need to enter your own gmail with third party password
    pass: 'uvig hmrb kmjs xuzo'
  }
    });

    // Configure email options
    const mailOptions = {
        from: 'qq03917@gmail.com', // Sender address
        to: 'matecheck355@gmail.com', // Receiver address
        subject: 'Reset Password', // Subject line
        text: `Please click on the following link to reset your password: ${resetLink}`, // Plain text body
        html: `<p>Please click on the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>` // HTML body
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

// User reset password endpoint
app.post('/reset-password', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    try {
        // Check if user exists
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            return res.status(400).send("Password and confirm password do not match");
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password in the database
        await updateUserPassword(user.id, hashedPassword);

        res.status(200).send("Password reset successfully");
    } catch (error) {
        res.status(500).send("Internal server error");
    }
});

// Helper function to update user's password in the database
const updateUserPassword = async (userId, hashedPassword) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};


const PORT = process.env.PORT || 5000; // Use environment port or 5000 as default
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = db; // Export SQLite database instance for use in other files

