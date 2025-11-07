const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");
const Rooms = require("./rooms");

const app = express();
const server = http.createServer(app);

// ✅ Use your deployed Vercel frontend URL here
const FRONTEND_URL = "https://collaborative-canvas-five.vercel.app";

app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000"], // Allow local dev too
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// ✅ Create socket.io instance with same CORS config
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Serve frontend files (optional — for debugging)
app.use(express.static(path.join(__dirname, "../client")));

const rooms = new Rooms();

io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  socket.on("join-room", (data) => {
    const { roomCode, userName } = data;
    const clientIp = socket.handshake.address;
    console.log(`User ${socket.id} (${userName}) joining ${roomCode} from ${clientIp}`);

    const result = rooms.joinRoom(roomCode, socket.id, userName, clientIp);
    if (result.error) {
      socket.emit("error", result.error);
      console.log(`❌ Join failed: ${result.error}`);
      return;
    }

    socket.join(roomCode);
    socket.emit("joined-room", {
      userId: socket.id,
      users: rooms.getUsers(roomCode),
      strokes: rooms.getStrokes(roomCode),
    });

    socket.to(roomCode).emit("user-joined", { users: rooms.getUsers(roomCode) });
    console.log(`✅ ${userName} joined ${roomCode}`);
  });

  socket.on("update-name", (newName) => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      rooms.updateUserName(roomCode, socket.id, newName);
      io.to(roomCode).emit("name-updated", { users: rooms.getUsers(roomCode) });
      console.log(`✏️ ${socket.id} updated name to ${newName}`);
    }
  });

  socket.on("stroke", (stroke) => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      rooms.addStroke(roomCode, stroke);
      socket.to(roomCode).emit("stroke", stroke);
    }
  });

  socket.on("undo", () => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      const undone = rooms.undo(roomCode);
      if (undone) io.to(roomCode).emit("undo", undone.id);
    }
  });

  socket.on("redo", () => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      const redone = rooms.redo(roomCode);
      if (redone) io.to(roomCode).emit("redo", redone);
    }
  });

  socket.on("cursor", (data) => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      socket.to(roomCode).emit("cursor", { userId: socket.id, ...data });
    }
  });

  socket.on("leave-room", () => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      rooms.removeUser(roomCode, socket.id, true);
      socket.to(roomCode).emit("user-left", { users: rooms.getUsers(roomCode) });
      socket.leave(roomCode);
      console.log(`👋 ${socket.id} left ${roomCode}`);
    }
  });

  socket.on("disconnect", () => {
    const roomCode = rooms.getRoomByUser(socket.id);
    if (roomCode) {
      rooms.removeUser(roomCode, socket.id, false);
      socket.to(roomCode).emit("user-left", { users: rooms.getUsers(roomCode) });
      console.log(`🔴 ${socket.id} disconnected from ${roomCode}`);
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`🚀 Server running on port ${port}`));
