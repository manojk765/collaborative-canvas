document.addEventListener('DOMContentLoaded', () => {
  const loginDiv = document.getElementById('login');
  const appDiv = document.getElementById('app');
  const roomCodeInput = document.getElementById('room-code');
  const userNameInput = document.getElementById('user-name');
  const joinBtn = document.getElementById('join-room');
  const createBtn = document.getElementById('create-room');
  const errorMsg = document.getElementById('error-msg');
  const editNameInput = document.getElementById('edit-name');
  const updateNameBtn = document.getElementById('update-name');
  const roomCodeDisplay = document.getElementById('room-code-display');
  const copyCodeBtn = document.getElementById('copy-code');
  const leaveRoomBtn = document.getElementById('leave-room');
  const loadingDiv = document.getElementById('loading');

  let wsManager = null;
  let canvasManager = null;
  let currentRoomCode = null;

  // Generate random room code
  function generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // Join room
  function joinRoom(code, name) {
    if (!code || !name) {
      errorMsg.textContent = 'Please enter room code and name.';
      return;
    }
    errorMsg.textContent = '';
    currentRoomCode = code;
    roomCodeDisplay.textContent = code;
    wsManager = new WebSocketManager(code, name);
    canvasManager = new CanvasManager(document.getElementById('canvas'));
    wsManager.setCanvasManager(canvasManager);
    window.ws = wsManager;
    loginDiv.style.display = 'none';
    appDiv.style.display = 'block';
    loadingDiv.style.display = 'block'; // Show loading
    // Save to localStorage for persistence
    localStorage.setItem('roomCode', code);
    localStorage.setItem('userName', name);
    setupToolbar();
    console.log(`Joined room: ${code} as ${name}`);
  }

  // Leave room
  function leaveRoom() {
    if (wsManager) {
      wsManager.sendLeaveRoom();
      wsManager = null;
      canvasManager = null;
      currentRoomCode = null;
      localStorage.removeItem('roomCode');
      localStorage.removeItem('userName');
      appDiv.style.display = 'none';
      loginDiv.style.display = 'block';
      console.log('Left room');
    }
  }

  // Create room
  createBtn.addEventListener('click', () => {
    const code = generateRoomCode();
    roomCodeInput.value = code;
    alert(`Room created! Code: ${code}`);
    setTimeout(() => joinRoom(code, userNameInput.value), 100);
  });

  // Join existing room
  joinBtn.addEventListener('click', () => {
    joinRoom(roomCodeInput.value.toUpperCase(), userNameInput.value);
  });

  // Copy room code
  copyCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentRoomCode).then(() => alert('Room code copied!'));
  });

  // Update name
  updateNameBtn.addEventListener('click', () => {
    const newName = editNameInput.value.trim();
    if (newName && wsManager) {
      wsManager.sendUpdateName(newName);
      localStorage.setItem('userName', newName);
    }
  });

  // Leave room
  leaveRoomBtn.addEventListener('click', () => {
    leaveRoom();
  });

  // Auto-join on load if saved
  const savedCode = localStorage.getItem('roomCode');
  const savedName = localStorage.getItem('userName');
  if (savedCode && savedName) {
    roomCodeInput.value = savedCode;
    userNameInput.value = savedName;
    joinRoom(savedCode, savedName);
  }

  // Setup toolbar (only after joining)
  function setupToolbar() {
    document.getElementById('brush').addEventListener('click', () => canvasManager.setTool('brush'));
    document.getElementById('eraser').addEventListener('click', () => canvasManager.setTool('eraser'));
    document.getElementById('color').addEventListener('change', (e) => canvasManager.setColor(e.target.value));
    document.getElementById('width').addEventListener('change', (e) => canvasManager.setWidth(e.target.value));
    document.getElementById('undo').addEventListener('click', () => wsManager.sendUndo());
    document.getElementById('redo').addEventListener('click', () => wsManager.sendRedo());
  }
});