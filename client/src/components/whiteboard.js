import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Whiteboard.css';

const Whiteboard = ({ socketServer = process.env.REACT_APP_SOCKET_SERVER }) => {

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [username, setUsername] = useState('');
  const [lastUpdatedBy, setLastUpdatedBy] = useState('');
  const [mode, setMode] = useState('draw'); // draw | text
  const [fontSize, setFontSize] = useState(16);

  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const socket = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');

    socket.current = io(socketServer);

    socket.current.on('user-assigned', (name) => {
      setUsername(name);
    });

    socket.current.on('draw', ({ x, y, color, size, username }) => {
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      setLastUpdatedBy(username);
    });

    socket.current.on('clear', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    socket.current.on('place-text', ({ x, y, text, color, fontSize, username }) => {
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      setLastUpdatedBy(username);
    });

    return () => socket.current.disconnect();
  }, [socketServer]);

  const saveState = () => {
    const canvas = canvasRef.current;
    undoStack.current.push(canvas.toDataURL());
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
  };

  const restoreState = (dataURL) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataURL;
  };

  const handleUndo = () => {
    if (undoStack.current.length === 0) return;
    const canvas = canvasRef.current;
    redoStack.current.push(canvas.toDataURL());
    const prevState = undoStack.current.pop();
    restoreState(prevState);
  };

  const handleRedo = () => {
    if (redoStack.current.length === 0) return;
    const nextState = redoStack.current.pop();
    undoStack.current.push(canvasRef.current.toDataURL());
    restoreState(nextState);
  };

  const startDrawing = (e) => {
    if (mode !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    saveState();
  };

  const draw = (e) => {
    if (!isDrawing || mode !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    socket.current.emit('draw', { x, y, color, size: brushSize, username });
  };

  const stopDrawing = () => setIsDrawing(false);

  const handleCanvasClick = (e) => {
    if (mode !== 'text') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const input = prompt('Enter text:');
    if (!input) return;

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(input, x, y);

    saveState();

    socket.current.emit('place-text', {
      x,
      y,
      text: input,
      color,
      fontSize,
      username
    });
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.current.emit('clear');
    saveState();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type;

    if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          saveState();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = file.name;

      if (fileType === 'application/pdf') {
        window.open(fileURL, '_blank');
      } else {
        link.click();
      }

      alert(`File "${file.name}" is ready for download or preview.`);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'whiteboard_snapshot.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="whiteboard-container">
      <h2>🎨 Collaborative Whiteboard</h2>
      <p className="username-display">👤 You are <strong>{username}</strong></p>
      <p className="last-updated">🖌️ Last updated by: <strong>{lastUpdatedBy || 'Waiting...'}</strong></p>

      <div className="controls">
        <label>
          Mode:
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="draw">Draw</option>
            <option value="text">Text</option>
          </select>
        </label>

        <label>
          Color:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>

        {mode === 'draw' ? (
          <label>
            Brush Size:
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
            <span className="brush-size">{brushSize}px</span>
          </label>
        ) : (
          <label>
            Font Size:
            <input
              type="number"
              min="8"
              max="48"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </label>
        )}

        <label>
          Upload File:
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
            onChange={handleFileUpload}
          />
        </label>

        <button onClick={handleClear}>🧹 Clear</button>
        <button onClick={handleSave}>💾 Save</button>
        <button onClick={handleUndo}>↩️ Undo</button>
        <button onClick={handleRedo}>↪️ Redo</button>
      </div>

      <canvas
        ref={canvasRef}
        className="whiteboard-canvas"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onClick={handleCanvasClick}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default Whiteboard;
