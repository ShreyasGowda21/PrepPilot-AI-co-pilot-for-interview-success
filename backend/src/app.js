// // Express app composition. No listen() here – that's in index.js.
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const cookieParser = require('cookie-parser');
// const config = require('./config/env');
// const routes = require('./routes');
// const notFound = require('./middlewares/notFound.middleware');
// const errorHandler = require('./middlewares/error.middleware');

// const app = express();

// // --- Core middlewares ---------------------------------------------------
// app.use(helmet({ crossOriginResourcePolicy: false }));
// app.use(
//   cors({
//     origin: config.clientOrigin.split(',').map((s) => s.trim()),
//     credentials: true,
//   })
// );
// // Reads `mockmate_token` from the Cookie header onto `req.cookies`.
// app.use(cookieParser());
// app.use(express.json({ limit: '1mb' }));
// app.use(express.urlencoded({ extended: true }));
// if (config.env !== 'test') {
//   app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
// }

// // --- Health + API routes ------------------------------------------------
// app.get('/', (_req, res) =>
//   res.json({ success: true, message: 'MockMate AI API', env: config.env })
// );
// app.use('/api', routes);

// // --- Error handling (always last) ---------------------------------------
// app.use(notFound);
// app.use(errorHandler);

// module.exports = app;





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

// Define your allowed origins explicitly
const allowedOrigins = [
  'https://prep-pilot-ai-co-pilot-for-intervie.vercel.app', // Your exact production Vercel frontend URL
  'http://localhost:5173',                                  // Standard local Vite development port
  'http://localhost:3000'                                   // Standard local React development port
];

// If config.clientOrigin exists from your .env, split and merge it into our allowed list
if (config.clientOrigin) {
  const envOrigins = config.clientOrigin.split(',').map((s) => s.trim());
  allowedOrigins.push(...envOrigins);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, postman, curl, or server-to-server)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
      }
    },
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