
/**
 * Generate Admin Password Hash
 * 
 * Run this script to generate a bcrypt hash for an admin password.
 * 
 * Usage:
 *   npx ts-node scripts/generate-admin-hash.ts "YourSecurePassword123!"
 * 
 * Or in Node.js directly:
 *   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword', 12));"
 */

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Usage: npx ts-node scripts/generate-admin-hash.ts "YourSecurePassword"');
  console.error('');
  console.error('Password requirements:');
  console.error('  - At least 12 characters');
  console.error('  - At least one uppercase letter');
  console.error('  - At least one lowercase letter');
  console.error('  - At least one number');
  console.error('  - At least one special character (!@#$%^&*(),.?":{}|<>)');
  process.exit(1);
}

// Validate password
const errors: string[] = [];

if (password.length < 12) {
  errors.push('Password must be at least 12 characters');
}
if (!/[A-Z]/.test(password)) {
  errors.push('Password must contain at least one uppercase letter');
}
if (!/[a-z]/.test(password)) {
  errors.push('Password must contain at least one lowercase letter');
}
if (!/[0-9]/.test(password)) {
  errors.push('Password must contain at least one number');
}
if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  errors.push('Password must contain at least one special character');
}

if (errors.length > 0) {
  console.error('Password validation failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

// Generate hash
const hash = bcrypt.hashSync(password, 12);

console.log('');
console.log('Password Hash Generated Successfully');
console.log('=====================================');
console.log('');
console.log('Hash:', hash);
console.log('');
console.log('Use this SQL to insert/update an admin user:');
console.log('');
console.log(`INSERT INTO admin_users (email, password_hash, role)`);
console.log(`VALUES ('your-email@quirkcars.com', '${hash}', 'admin');`);
console.log('');
console.log('Or to update an existing user:');
console.log('');
console.log(`UPDATE admin_users SET password_hash = '${hash}' WHERE email = 'admin@quirkcars.com';`);
console.log('');
