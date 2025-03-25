import mongoose from 'mongoose';
import { MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASSWORD } from './db';

/**
 * Utility function for creating a master admin user
 * This is now handled automatically in lib/db.js during database connection
 * but kept here for reference or manual execution if needed
 */
export async function createMasterAdmin() {
  try {
    // Get the User model with its schema and hooks
    const User = mongoose.models.User;
    
    if (!User) {
      console.error('User model not available. Make sure models are registered first.');
      return;
    }
    
    // Check if a master admin already exists
    const adminExists = await User.findOne({ role: 'master-admin' });
    
    if (adminExists) {
      console.log('Master admin already exists.');
      return;
    }
    
    // Create master admin - let the pre-save hook handle password hashing
    const masterAdmin = new User({
      name: 'Master Admin',
      email: MASTER_ADMIN_EMAIL,
      password: MASTER_ADMIN_PASSWORD,
      role: 'master-admin',
      createdAt: new Date()
    });
    
    await masterAdmin.save();
    console.log('Master admin created successfully:');
    console.log(`Email: ${MASTER_ADMIN_EMAIL}`);
    console.log(`Password: ${MASTER_ADMIN_PASSWORD}`);
    console.log('\nMake sure to change this password after first login!');
  } catch (error) {
    console.error('Error creating master admin:', error);
  }
}

/**
 * Add future database migrations here
 * This function can be called manually or integrated with deployment processes
 */
export async function runMigrations() {
  try {
    console.log('Running database migrations...');
    // Add future migrations here
    
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
} 