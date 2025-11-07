# Architecture

## Data Flow Diagram
User Action -> Canvas.js (captures mouse events) -> WebSocket.js (sends to server) -> Server.js (broadcasts) -> Other Clients (apply to canvas).

## WebSocket Protocol
- 'stroke': {id, path, color, width, tool} - Add new stroke.
- 'undo': No data - Remove last stroke.
- 'redo': No data - Re-add last undone stroke.
- 'cursor': {x, y} - Update cursor position.
- 'user-joined/left': {users} - Update user list.

## Undo/Redo Strategy
Global stack per room. Strokes added to undoStack on draw. Undo pops and removes from strokes, pushes to redoStack. Redo reverses. Broadcasts changes to all clients.

## Performance Decisions
- Send full strokes on mouse up (batching) to reduce messages.
- Throttle cursors to 10fps.
- Use requestAnimationFrame for redraws.
- Full canvas redraw on changes (simple; could optimize with dirty rectangles for large canvases).

## Conflict Resolution
Append-only for drawing; overlaps handled visually. Undo/redo global, so no per-user conflicts—just shared history.