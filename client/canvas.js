class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.strokes = {}; // {strokeId: {userId, color, width, path: [points]}}
    this.currentStroke = null;
    this.isDrawing = false;
    this.tool = 'brush';
    this.color = '#000000';
    this.width = 5;
    this.cursors = {}; // {userId: {x, y}}
    this.isRedrawing = false; // Flag to control redraw loop

    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

    this.redraw = this.redraw.bind(this);
    // Do NOT start the redraw loop here—wait for startRedraw() call
  }

  startRedraw() {
    if (!this.isRedrawing) {
      this.isRedrawing = true;
      requestAnimationFrame(this.redraw);
    }
  }

  setTool(tool) { this.tool = tool; }
  setColor(color) { this.color = color; }
  setWidth(width) { this.width = width; }

  startDrawing(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.currentStroke = { id: Date.now() + Math.random(), path: [{x, y}], color: this.color, width: this.width, tool: this.tool };
  }

  draw(e) {
    if (!this.isDrawing) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.currentStroke.path.push({x, y});
    // Send cursor update (throttled)
    if (window.ws) window.ws.sendCursor(x, y);
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.strokes[this.currentStroke.id] = this.currentStroke;
    if (window.ws) window.ws.sendStroke(this.currentStroke);
    this.currentStroke = null;
  }

  addStroke(stroke) {
    this.strokes[stroke.id] = stroke;
  }

  removeStroke(strokeId) {
    delete this.strokes[strokeId];
  }

  addCursor(userId, x, y) {
    this.cursors[userId] = {x, y};
  }

  removeCursor(userId) {
    delete this.cursors[userId];
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw all strokes
    Object.values(this.strokes).forEach(stroke => this.drawPath(stroke));
    // Draw current stroke
    if (this.currentStroke) this.drawPath(this.currentStroke);
    // Draw cursors
    Object.values(this.cursors).forEach(cursor => {
      this.ctx.beginPath();
      this.ctx.arc(cursor.x, cursor.y, 5, 0, 2 * Math.PI);
      this.ctx.fillStyle = 'red';
      this.ctx.fill();
    });
    if (this.isRedrawing) requestAnimationFrame(this.redraw);
  }

  drawPath(stroke) {
    if (stroke.path.length < 2) return;
    this.ctx.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
    this.ctx.lineWidth = stroke.width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(stroke.path[0].x, stroke.path[0].y);
    stroke.path.forEach(point => this.ctx.lineTo(point.x, point.y));
    this.ctx.stroke();
  }
}

window.CanvasManager = CanvasManager;