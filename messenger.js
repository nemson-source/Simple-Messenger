const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
let messages = [];
const onlineClients = new Map();
const usernames = new Set();
try {
  const data = fs.readFileSync('chat_history.json', 'utf8');
  messages = JSON.parse(data);
} catch (err) {
  console.error('Error reading chat history file:', err.message);
}
io.on('connection', (socket) => {
  console.log('A user connected');
  const clientIP = socket.handshake.address;
  socket.emit('request username');
  socket.on('send username', (username) => {
    if (usernames.has(username)) {
      socket.emit('username taken');
      socket.disconnect(true);
    } else {
      onlineClients.set(socket.id, { username, ip: clientIP });
      usernames.add(username);
      io.emit('online clients', Array.from(onlineClients.values()));
    }
  });
 socket.emit('chat history', messages);
  io.emit('online clients', Array.from(onlineClients.values()));
  socket.on('disconnect', () => {
    console.log('User disconnected');
    const disconnectedClient = onlineClients.get(socket.id);
    if (disconnectedClient) {
      usernames.delete(disconnectedClient.username);
      onlineClients.delete(socket.id);
      io.emit('online clients', Array.from(onlineClients.values()));
    }
  });

  socket.on('chat message', (msg) => {
    const username = onlineClients.get(socket.id)?.username || 'Unknown';
    const message = { text: msg, timestamp: new Date(), senderUsername: username };
    messages.push(message);
    io.emit('chat message', message);
    if (messages.length > 50) {
      messages.shift();
    }
    saveChatHistory();
  });
});
function saveChatHistory() {
  fs.writeFile('chat_history.json', JSON.stringify(messages), (err) => {
    if (err) {
      console.error('Error saving chat history file:', err.message);
    } else {
      console.log('Chat history saved to file.');
    }
  });
}

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
