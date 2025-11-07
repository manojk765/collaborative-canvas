# Canvas

A real-time multi-user drawing application where users can collaborate on a shared canvas in isolated rooms. Built with Vanilla JavaScript, HTML5 Canvas, Node.js, and Socket.io.



## Features

- **Drawing Tools**: Brush and eraser with adjustable colors and stroke widths
- **Real-Time Collaboration**: See other users' drawings update live as they draw
- **User Indicators**: View live cursor positions of other users in the room
- **Global Undo/Redo**: Undo/redo actions are synchronized across all users in the room
- **Room System**: Create or join rooms using unique codes. Each room has its own isolated canvas
- **User Management**: Display online users with assigned colors. Edit your name at any time
- **Persistence**: Canvas state persists during user sessions (e.g., on refresh or reconnect). Rooms are deleted 10 seconds after the last user leaves
- **Manual Leave**: Users can manually leave a room and return to the main page
- **Same-System Enforcement**: Only one user per IP address per room to prevent duplicates

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5 Canvas
- **Backend**: Node.js, Express, Socket.io
- **Real-Time Communication**: WebSockets via Socket.io

## Prerequisites

- Node.js (version 14 or higher) - [Download from nodejs.org](https://nodejs.org)
- A modern web browser (Chrome, Firefox, or Safari)

## Setup Instructions

### 1. Clone or Download the Project

Ensure the project files are in a folder named `collaborative-canvas` with the proper structure.

### 2. Install Dependencies
```bash
npm install
```

This installs `express`, `socket.io`, and `nodemon`.

### 3. Start the Server
```bash
npm start
```

The server runs on `http://localhost:3000`.

For development (auto-restart on changes):
```bash
npm run dev
```

### 4. Access the Application

Open `http://localhost:3000` in your browser. You'll see the login page to create or join a room.

## How to Test with Multiple Users

### Open Multiple Browser Tabs/Windows

1. Start the server with `npm start`
2. Open `http://localhost:3000` in one tab and create a new room (note the generated code, e.g., "ABC123")
3. Open additional tabs/windows and join the same room using the code

### Test Collaboration

- In one tab, draw on the canvas using the brush or eraser
- Switch to another tab—see the drawings appear in real-time
- Move the mouse while drawing to see live cursor indicators (red circles) from other users
- Test undo/redo: Click Undo in one tab—it removes the last stroke globally across all tabs
- Edit names: Update your name in the toolbar—it syncs to the user list in all tabs

### Test Room Isolation

- Create a new room in another tab—it's completely separate
- Drawings and users don't cross between rooms

### Test Persistence and Leave

- Draw in a room, then refresh a tab—the canvas reloads with all existing drawings
- Click "Leave Room" in one tab—the user is removed, and if it's the last user, the room is deleted after 10 seconds
- Rejoin a room within 10 seconds of the last user leaving—the canvas state persists

### Edge Cases

- Try joining the same room from the same IP (e.g., same laptop)—it updates the existing user instead of creating a duplicate
- Close a tab (disconnect) and reopen/rejoin quickly—the room persists

## Known Limitations

- **No Server-Side Persistence**: Canvas data is stored in memory only. If the server restarts, all rooms and drawings are lost
- **IP-Based User Enforcement**: Uses client IP to prevent multiple users from the same system. This may not work perfectly behind proxies or VPNs
- **No Mobile/Touch Support**: Designed for desktop; touch events are not handled
- **Performance**: May lag with many users (e.g., 10+) or complex drawings due to full canvas redraws. No optimizations for large canvases
- **Fixed Canvas Size**: Canvas is 800x600 pixels and not responsive
- **No Authentication**: No user login; names are editable but not secure
- **Browser Compatibility**: Tested on modern browsers; may have issues on older versions
- **Undo/Redo Scope**: Global undo affects all users; no per-user history
- **Room Code Sharing**: Codes are case-sensitive and must be copied manually

## Project Structure
```
collaborative-canvas/
├── public/
│   ├── index.html
│   ├── canvas.html
│   └── styles.css
├── server.js
├── package.json
└── README.md
```

## Development

Contributions are welcome! Feel free to submit issues or pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).

## Time Spent

Approximately 25 hours, including initial development, debugging, iterations for room system, persistence fixes, and documentation. This includes planning, coding, testing, and refinements based on feedback.

---

**Happy Drawing! 🎨**