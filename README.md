#Simple Messenger
This is a simple real-time messenger web app for local network communication. It allows users connected to the same local network to chat with each other in real-time.

Features
Real-time messaging using Socket.IO
Display of online users
Persistent message history
Unique usernames
Usage
To use the app:

Clone the repository
Run npm install to install dependencies
Run node messenger.js to start the server
Navigate to http://localhost:3000 in multiple browser windows/tabs to chat
The app will automatically prompt for a unique username on first load.

Implementation
The backend is implemented with:

Express - web framework
Socket.IO - real-time communication
Node.js fs module - read/write message history to file
The frontend uses:

jQuery - DOM manipulation and Ajax
Plain JavaScript for real-time messaging, username prompt etc.
Limitations
This app is intended for local network usage only. Usernames and messages are not encrypted or secured.

Contributing
Contributions are welcome! Feel free to open issues or PRs for bug fixes and improvements.

