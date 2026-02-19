import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = (cmd) => {
    try {
        return execSync(cmd, { stdio: 'pipe' }).toString().trim();
    } catch (e) {
        throw new Error(e.stderr.toString());
    }
};

console.log('🚀 Starting project setup...');

// 1. Create D1 Database
console.log('\nCreating D1 database...');
let dbId;
try {
    const dbOutput = run('npx wrangler d1 create bug-tracker-db');
    const match = dbOutput.match(/database_id = "([a-f0-9-]+)"/);
    if (match) {
        dbId = match[1];
        console.log(`✅ Database created with ID: ${dbId}`);
    }
} catch (e) {
    console.log('⚠️  Database might already exist, checking list...');
    const list = JSON.parse(run('npx wrangler d1 list --json'));
    const db = list.find(d => d.name === 'bug-tracker-db');
    if (db) {
        dbId = db.uuid;
        console.log(`✅ Found existing database ID: ${dbId}`);
    }
}

// 2. Create R2 Bucket
console.log('\nCreating R2 bucket...');
try {
    run('npx wrangler r2 bucket create bug-tracker-files');
    console.log('✅ R2 bucket created');
} catch (e) {
    console.log('✅ R2 bucket likely already exists');
}

// 3. Update wrangler.toml
console.log('\nUpdating wrangler.toml...');
const wranglerPath = path.join(__dirname, '../wrangler.toml');
let content = fs.readFileSync(wranglerPath, 'utf8');

if (dbId) {
    content = content.replace(
        /database_id = "to-be-replaced-by-setup-script"/,
        `database_id = "${dbId}"`
    );
    fs.writeFileSync(wranglerPath, content);
    console.log('✅ Updated wrangler.toml with Database ID');
}

// 4. Run Migrations
console.log('\nRunning database migrations...');
run('npx wrangler d1 execute bug-tracker-db --local --file=./schema.sql');
console.log('✅ Migrations applied locally');

console.log('\n🎉 Setup complete! Run "npx wrangler dev" to start the backend.');
