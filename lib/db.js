import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { registerModels } from './models';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Master admin credentials
const MASTER_ADMIN_EMAIL = 'salunkeom474@gmail.com';
const MASTER_ADMIN_PASSWORD = 'Master@123';

// This function creates a master admin user if none exists
async function createMasterAdminIfNeeded() {
  try {
    // Ensure models are registered
    registerModels();
    
    // Import the User model directly to get access to the proper schema and hooks
    const User = mongoose.models.User;
    
    if (!User) {
      // If User model is not available, we need to wait for it to be registered
      console.log('User model not found. Master admin will be created by migrations if needed.');
      return;
    }
    
    // Check if a master admin already exists
    const adminExists = await User.findOne({ role: 'master-admin' });
    
    if (adminExists) {
      return; // Admin already exists, do nothing
    }
    
    // Create master admin with specified email - don't manually hash the password
    // Let the User model's pre-save hook handle the hashing
    const masterAdmin = new User({
      name: 'Master Admin',
      email: MASTER_ADMIN_EMAIL,
      password: MASTER_ADMIN_PASSWORD,  // This will be hashed by the pre-save hook
      role: 'master-admin',
      createdAt: new Date()
    });
    
    await masterAdmin.save();
    console.log('Master admin created automatically:');
    console.log(`Email: ${MASTER_ADMIN_EMAIL}`);
    console.log(`Password: ${MASTER_ADMIN_PASSWORD}`);
    console.log('\nMake sure to change this password after first login!');
  } catch (error) {
    console.error('Error creating master admin during initialization:', error);
  }
}

async function connectToDatabase() {
  if (cached.conn) {
    // Ensure models are registered even when using cached connection
    registerModels();
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(async (mongoose) => {
        console.log('Connected to MongoDB!');
        
        // Register models immediately after connection
        registerModels();
        
        // Create master admin if needed after connection is established
        // Wait a short time to ensure models are registered
        setTimeout(async () => {
          await createMasterAdminIfNeeded();
        }, 1000);
        
        return mongoose;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  // Ensure models are registered after getting connection from promise
  registerModels();
  return cached.conn;
}

export { MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASSWORD };
export default connectToDatabase; 