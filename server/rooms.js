class Rooms {
  constructor() {
    this.rooms = {}; // {roomCode: {users: [{id, name, color, ip}], strokes: [], undoStack: [], redoStack: [], deleteTimeout: id}}
  }

  joinRoom(roomCode, userId, userName, ip) {
    if (!this.rooms[roomCode]) {
      this.rooms[roomCode] = { users: [], strokes: [], undoStack: [], redoStack: [], deleteTimeout: null };
    } else {
      // Cancel deletion timeout if room exists and someone rejoins
      if (this.rooms[roomCode].deleteTimeout) {
        clearTimeout(this.rooms[roomCode].deleteTimeout);
        this.rooms[roomCode].deleteTimeout = null;
        console.log(`Room ${roomCode} deletion canceled due to rejoin`);
      }
    }
    const room = this.rooms[roomCode];
    // Check for same IP (only one user per IP per room)
    const existingUser = room.users.find(u => u.ip === ip);
    if (existingUser) {
      existingUser.id = userId; // Update ID on reconnect
      existingUser.name = userName;
      return { error: null };
    }
    // Ensure unique name
    let finalName = userName;
    let counter = 1;
    while (room.users.some(u => u.name === finalName)) {
      finalName = `${userName}${counter}`;
      counter++;
    }
    const color = this.getRandomColor();
    room.users.push({ id: userId, name: finalName, color, ip });
    return { error: null };
  }

  removeUser(roomCode, userId, isManualLeave = false) {
    if (this.rooms[roomCode]) {
      this.rooms[roomCode].users = this.rooms[roomCode].users.filter(u => u.id !== userId);
      if (this.rooms[roomCode].users.length === 0) {
        if (isManualLeave) {
          // Delete immediately on manual leave
          delete this.rooms[roomCode];
          console.log(`Room ${roomCode} deleted immediately (manual leave)`);
        } else {
          // Set timeout for deletion on disconnect (e.g., refresh)
          this.rooms[roomCode].deleteTimeout = setTimeout(() => {
            delete this.rooms[roomCode];
            console.log(`Room ${roomCode} deleted after timeout`);
          }, 10000); // 10 seconds
          console.log(`Room ${roomCode} scheduled for deletion in 10 seconds`);
        }
      }
    }
  }

  updateUserName(roomCode, userId, newName) {
    if (this.rooms[roomCode]) {
      const user = this.rooms[roomCode].users.find(u => u.id === userId);
      if (user) {
        // Ensure unique name
        let finalName = newName;
        let counter = 1;
        while (this.rooms[roomCode].users.some(u => u.name === finalName && u.id !== userId)) {
          finalName = `${newName}${counter}`;
          counter++;
        }
        user.name = finalName;
      }
    }
  }

  getUsers(roomCode) {
    return this.rooms[roomCode]?.users || [];
  }

  getStrokes(roomCode) {
    return this.rooms[roomCode]?.strokes || [];
  }

  getRoomByUser(userId) {
    for (const [code, room] of Object.entries(this.rooms)) {
      if (room.users.some(u => u.id === userId)) return code;
    }
    return null;
  }

  addStroke(roomCode, stroke) {
    const room = this.rooms[roomCode];
    if (room) {
      room.strokes.push(stroke);
      room.undoStack.push(stroke);
      room.redoStack = [];
    }
  }

  undo(roomCode) {
    const room = this.rooms[roomCode];
    if (room && room.undoStack.length > 0) {
      const undone = room.undoStack.pop();
      room.redoStack.push(undone);
      room.strokes = room.strokes.filter(s => s.id !== undone.id);
      return undone;
    }
    return null;
  }

  redo(roomCode) {
    const room = this.rooms[roomCode];
    if (room && room.redoStack.length > 0) {
      const redone = room.redoStack.pop();
      room.undoStack.push(redone);
      room.strokes.push(redone);
      return redone;
    }
    return null;
  }

  getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }
}

module.exports = Rooms;