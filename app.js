/* eslint-disable no-console */
// Imports
const express = require('express');
const bodyParser = require('body-parser');
const api = require('./api/routes');
const cors = require('cors');
const mongoose = require('mongoose');
const { server: config } = require('./api/config');
const { host, port, db } = config;
const { errorHandler } = require('./api/middleware');
const helmet = require('helmet');
require('dotenv').config();

// Instantiate server
const app = express();

// Init Mongoose
const connection = mongoose.connection;

// Body Parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// helmet
app.use(helmet());
// Cors
app.use(cors({credentials: true, origin: '*'})); 

// API Configuration
app.use('/api', api);
app.use(errorHandler);
app.use((req, res) => {
    const err = new Error('404 - Not Found !!!!!');
    err.status = 404;
    res.json({ msg : '404 - Not Found !!!!!', err: err});
});

// Mongoose Configuration
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(db, { useNewUrlParser: true });
connection.on('error', (err) => {
    console.error(`Connection to MongoDB error: ${err.message}`);
});

const serverPort = process.env.PORT || port;

// Launch server
connection.once('open', () => {
    console.log('Connected to MongoDB');
    console.log('host', host);
    
    app.listen(serverPort, () => {
        console.log(`App is running ! Go to http://${host}:${port}`);
    });

});



