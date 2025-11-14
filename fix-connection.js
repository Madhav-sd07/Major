import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// The password from your original connection string: <db_Mongo@07>
// Special characters need URL encoding:
// < = %3C
// > = %3E
// @ = %40

const password = '<db_Mongo@07>';
const encodedPassword = encodeURIComponent(password);

console.log('Original password:', password);
console.log('URL Encoded password:', encodedPassword);

// Create the correct connection string
const username = 'madhavofficial0608';
const cluster = 'cluster0.d4jaiwo.mongodb.net';
const database = 'scheme-finder';

const connectionString = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${database}?retryWrites=true&w=majority`;

console.log('\n✅ Correct Connection String:');
console.log(`MONGODB_URI=${connectionString}`);

// Update .env file
const envContent = `MONGODB_URI=${connectionString}
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
NODE_ENV=development
`;

fs.writeFileSync('.env', envContent);
console.log('\n✅ .env file updated!');
console.log('\nNow test the connection with: node test-connection.js');


