const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const users = {};

io.on('connection', (socket) => {
  const username = `User-${Math.floor(Math.random() * 1000)}`;
  users[socket.id] = username;

  console.log(`${username} connected`);

  // ✅ Send username to this client
  socket.emit('user-assigned', username);

  // ✅ Broadcast draw
  socket.on('draw', (data) => {
    io.emit('draw', { ...data });
  });

  // ✅ Broadcast text
  socket.on('place-text', (data) => {
    io.emit('place-text', { ...data });
  });

  // ✅ Broadcast clear
  socket.on('clear', () => {
    io.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log(`${users[socket.id]} disconnected`);
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
