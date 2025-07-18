# Collaborative-Whiteboard

*COMPANY *: CODTECH IT SOLUTIONS

*NAME *: Laivish Sharma

$INTERN ID *: CT06DF1875 

$DOMAIN *: MERN STACK WEB DEVELOPMENT

*DURATION *: 6 WEEEKS

*MENTOR *: NEELA SANTOSH

---

## A real-time collaborative whiteboard application built using **HTML**, **CSS**, **JavaScript**, and **Socket.IO**. Users can draw together, add text, and interact live on a shared canvas across multiple devices connected over the same network.

---

## 🚀 Features

- 🖊️ Real-time drawing across devices
- 🌐 Works over LAN using WebSockets
- 🔤 Text tool for typing on canvas
- 🧽 Clear canvas button
- 👤 Displays latest drawer's ID (optional)
- 📱 Fully responsive layout

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Realtime:** Socket.IO
- **Network:** Localhost / LAN

---

## 🧑‍💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/collaborative-whiteboard.git
cd collaborative-whiteboard
2. Install Dependencies
cd server
npm install
3. Run the Server
set HOST=0.0.0.0 && npm start

4. Open Client Side
Open index.html from the client folder in browser
or

Use any static server like Live Server in VS Code


📁 Project Structure

collab-whiteboard/
├── client/                         # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Whiteboard.js       # Main whiteboard component
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles/
│   │       └── Whiteboard.css      # Optional styling
│   ├── package.json
│   └── .env                        # React environment variables
│
├── server/                         # Express Backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection (optional)
│   ├── routes/
│   │   └── api.js                  # Optional REST API
│   ├── models/
│   │   └── Canvas.js               # Optional: Mongoose model for canvas sessions
│   ├── socket.js                   # Socket.IO logic (optional split)
│   ├── index.js                    # Main server entry (Express + Socket.IO)
│   ├── .env
│   └── package.json
│
├── README.md
├── .gitignore

