// ============================================
// REQUIRE MODULES
// ============================================
const mongoose = require('mongoose');       // MongoDB ODM for database operations
const express = require('express');          // Web framework for handling HTTP requests
const app = express();                       // Create an Express application instance
const http = require('http');                // Node's built-in HTTP module (needed for socket.io)
const { Server } = require('socket.io');     // Socket.io for real-time WebSocket communication
const path = require('path');                // Utility for working with file paths
const Chat = require('./models/chat');       // Chat model (Mongoose schema)
const User = require('./models/user');       // User model (for login/signup)

// ============================================
// CREATE HTTP SERVER + SOCKET.IO
// - Express alone can't do WebSockets
// - We wrap it in an HTTP server and attach socket.io
// ============================================
const server = http.createServer(app);
const io = new Server(server);

// ============================================
// EXPRESS CONFIGURATION
// ============================================

// Serve static files (CSS, images, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming form data (URL-encoded) so req.body works
app.use(express.urlencoded({ extended: true }));

// Parse incoming JSON data so req.body works for JSON requests
app.use(express.json());

// Set the folder where EJS templates are stored
app.set('views', path.join(__dirname, 'views'));

// Set EJS as the template engine for rendering HTML
app.set('view engine', 'ejs');

// Random avatar colors for new users (assigned on signup)
const avatarColors = ['#00a884', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#e17055'];

// ============================================
// ROUTES
// ============================================

// ---- Home Page (/) ----
// Modern landing page with login/signup links
app.get('/', (req, res) => {
    res.render('home');
});

// ---- Signup Page ----
// GET: Show the signup form
app.get('/signup', (req, res) => {
    res.render('signup', { error: null });
});

// POST: Handle signup form submission
app.post('/signup', async (req, res) => {
    try {
        const { name, phone, password } = req.body;  // Extract form data

        // Check if phone number is already registered
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            // Phone already taken - show error
            return res.render('signup', { error: 'This phone number is already registered. Try logging in.' });
        }

        // Pick a random avatar color for the user
        const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

        // Create new user in MongoDB
        const newUser = new User({
            name,
            phone,
            password,        // Note: In production, hash this with bcrypt!
            avatarColor: randomColor
        });
        await newUser.save();

        console.log(`New user registered: ${name} (${phone})`);

        // Redirect to login page with success message
        res.redirect('/login?registered=true');

    } catch (err) {
        console.error('Signup error:', err);
        res.render('signup', { error: 'Something went wrong. Please try again.' });
    }
});

// ---- Login Page ----
// GET: Show the login form
app.get('/login', (req, res) => {
    // Check if user just registered (show success message)
    const success = req.query.registered ? 'Account created! You can now log in.' : null;
    res.render('login', { error: null, success });
});

// POST: Handle login form submission
app.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;  // Extract form data

        // Find user by phone number
        const user = await User.findOne({ phone });

        if (!user) {
            // No account with this phone
            return res.render('login', { error: 'No account found with this phone number.', success: null });
        }

        if (user.password !== password) {
            // Wrong password (simple comparison - use bcrypt in production!)
            return res.render('login', { error: 'Incorrect password. Please try again.', success: null });
        }

        // Login successful — redirect to chat with username as query param
        // The chat page will use this name automatically
        console.log(`User logged in: ${user.name} (${phone})`);
        res.redirect(`/chat?user=${encodeURIComponent(user.name)}`);

    } catch (err) {
        console.error('Login error:', err);
        res.render('login', { error: 'Something went wrong. Please try again.', success: null });
    }
});

// ---- Chat History Page ----
// Shows all saved messages from MongoDB
app.get('/chats', async (req, res) => {
    try {
        // Fetch all chats from database, sorted newest first
        let chats = await Chat.find().sort({ create_at: -1 });
        // Render the index.ejs template and pass the chats data
        res.render('index', { chats });
    } catch (err) {
        console.error('Error fetching chats', err);
        res.status(500).send('Error fetching chats');
    }
});

// ---- Live Chat Room ----
// Real-time chat between users
app.get('/chat', (req, res) => {
    // Pass the username from query param (set after login)
    const username = req.query.user || '';
    res.render('chat', { username });
});

// ============================================
// SOCKET.IO - Real-Time Communication
// - This handles live messaging between users
// - Each user connects via WebSocket (not HTTP)
// ============================================

