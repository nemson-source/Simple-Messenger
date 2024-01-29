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

// Store messages, online clients, and usernames in memory
let messages = [];
const onlineClients = new Map(); // Using a Map to store clients with socket.id as key and username as value
const usernames = new Set();

// Load chat history from a file
try {
  const data = fs.readFileSync('chat_history.json', 'utf8');
  messages = JSON.parse(data);
} catch (err) {
  console.error('Error reading chat history file:', err.message);
}

io.on('connection', (socket) => {
  console.log('A user connected');

  // Get the client's IP address
  const clientIP = socket.handshake.address;

  // Send a request for the username
  socket.emit('request username');

  // When the client sends their username, check for uniqueness
  socket.on('send username', (username) => {
    if (usernames.has(username)) {
      // Username is already taken, send a message to the client and disconnect
      socket.emit('username taken');
      socket.disconnect(true);
    } else {
      // Username is unique, store it in the onlineClients Map and usernames Set
      onlineClients.set(socket.id, { username, ip: clientIP });
      usernames.add(username);
      io.emit('online clients', Array.from(onlineClients.values()));
    }
  });

  // Send existing messages and online clients to the user
  socket.emit('chat history', messages);
  io.emit('online clients', Array.from(onlineClients.values()));

  socket.on('disconnect', () => {
    console.log('User disconnected');

    // Remove the disconnected client from the set of online clients and usernames
    const disconnectedClient = onlineClients.get(socket.id);
    if (disconnectedClient) {
      usernames.delete(disconnectedClient.username);
      onlineClients.delete(socket.id);

      // Update the online clients list for all connected clients
      io.emit('online clients', Array.from(onlineClients.values()));
    }
  });

  socket.on('chat message', (msg) => {
    const username = onlineClients.get(socket.id)?.username || 'Unknown';
    const message = { text: msg, timestamp: new Date(), senderUsername: username };
    messages.push(message);

    // Broadcast the new message to all connected clients
    io.emit('chat message', message);

    // Optionally, you can limit the number of stored messages
    // For example, keep only the last 50 messages
    if (messages.length > 50) {
      messages.shift(); // Remove the oldest message
    }

    // Save chat history to a file
    saveChatHistory();
  });
});

// Save chat history to a file
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
