const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Rooms = require('./rooms');
const cors = require('cors') ;


const app = express();

app.use(cors({ origin: "*" }));
app.use(express.static(path.join(__dirname, "../client")));

const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('client'));

const rooms = new Rooms();

io.on('connection', (socket) => {
  socket.on('join-room', (data) => {
    const { roomCode, userName } = data;
    const clientIp = socket.handshake.address;
    console.log(`User ${socket.id} (${userName}) trying to join room ${roomCode} from IP ${clientIp}`);
    const result = rooms.joinRoom(roomCode, socket.id, userName, clientIp);
    if (result.error) {
      socket.emit('error', result.error);
      console.log(`Join failed: ${result.error}`);
      return;
    }
    socket.join(roomCode);
    socket.emit('joined-room', {
      userId: socket.id,
      users: rooms.getUsers(roomCode),
      strokes: rooms.getStrokes(roomCode) // Send existing canvas data
    });
    socket.to(roomCode).emit('user-joined', { users: rooms.getUsers(roomCode) });
    console.log(`User ${socket.id} joined room ${roomCode} with ${rooms.getStrokes(roomCode).length} existing strokes`);
  });

  socket.on('update-name', (newName) => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      rooms.updateUserName(roomCode, socket.id, newName);
      io.to(roomCode).emit('name-updated', { users: rooms.getUsers(roomCode) });
      console.log(`User ${socket.id} updated name to ${newName}`);
    }
  });

  socket.on('stroke', (stroke) => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      rooms.addStroke(roomCode, stroke); // Save stroke in room data
      socket.to(roomCode).emit('stroke', stroke); // Broadcast to others
      console.log(`Stroke added to room ${roomCode}`);
    }
  });

  socket.on('undo', () => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      const undone = rooms.undo(roomCode);
      if (undone) io.to(roomCode).emit('undo', undone.id);
    }
  });

  socket.on('redo', () => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      const redone = rooms.redo(roomCode);
      if (redone) io.to(roomCode).emit('redo', redone);
    }
  });

  socket.on('cursor', (data) => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      socket.to(roomCode).emit('cursor', { userId: socket.id, ...data });
    }
  });

  socket.on('leave-room', () => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      rooms.removeUser(roomCode, socket.id, true); // Manual leave, delete immediately if empty
      socket.to(roomCode).emit('user-left', { users: rooms.getUsers(roomCode) });
      socket.leave(roomCode);
      console.log(`User ${socket.id} manually left room ${roomCode}`);
    }
  });

  socket.on('disconnect', () => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      rooms.removeUser(roomCode, socket.id, false); // Disconnect, use timeout for deletion
      socket.to(roomCode).emit('user-left', { users: rooms.getUsers(roomCode) });
      console.log(`User ${socket.id} disconnected from room ${roomCode}`);
    }
  });
});

// server.listen(3000, () => console.log('Server running on port 3000'));

// To:
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on port ${port}`));