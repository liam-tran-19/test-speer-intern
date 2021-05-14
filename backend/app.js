const mongoose = require('mongoose');
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan');
const config = require('./config');

const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const authRoutes = require('./routes/api/auth');
const userRoutes = require('./routes/api/users');
const statusRoutes = require('./routes/api/status');
const findChatRoutes = require('./routes/api/findChat');
const ChatService = require('./routes/api/chat');

const { MONGO_DB_NAME } = config;

const app = express(feathers());

// CORS Middleware
app.use(cors());
// Logger Middleware
app.use(morgan('dev'));
// Bodyparser Middleware
app.use(bodyParser.json());
// Config Socket.io realtime APIs
app.configure(socketio());
// Enable REST services
app.configure(express.rest());

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/status', statusRoutes)
app.use('/chats', new ChatService());
app.use('/api/chats', findChatRoutes)

// New connections connect to stream channel
app.on('connection', conn => app.channel('stream').join(conn));
// Publish events to stream
app.publish(data => app.channel('stream'));
// Connect to Mongo
mongoose
  .connect(MONGO_DB_NAME, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  }) // Adding new mongo url parser
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

  module.exports = app;