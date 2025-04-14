import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Department from '@/models/Department';

// @desc    Get all departments
// @route   GET /api/departments/public
// @access  Public
export async function GET() {
  try {
    await connectToDatabase();
    
    // Find all departments
    const departments = await Department.find()
      .sort({ name: 1 });
    
    // Process data to ensure stable format
    const processedDepartments = departments.map(department => {
      const plainDepartment = department.toObject();
      return {
        _id: plainDepartment._id.toString(),
        name: plainDepartment.name,
        code: plainDepartment.code
      };
    });
    
    return NextResponse.json(processedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
} 