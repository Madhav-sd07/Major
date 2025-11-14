# How to Import Madhya Pradesh Schemes Dataset

## Quick Start

### Step 1: Copy the files
Copy all your `state_madhya-pradesh_doc_*.txt` files to:
```
backend/data/
```

The script will automatically find and process all files matching the pattern `state_madhya-pradesh_doc_*.txt`.

### Step 2: Run the import
```bash
cd backend
npm run import:mp
```

Or directly:
```bash
cd backend
node data/importMadhyaPradeshSchemes.js
```

## What happens:
1. ✅ The script finds all MP scheme files
2. ✅ Parses each file to extract scheme information
3. ✅ Detects scheme names, categories, eligibility, benefits, etc.
4. ✅ Validates and cleans the data
5. ✅ Checks for duplicates
6. ✅ Imports schemes into MongoDB
7. ✅ Shows summary statistics

## File Format Support:
The script can handle various text formats:
- Scheme names with "Yojana", "Scheme", etc.
- Descriptions and eligibility criteria
- Benefits and documents required
- Contact information and websites
- Application procedures

## Features:
- **Automatic Category Detection**: Detects Education, Healthcare, Agriculture, Employment, etc.
- **Smart Parsing**: Extracts scheme names, benefits, eligibility from unstructured text
- **Duplicate Detection**: Skips schemes that already exist
- **Error Handling**: Continues importing even if some files have errors

## After Import:
Once imported, the schemes will appear in:
- **Browse Schemes** page
- **Eligibility Check** page
- **Search** functionality
- All scheme categories

## Troubleshooting:

### No files found:
```
❌ No Madhya Pradesh scheme files found!
```
**Solution:** Make sure files are named `state_madhya-pradesh_doc_*.txt` and placed in `backend/data/` directory

### MongoDB connection error:
```
❌ MongoDB connection error
```
**Solution:** 
1. Make sure MongoDB is running
2. Check your `.env` file has correct `MONGODB_URI`

### Parsing issues:
If schemes are not parsed correctly, the file format might need adjustment. The script will still import what it can parse.

## Example Files:
The script expects files like:
- `state_madhya-pradesh_doc_1.txt`
- `state_madhya-pradesh_doc_2.txt`
- `state_madhya-pradesh_doc_43.txt`
- etc.

## Need Help?
If you encounter issues, check:
1. File location: `backend/data/state_madhya-pradesh_doc_*.txt`
2. File naming: Must match pattern `state_madhya-pradesh_doc_*.txt`
3. MongoDB connection
4. File format matches expected structure


