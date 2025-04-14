import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Subject from '@/models/Subject';

// @desc    Get all subjects or subjects by department
// @route   GET /api/subjects/public
// @access  Public
export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department');
    
    // Build query
    const query = departmentId ? { department: departmentId } : {};
    
    // Find subjects
    const subjects = await Subject.find(query)
      .sort({ name: 1 });
    
    // Process data to ensure stable format
    const processedSubjects = subjects.map(subject => {
      const plainSubject = subject.toObject();
      return {
        _id: plainSubject._id.toString(),
        name: plainSubject.name,
        code: plainSubject.code,
        department: plainSubject.department.toString()
      };
    });
    
    return NextResponse.json(processedSubjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
} 