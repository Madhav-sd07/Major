# Data Import Guide

## Importing West Bengal Schemes Dataset

### Step 1: Place the file
Place your `state_west-bengal_doc_2.txt` file in the `backend/data/` directory.

### Step 2: Run the import script
```bash
cd backend
node data/importWestBengalSchemes.js
```

### What the script does:
1. ✅ Reads the text file
2. ✅ Parses scheme information (name, description, benefits, etc.)
3. ✅ Validates and cleans the data
4. ✅ Checks for duplicates
5. ✅ Imports schemes into MongoDB
6. ✅ Shows summary statistics

### File Format Expected:
The script expects a text file with scheme information. It will try to parse:
- Scheme names (usually in uppercase or followed by colon)
- Descriptions
- Eligibility criteria
- Benefits
- Documents required
- Application process
- Contact information
- Website URLs

### Notes:
- The script automatically categorizes schemes based on keywords
- Default category is "Other" if no category is detected
- All schemes are set to "Active" status
- State is automatically set to "West Bengal"
- Duplicate schemes (by name) are skipped

### Troubleshooting:
If the import fails:
1. Check that MongoDB is running
2. Verify the file is in `backend/data/` directory
3. Check the file format matches expected structure
4. Review error messages for specific issues


