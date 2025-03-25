import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin/Master Admin only)
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'master-admin')) {
      return NextResponse.json(
        { error: 'Not authorized to view user details' },
        { status: 403 }
      );
    }
    
    const userId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if admin can access this user
    if (session.user.role === 'admin' && 
        user.createdBy && 
        user.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view this user' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin/Master Admin only)
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'master-admin')) {
      return NextResponse.json(
        { error: 'Not authorized to update users' },
        { status: 403 }
      );
    }
    
    const userId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    // Get user data
    const data = await request.json();
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if admin can update this user
    if (session.user.role === 'admin' && 
        user.createdBy && 
        user.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this user' },
        { status: 403 }
      );
    }
    
    // Validate role permissions
    // Only master-admin can create/update admin users
    if (data.role === 'admin' && session.user.role !== 'master-admin') {
      return NextResponse.json(
        { error: 'Only master admin can update to admin role' },
        { status: 403 }
      );
    }
    
    // No one can create/update master-admin users through API
    if (data.role === 'master-admin') {
      return NextResponse.json(
        { error: 'Cannot update to master admin role' },
        { status: 403 }
      );
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin/Master Admin only)
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'master-admin')) {
      return NextResponse.json(
        { error: 'Not authorized to delete users' },
        { status: 403 }
      );
    }
    
    const userId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if admin can delete this user
    if (session.user.role === 'admin' && 
        user.createdBy && 
        user.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this user' },
        { status: 403 }
      );
    }
    
    // Prevent deletion of master admin
    if (user.role === 'master-admin') {
      return NextResponse.json(
        { error: 'Cannot delete master admin users' },
        { status: 403 }
      );
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
} 