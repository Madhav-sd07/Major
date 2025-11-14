# How to Import West Bengal Schemes Dataset

## Quick Start

### Step 1: Place the file
Copy your `state_west-bengal_doc_2.txt` file to:
```
backend/data/state_west-bengal_doc_2.txt
```

### Step 2: Run the import
```bash
cd backend
npm run import:west-bengal
```

Or directly:
```bash
cd backend
node data/importWestBengalSchemes.js
```

## What happens:
1. ✅ The script reads your text file
2. ✅ Parses scheme information automatically
3. ✅ Validates and cleans the data
4. ✅ Checks for duplicates
5. ✅ Imports schemes into MongoDB
6. ✅ Shows summary statistics

## File Format Support:
The script can handle various text formats:
- Plain text with scheme names
- Structured text with sections
- Lists with bullets or numbers
- Mixed format text files

## After Import:
Once imported, the schemes will appear in:
- **Browse Schemes** page
- **Eligibility Check** page
- **Search** functionality
- All scheme categories

## Troubleshooting:

### File not found:
```
❌ File not found: backend/data/state_west-bengal_doc_2.txt
```
**Solution:** Make sure the file is in the `backend/data/` directory

### MongoDB connection error:
```
❌ MongoDB connection error
```
**Solution:** 
1. Make sure MongoDB is running
2. Check your `.env` file has correct `MONGODB_URI`

### Parsing issues:
If schemes are not parsed correctly, the file format might need adjustment. The script will still import what it can parse.

## Need Help?
If you encounter issues, check:
1. File location: `backend/data/state_west-bengal_doc_2.txt`
2. MongoDB connection
3. File format matches expected structure


