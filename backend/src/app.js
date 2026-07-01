// Express app composition. No listen() here – that's in index.js.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const routes = require('./routes');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// --- Core middlewares ---------------------------------------------------
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: config.clientOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
// Reads `mockmate_token` from the Cookie header onto `req.cookies`.
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

// --- Health + API routes ------------------------------------------------
app.get('/', (_req, res) =>
  res.json({ success: true, message: 'MockMate AI API', env: config.env })
);
app.use('/api', routes);

// --- Error handling (always last) ---------------------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
