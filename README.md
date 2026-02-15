# WhatsApp Web - Real-Time Chat Application

live link : https://chatbox-mern.onrender.com

A real-time chat application built with **Node.js**, **Express**, **Socket.io**, **MongoDB (Mongoose)**, and **EJS**.

## Author

**Majedul Islam**

## Features

- **Modern Landing Page** — Hero section with animated background, phone mockup, and feature cards
- **Phone Number Auth** — Sign up and log in using your phone number
- **Real-Time Messaging** — Instant messaging powered by Socket.io (WebSockets)
- **Typing Indicator** — See when someone is typing
- **Online Status** — Live online user count
- **Chat History** — All messages saved to MongoDB and viewable at `/chats`
- **Dark Theme UI** — WhatsApp-inspired dark mode design
- **Responsive** — Works on desktop and mobile

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js    | Server runtime |
| Express    | Web framework |
| Socket.io  | Real-time WebSocket communication |
| MongoDB    | Database |
| Mongoose   | MongoDB ODM |
| EJS        | Template engine |

## Project Structure

```
├── index.js              # Main server (Express + Socket.io + routes)
├── package.json
├── models/
│   ├── chat.js           # Chat message schema
│   └── user.js           # User schema (phone auth)
├── views/
│   ├── home.ejs          # Landing page (/)
│   ├── signup.ejs        # Signup page (/signup)
│   ├── login.ejs         # Login page (/login)
│   ├── chat.ejs          # Live chat room (/chat)
│   └── index.ejs         # Chat history (/chats)
└── public/
    └── css/
        └── style.css     # All styles (separated from views)
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/majedul0/chatApp-using-Express-Node-Mongoose.git
   cd Mongoose
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   ```bash
   mongosh
   ```

4. **Run the server**
   ```bash
   node index.js
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Landing page |
| `/signup` | GET/POST | User registration (phone number) |
| `/login` | GET/POST | User login |
| `/chat` | GET | Live chat room (real-time) |
| `/chats` | GET | Chat history (all saved messages) |

## How to Test Real-Time Chat

1. Start the server with `node index.js`
2. Open **two browser tabs** at `http://localhost:3000`
3. Sign up with two different accounts (or use the same one in two tabs)
4. Send messages — they appear instantly in both tabs!

## REST API Reference

### Base URL

```
http://localhost:3000
```

---

### Pages (Server-Side Rendered)

#### `GET /`
**Landing Page** — Returns the modern home page with login/signup links.

#### `GET /chat`
**Live Chat Room** — Returns the real-time chat interface. Accepts an optional query parameter.

| Query Param | Type   | Description |
|-------------|--------|-------------|
| `user`      | String | Pre-fills the username (set automatically after login) |

**Example:**
```
GET /chat?user=Majedul
```

#### `GET /chats`
**Chat History** — Fetches all saved messages from MongoDB (sorted newest first) and renders them.

**Response:** HTML page listing all chat messages.

---

### Authentication API

#### `GET /signup`
**Signup Page** — Returns the registration form.

#### `POST /signup`
**Register a New User** — Creates a new user account with phone number.

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| `name`     | String | Yes      | User's display name |
| `phone`    | String | Yes      | Phone number (unique, used as login ID) |
| `password` | String | Yes      | Account password (min 4 chars) |

**Request (form-urlencoded):**
```
POST /signup
Content-Type: application/x-www-form-urlencoded

name=Majedul&phone=+919876543210&password=1234
```

**Success:** Redirects to `/login?registered=true`
**Error:** Re-renders signup page with error message (e.g., phone already registered)

---

#### `GET /login`
**Login Page** — Returns the login form.

| Query Param  | Type   | Description |
|--------------|--------|-------------|
| `registered` | String | If present, shows "Account created" success message |

#### `POST /login`
**Authenticate User** — Validates phone number and password.

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| `phone`    | String | Yes      | Registered phone number |
| `password` | String | Yes      | Account password |

**Request (form-urlencoded):**
```
POST /login
Content-Type: application/x-www-form-urlencoded

phone=+919876543210&password=1234
```

**Success:** Redirects to `/chat?user=<username>`
**Error:** Re-renders login page with error message

---

### WebSocket Events (Socket.io)

The chat uses **Socket.io** for real-time communication. Connect via:

```javascript
const socket = io('http://localhost:3000');
```

#### Client → Server Events

| Event           | Payload                   | Description |
|-----------------|---------------------------|-------------|
| `join`          | `username` (String)       | Join the chat room with a display name |
| `send-message`  | `{ to: String, msg: String }` | Send a message to a user |
| `typing`        | —                         | Notify others that you're typing |
| `stop-typing`   | —                         | Notify others that you stopped typing |

#### Server → Client Events

| Event             | Payload | Description |
|-------------------|---------|-------------|
| `receive-message` | `{ from, to, msg, time }` | A new message was sent |
| `user-joined`     | `{ username, onlineCount }` | A user joined the chat |
| `user-left`       | `{ username, onlineCount }` | A user left the chat |
| `user-typing`     | `username` (String) | A user is typing |
| `user-stop-typing` | — | A user stopped typing |

---

### Data Models

#### User Schema

| Field        | Type   | Required | Unique | Default   |
|--------------|--------|----------|--------|-----------|
| `name`       | String | Yes      | No     | —         |
| `phone`      | String | Yes      | Yes    | —         |
| `password`   | String | Yes      | No     | —         |
| `avatarColor`| String | No       | No     | `#00a884` |
| `created_at` | Date   | No       | No     | `Date.now`|

#### Chat Schema

| Field       | Type   | Required | Default    |
|-------------|--------|----------|------------|
| `from`      | String | Yes      | —          |
| `to`        | String | Yes      | —          |
| `msg`       | String | No       | —          |
| `create_at` | Date   | No       | `Date.now` |

## License

ISC