// Track connected users: { socketId: username }
let onlineUsers = {};

// Fires when a new user connects to the server via WebSocket
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // --- Event: User joins the chat with a username ---
    socket.on('join', (username) => {
        // Store the username mapped to their socket ID
        onlineUsers[socket.id] = username;
        console.log(`${username} joined the chat`);

        // Broadcast to ALL users (including sender) that someone joined
        io.emit('user-joined', {
            username,
            onlineCount: Object.keys(onlineUsers).length
        });
    });

    // --- Event: User sends a chat message ---
    socket.on('send-message', async (data) => {
        // data = { to, msg } sent from the client
        const from = onlineUsers[socket.id]; // Get sender's username

        // Save the message to MongoDB so it appears in chat history
        try {
            let newChat = new Chat({
                from: from,
                to: data.to,
                msg: data.msg
            });
            await newChat.save();
        } catch (err) {
            console.error('Error saving chat:', err);
        }

        // Broadcast the message to ALL connected users in real-time
        io.emit('receive-message', {
            from: from,
            to: data.to,
            msg: data.msg,
            time: new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        });
    });

    // --- Event: User is typing (shows "typing..." to others) ---
    socket.on('typing', () => {
        // Broadcast to everyone EXCEPT the sender
        socket.broadcast.emit('user-typing', onlineUsers[socket.id]);
    });

    // --- Event: User stopped typing ---
    socket.on('stop-typing', () => {
        socket.broadcast.emit('user-stop-typing');
    });

    // --- Event: User disconnects (closes tab, loses connection) ---
    socket.on('disconnect', () => {
        const username = onlineUsers[socket.id];
        delete onlineUsers[socket.id]; // Remove from tracking

        if (username) {
            console.log(`${username} left the chat`);
            // Notify everyone that a user left
            io.emit('user-left', {
                username,
                onlineCount: Object.keys(onlineUsers).length
            });
        }
    });
});

// ============================================
// START SERVER & CONNECT TO MONGODB
// - Using server.listen (NOT app.listen) because
//   socket.io needs the HTTP server, not just Express
// ============================================
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Connect to MongoDB database named "whatsapp"
main()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}








  //mongoose.connect('mongodb://127.0.0.1:27017/test');

// main()
// .then(()=>{
//     console.log('Connected to MongoDB');
// })
// .catch((err)=>{    
//     console.error('Error connecting to MongoDB', err);   })

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/test');
// }

// const userSchema = new mongoose.Schema({
//     name: String,
    
//     email: String,
//     age: Number,
// });

// const User = mongoose.model('User', userSchema);

// const user1 = new User({
//     name: 'Alice',
//     email: 'alice@example.com',
//     age: 30
// });
// user1.save();

// const user2 = new User({
//     name: 'Bob',
//     email: 'bob@example.com',
//     age: 25
// });
// user2.save();

// const user3 = new User({
//     name: 'Charlie',
//     email: 'charlie@example.com',
//     age: 35
// });
// user3.save();

// const user4 = new User({
//     name: 'Diana',
//     email: 'diana@example.com',
//     age: 28
// });
// user4.save();

// const user5 = new User({
//     name: 'Eve',
//     email: 'eve@example.com',
//     age: 32
// });
// user5.save();

// const user6 = new User({
//     name: 'Frank',
//     email: 'frank@example.com',
//     age: 27
// });
// user6.save();

// const user7 = new User({
//     name: 'Grace',
//     email: 'grace@example.com',
//     age: 31
// });
// user7.save();

// const user8 = new User({
//     name: 'Henry',
//     email: 'henry@example.com',
//     age: 29
// });
// user8.save();

// const user9 = new User({
//     name: 'Iris',
//     email: 'iris@example.com',
//     age: 26
// });
// user9.save();

// const user10 = new User({
//     name: 'Jack',
//     email: 'jack@example.com',
//     age: 33
// });
// user10.save();

// const user11 = new User({
//     name: 'Kate',
//     email: 'kate@example.com',
//     age: 24
// });
// user11.save();

// User.updateOne({ name: 'Alice' }, { age: 31 })
// .then(() => {
//     console.log('User updated successfully');
// })
// .catch((err) => {
//     console.error('Error updating user', err);
// });

// module.exports = {
//     User,
// };
//User.find().then((users)=>{
//     console.log(users);
// })
// .catch((err)=>{
//     console.error('Error fetching users', err);
// });
