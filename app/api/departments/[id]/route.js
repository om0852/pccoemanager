import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Department from '@/models/Department';
import Subject from '@/models/Subject';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private (Authenticated users)
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }
    
    const departmentId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID format' },
        { status: 400 }
      );
    }
    
    // Find department
    const department = await Department.findById(departmentId);
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // If not master admin and not the creator (for admins), deny access
    if (session.user.role === 'admin' && 
        department.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view this department' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin/Master Admin only)
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'master-admin')) {
      return NextResponse.json(
        { error: 'Not authorized to update departments' },
        { status: 403 }
      );
    }
    
    const departmentId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID format' },
        { status: 400 }
      );
    }
    
    // Get department data
    const data = await request.json();
    
    // Find department
    const department = await Department.findById(departmentId);
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Check if admin can update this department
    if (session.user.role === 'admin' && 
        department.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this department' },
        { status: 403 }
      );
    }
    
    // Check for duplicate name or code
    if (data.name || data.code) {
      const existingDepartment = await Department.findOne({
        _id: { $ne: departmentId },
        $or: [
          { name: data.name || department.name },
          { code: data.code || department.code }
        ]
      });
      
      if (existingDepartment) {
        return NextResponse.json(
          { error: 'Department with this name or code already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update department
    const updatedDepartment = await Department.findByIdAndUpdate(
      departmentId,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin/Master Admin only)
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'master-admin')) {
      return NextResponse.json(
        { error: 'Not authorized to delete departments' },
        { status: 403 }
      );
    }
    
    const departmentId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID format' },
        { status: 400 }
      );
    }
    
    // Find department
    const department = await Department.findById(departmentId);
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Check if admin can delete this department
    if (session.user.role === 'admin' && 
        department.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this department' },
        { status: 403 }
      );
    }
    
    // Check if department has subjects
    const subjectCount = await Subject.countDocuments({ department: departmentId });
    
    if (subjectCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with associated subjects. Remove all subjects first.' },
        { status: 400 }
      );
    }
    
    // Delete department
    await Department.findByIdAndDelete(departmentId);
    
    return NextResponse.json(
      { message: 'Department deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department', details: error.message },
      { status: 500 }
    );
  }
} 