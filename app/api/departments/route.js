import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin/Master Admin only)
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'master-admin')) {
      return NextResponse.json(
        { error: 'Not authorized to create departments' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // Add the user who created this department
    data.createdBy = session.user.id;
    
    // Check if department with same name or code exists
    const existingDepartment = await Department.findOne({ 
      $or: [
        { name: data.name },
        { code: data.code }
      ]
    });
    
    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Department with this name or code already exists' },
        { status: 400 }
      );
    }
    
    const department = await Department.create(data);
    
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (Admin/Master Admin/Teacher)
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Not authorized to view departments' },
        { status: 403 }
      );
    }
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const query = {};
    
    // If admin (not master admin), only show departments they created
    if (session.user.role === 'admin') {
      query.createdBy = session.user.id;
    }
    
    // Find departments
    const departments = await Department.find(query)
      .sort({ createdAt: -1 });
    
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments', details: error.message },
      { status: 500 }
    );
  }
} 