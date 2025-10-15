import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const IDL_DIR = path.join(__dirname, '../app/src/idl');

// Create IDL directory if it doesn't exist
if (!fs.existsSync(IDL_DIR)) {
  fs.mkdirSync(IDL_DIR, { recursive: true });
}

// Run anchor build to generate IDL
console.log('Building Anchor program...');
execSync('anchor build', { stdio: 'inherit' });

// Copy the generated IDL to the frontend
const generatedIdlPath = path.join(__dirname, '../target/idl/rafflerocket.json');
const frontendIdlPath = path.join(IDL_DIR, 'rafflerocket.json');

if (fs.existsSync(generatedIdlPath)) {
  console.log('Copying IDL to frontend...');
  fs.copyFileSync(generatedIdlPath, frontendIdlPath);
  console.log('IDL generated successfully!');
} else {
  console.error('Failed to generate IDL. Make sure you have run `anchor build` first.');
  process.exit(1);
} 