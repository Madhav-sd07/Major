# Database Connection Check

## Current Status: ❌ Connection Failed

The database connection test shows an error with the MongoDB connection string.

## Error Details
- Error: `querySrv EBADNAME`
- This usually means the MongoDB connection string is malformed or incomplete

## How to Fix

### Option 1: Local MongoDB

If you want to use local MongoDB, update your `backend/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/scheme-finder
```

Then make sure MongoDB is running:
- **Windows**: MongoDB should start automatically as a service
- Check if it's running: Open Services (services.msc) and look for "MongoDB"

### Option 2: MongoDB Atlas (Cloud)

If using MongoDB Atlas, your connection string should look like:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/scheme-finder?retryWrites=true&w=majority
```

**Important:**
1. Replace `username` and `password` with your actual credentials
2. Replace `cluster0.xxxxx.mongodb.net` with your actual cluster address
3. Make sure your IP is whitelisted in MongoDB Atlas
4. Make sure you have the correct database name

### Option 3: Test Connection

After updating your `.env` file, run:

```bash
cd backend
node test-connection.js
```

This will test the connection and show you if it's working.

## Quick Fix Steps

1. **Check your .env file** in the `backend` folder
2. **Verify MongoDB is running** (if using local)
3. **Test the connection** using the test script
4. **Start the backend server** once connection is working


