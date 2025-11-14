# Scheme Finder Backend API

Backend API for the Scheme Finder application built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/scheme-finder
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ```

3. Start MongoDB (if running locally)

4. Seed the database (optional):
   ```bash
   node data/seedSchemes.js
   ```

5. Run the server:
   ```bash
   npm run dev
   ```

## API Documentation

See the main README.md for API endpoint documentation.

