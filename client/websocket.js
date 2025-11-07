class WebSocketManager {
  constructor(roomCode, userName) {
    // this.socket = io("https://collaborative-canvas-0aui.onrender.com");
    this.socket = io("https://collaborative-canvas-0aui.onrender.com", {
      transports: ["websocket"],
    });
    this.roomCode = roomCode;
    this.userName = userName;
    this.userId = null;
    this.canvasManager = null;

    this.socket.on('connect', () => {
      this.socket.emit('join-room', { roomCode: this.roomCode, userName: this.userName });
    });

    this.socket.on('joined-room', (data) => {
      this.userId = data.userId;
      this.updateUserList(data.users);
      // Load existing strokes and start redraw loop
      if (this.canvasManager) {
        data.strokes.forEach(stroke => this.canvasManager.addStroke(stroke));
        this.canvasManager.startRedraw(); // Start the redraw loop now that strokes are loaded
        document.getElementById('loading').style.display = 'none'; // Hide loading
        console.log('Loaded existing strokes and started redraw');
      } else {
        console.error('CanvasManager not set yet');
      }
    });

    this.socket.on('user-joined', (data) => {
      this.updateUserList(data.users);
    });

    this.socket.on('user-left', (data) => {
      this.updateUserList(data.users);
      if (this.canvasManager) this.canvasManager.removeCursor(data.userId);
    });

    this.socket.on('name-updated', (data) => {
      this.updateUserList(data.users);
    });

    this.socket.on('stroke', (stroke) => {
      if (this.canvasManager) this.canvasManager.addStroke(stroke);
    });

    this.socket.on('undo', (strokeId) => {
      if (this.canvasManager) this.canvasManager.removeStroke(strokeId);
    });

    this.socket.on('redo', (stroke) => {
      if (this.canvasManager) this.canvasManager.addStroke(stroke);
    });

    this.socket.on('cursor', (data) => {
      if (data.userId !== this.userId && this.canvasManager) {
        this.canvasManager.addCursor(data.userId, data.x, data.y);
      }
    });

    this.socket.on('error', (msg) => {
      alert(`Error: ${msg}`);
      console.error(`WebSocket error: ${msg}`);
    });
  }

  setCanvasManager(cm) {
    this.canvasManager = cm;
  }

  sendStroke(stroke) {
    this.socket.emit('stroke', stroke);
  }

  sendUndo() {
    this.socket.emit('undo');
  }

  sendRedo() {
    this.socket.emit('redo');
  }

  sendCursor(x, y) {
    if (!this.lastCursor || Date.now() - this.lastCursor > 100) {
      this.socket.emit('cursor', {x, y});
      this.lastCursor = Date.now();
    }
  }

  sendUpdateName(newName) {
    this.socket.emit('update-name', newName);
  }

  sendLeaveRoom() {
    this.socket.emit('leave-room');
  }

  updateUserList(users) {
    const list = document.getElementById('user-list');
    list.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.name;
      li.style.color = user.color;
      list.appendChild(li);
    });
  }
}

window.WebSocketManager = WebSocketManager;