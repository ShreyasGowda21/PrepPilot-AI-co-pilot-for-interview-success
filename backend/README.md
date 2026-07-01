# MockMate AI – Backend

Node.js + Express + MongoDB Atlas REST API powering the MockMate AI Interview
Preparation Platform.

## Features

- JWT-based authentication (register / login / me)
- Resume analyser – upload PDF, score out of 100, identify weak sections
- Job Description analyser – skill extraction, gap analysis, red flags
- AI mock interview – generates questions from JD, scores answers, produces final report
- Performance dashboard – interview score trends, weak / strong skills, history

## Folder layout

```
backend/
├── src/
│   ├── config/         # DB connection, multer config
│   ├── controllers/    # Route handlers (thin)
│   ├── middlewares/    # auth, error, upload
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── services/       # Business logic (AI, scoring, extraction)
│   ├── utils/          # ApiError, ApiResponse, asyncHandler, logger
│   ├── validators/     # Joi / zod request schemas
│   ├── app.js          # Express app composition
│   └── index.js        # Server entry point
├── uploads/            # Multer PDF upload destination
├── .env.example
└── package.json
```

Follows the **MVC** pattern with services extracted to keep controllers thin.

## Quick start

```bash
cd backend
npm install
cp .env.example .env       # fill in MONGODB_URI, JWT_SECRET, etc.
npm run dev
```

The API runs on `http://localhost:5000` by default.
