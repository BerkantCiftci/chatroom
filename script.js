function enterChatRoom() {
  const username = document.getElementById("username").value;
  if (username) {
    // Navigate to the chat room page with the username as a parameter
    window.location.href = `chatroom.html?username=${username}`;
  }
}

// Set up MQTT client
const client = new Paho.MQTT.Client('192.168.1.111', 1883, 'username');

// Set up options for secure connection
const options = {
  useSSL: true,
  userName: 'berkant',
  password: '2e6de511',
  onSuccess: () => {
    console.log('Connected to MQTT broker');
  },
  onFailure: error => {
    console.error('Failed to connect to MQTT broker:', error);
  }
};

// Connect to MQTT broker
client.connect(options);



// Get references to DOM elements
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message');

// Send message to server
function sendMessage(message) {
  const data = {
    type: 'message',
    text: message,
    username: localStorage.getItem('username'),
    timestamp: new Date().toISOString()
  };
  const messagePayload = new Paho.MQTT.Message(JSON.stringify(data));
  messagePayload.destinationName = 'chatroom/messages';
  client.send(messagePayload);
}

// Receive message from server
function receiveMessage(messagePayload) {
  const message = JSON.parse(messagePayload.payloadString);

  // Create DOM elements for message
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');

  const usernameSpan = document.createElement('span');
  usernameSpan.classList.add('username');
  usernameSpan.textContent = message.username;

  const timeSpan = document.createElement('span');
  timeSpan.classList.add('time');
  timeSpan.textContent = new Date(message.timestamp).toLocaleString();

  const textSpan = document.createElement('span');
  textSpan.classList.add('text');
  textSpan.textContent = message.text;

  messageDiv.appendChild(usernameSpan);
  messageDiv.appendChild(timeSpan);
  messageDiv.appendChild(textSpan);

  // Add message to messages container
  messagesContainer.appendChild(messageDiv);

  // Scroll to bottom of messages container
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Subscribe to MQTT topic for receiving messages
client.subscribe('chatroom/messages');

// Add event listener to message form
messageForm.addEventListener('submit', event => {
  event.preventDefault();
  const message = messageInput.value;
  sendMessage(message);
  messageInput.value = '';
});

// Add event listener to MQTT client for receiving messages
client.onMessageArrived = receiveMessage;
