/* eslint-disable no-console */
// Imports
const Socket = require('./api/models/socketUsers');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const {
    server: config
} = require('./api/config');
const {
    host,
    port,
    db
} = config;
const {
    errorHandler
} = require('./api/middleware');
const helmet = require('helmet');
require('dotenv').config();

var whitelist = ['https://www.codeattila.ch', 'https://www.v1.codeattila.ch', 'https://www.v2.codeattila.ch', 'http://localhost:4200', 'http://192.168.1.117:4200'];
// Instantiate server
const app = express();
const http = require('http');
const server = http.createServer(app);

const socketIO = require('socket.io');
const io = socketIO(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST']
    },
});

// Init Mongoose
const connection = mongoose.connection;

// Body Parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// helmet
app.use(helmet());
// Cors
app.use(cors({
    credentials: true,
}));

// Mongoose Configuration
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(db, {
    useNewUrlParser: true
});

// Socket.io configuration
io.of('/notification').on('connection', (socket) => {
    console.log(`[Notification] - New client connected : SocketID ${socket.id}, userId : ${socket.handshake.query.userId}`);
    Socket.findOneAndDelete({
        user: socket.handshake.query.userId,
        namespace: socket.nsp.name
    }).exec().then(
        () => {
            const newSocketUser = new Socket({
                _id: socket.id,
                user: socket.handshake.query.userId,
                namespace: socket.nsp.name,
                createdOn: socket.time
            });
            newSocketUser.save();
            socket.on('disconnect', () => {
                console.log(`[Notification] - New client disconnected : SocketID ${socket.id}, userId : ${socket.handshake.query.userId}`);
                Socket.findByIdAndDelete(socket.id).exec();
            });
        }
    );
});
io.of('/user').on('connection', (socket) => {
    console.log(`[User] - New client connected : SocketID ${socket.id}, userId : ${socket.handshake.query.userId}`);
    Socket.findOneAndDelete({
        user: socket.handshake.query.userId,
        namespace: socket.nsp.name
    }).exec().then(
        () => {
            const newSocketUser = new Socket({
                _id: socket.id,
                user: socket.handshake.query.userId,
                namespace: socket.nsp.name,
                createdOn: socket.time
            });
            newSocketUser.save();
            socket.on('disconnect', () => {
                console.log(`[User] - New client disconnected : SocketID ${socket.id}, userId : ${socket.handshake.query.userId}`);
                Socket.findByIdAndDelete(socket.id).exec();
            });
        }
    );
});
io.of('/event').on('connection', (socket) => {
    console.log(`[Event] - New client connected : SocketID ${socket.id}, userId : ${socket.handshake.query.userId}`);
    Socket.findOneAndDelete({
        user: socket.handshake.query.userId,
        namespace: socket.nsp.name
    }).exec().then(
        () => {
            const newSocketUser = new Socket({
                _id: socket.id,
                user: socket.handshake.query.userId,
                namespace: socket.nsp.name,
                createdOn: socket.time
            });
            newSocketUser.save();
            socket.on('disconnect', () => {
                console.log(`[Event] - New client disconnected : SocketID ${socket.id}, userId : ${socket.handshake.query.userId}`);
                Socket.findByIdAndDelete(socket.id).exec();
            });
        }
    );
});
io.of('/checklist').on('connection', (socket) => {
    console.log(`[Checklist] - New client connected : SocketID ${socket.id}, userId : ${socket.handshake.query.userId}`);
    Socket.findOneAndDelete({
        user: socket.handshake.query.userId,
        namespace: socket.nsp.name
    }).exec().then(
        () => {
            const newSocketUser = new Socket({
                _id: socket.id,
                user: socket.handshake.query.userId,
                namespace: socket.nsp.name,
                createdOn: socket.time
            });
            newSocketUser.save();
            socket.on('disconnect', () => {
                console.log(`[Checklist] - New client disconnected : SocketID ${socket.id}, userId : ${socket.handshake.query.userId}`);
                Socket.findByIdAndDelete(socket.id).exec();
            });
        }
    );
});

// API Configuration
const userRouter = require('./api/routes/user.routes')(io);
app.use('/api', userRouter);

const notificationRouter = require('./api/routes/notification.routes')(io);
app.use('/api', notificationRouter);

const eventsRouter = require('./api/routes/events.routes')(io);
app.use('/api', eventsRouter);

const checklistsRouter = require('./api/routes/checklists.routes')(io);
app.use('/api', checklistsRouter);

const api = require('./api/routes');
app.use('/api', api);
app.use(errorHandler);
app.use((req, res) => {
    const err = new Error('404 - Not Found !!!!!');
    err.status = 404;
    res.json({
        msg: '404 - Not Found !!!!!',
        err: err
    });
});

connection.on('error', (err) => {
    console.error(`Connection to MongoDB error: ${err.message}`);
});

const serverPort = process.env.PORT || port;

// Launch server
connection.once('open', () => {
    console.log('Connected to MongoDB');

    server.listen(serverPort, () => {
        console.log(`App is running ! Go to http://${host}:${port}`);
    });

});
