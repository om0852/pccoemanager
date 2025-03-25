import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Subject from '@/models/Subject';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private (Admin/Master Admin only)
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'master-admin')) {
      return NextResponse.json(
        { error: 'Not authorized to create subjects' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // Validate department ID
    if (!mongoose.Types.ObjectId.isValid(data.department)) {
      return NextResponse.json(
        { error: 'Invalid department ID format' },
        { status: 400 }
      );
    }
    
    // Check if department exists
    const department = await Department.findById(data.department);
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Check if admin has access to this department
    if (session.user.role === 'admin' && 
        department.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to add subjects to this department' },
        { status: 403 }
      );
    }
    
    // Check for duplicate subject code in the same department
    const existingSubject = await Subject.findOne({
      department: data.department,
      code: data.code
    });
    
    if (existingSubject) {
      return NextResponse.json(
        { error: 'Subject with this code already exists in this department' },
        { status: 400 }
      );
    }
    
    // Add the user who created this subject
    data.createdBy = session.user.id;
    
    const subject = await Subject.create(data);
    
    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Get all subjects (with filtering)
// @route   GET /api/subjects
// @access  Private (Authenticated users)
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Not authorized to view subjects' },
        { status: 403 }
      );
    }
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department');
    const semester = searchParams.get('semester');
    const year = searchParams.get('year');
    const populate = searchParams.get('populate');
    
    console.log(`API: Subjects request from ${session.user.email} (${session.user.role})`);
    if (departmentId) {
      console.log(`API: Filtering by department ID: ${departmentId}`);
    }
    if (populate) {
      console.log(`API: Populating relationships: ${populate}`);
    }
    
    const query = {};
    
    // Apply filters if provided
    if (departmentId) {
      // Validate department ID
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return NextResponse.json(
          { error: 'Invalid department ID format' },
          { status: 400 }
        );
      }
      query.department = departmentId;
    }
    
    if (semester) {
      query.semester = parseInt(semester);
    }
    
    if (year) {
      query.year = parseInt(year);
    }
    
    // Regular teachers can only view subjects they are assigned to
    if (session.user.role === 'teacher') {
      console.log('API: Applying teacher filter to subjects query');
      
      // Don't apply the teacher filter for content uploads - teachers need to see all subjects in their departments
      const isContentUpload = request.headers.get('x-content-upload') === 'true';
      
      if (!isContentUpload) {
        query.teachers = session.user.id;
      } else {
        console.log('API: Content upload context detected, showing all accessible subjects to teacher');
      }
    }
    // Admins can only see subjects in departments they created
    else if (session.user.role === 'admin') {
      console.log('API: Applying admin department filter to subjects query');
      
      // Get departments created by this admin
      const adminDepartments = await Department.find({ createdBy: session.user.id }).select('_id');
      const departmentIds = adminDepartments.map(dept => dept._id);
      
      console.log(`API: Admin has ${departmentIds.length} departments`);
      
      if (departmentId) {
        // Check if this admin is authorized for this department
        if (!departmentIds.some(id => id.toString() === departmentId)) {
          console.log(`API: Admin not authorized for department ${departmentId}`);
          return NextResponse.json(
            { error: 'Not authorized to view subjects in this department' },
            { status: 403 }
          );
        }
      } else {
        query.department = { $in: departmentIds };
      }
    } else if (session.user.role === 'master-admin') {
      console.log('API: Master admin accessing subjects, no department restrictions');
    }
    
    console.log('API: Final subjects query:', JSON.stringify(query));
    
    // Find subjects
    let subjectsQuery = Subject.find(query)
      .sort({ department: 1, year: 1, semester: 1, name: 1 });
    
    // Populate relationships if requested
    if (populate) {
      const fieldsToPopulate = populate.split(',');
      
      if (fieldsToPopulate.includes('department')) {
        subjectsQuery = subjectsQuery.populate('department', 'name code');
      }
      
      if (fieldsToPopulate.includes('teachers')) {
        subjectsQuery = subjectsQuery.populate('teachers', 'name email');
      }
      
      if (fieldsToPopulate.includes('createdBy')) {
        subjectsQuery = subjectsQuery.populate('createdBy', 'name email');
      }
    }
    
    const subjects = await subjectsQuery;
    
    // Process data to ensure stable format for SSR and client
    const processedSubjects = subjects.map(subject => {
      // Convert Mongoose document to plain object
      const plainSubject = subject.toObject ? subject.toObject() : { ...subject };
      
      // Ensure department is always populated or has consistent format
      if (plainSubject.department && typeof plainSubject.department === 'object') {
        plainSubject.department = {
          _id: plainSubject.department._id.toString(),
          name: plainSubject.department.name || '',
          code: plainSubject.department.code || '',
        };
      }
      
      // Ensure teachers array is consistently formatted
      if (Array.isArray(plainSubject.teachers)) {
        plainSubject.teachers = plainSubject.teachers.map(teacher => {
          if (typeof teacher === 'object') {
            return {
              _id: teacher._id.toString(),
              name: teacher.name || '',
              email: teacher.email || '',
            };
          }
          return teacher.toString();
        });
      } else {
        plainSubject.teachers = [];
      }
      
      // Ensure createdBy is always populated or has consistent format
      if (plainSubject.createdBy && typeof plainSubject.createdBy === 'object') {
        plainSubject.createdBy = {
          _id: plainSubject.createdBy._id.toString(),
          name: plainSubject.createdBy.name || '',
          email: plainSubject.createdBy.email || '',
        };
      }
      
      // Convert _id to string to ensure stable format
      if (plainSubject._id) {
        plainSubject._id = plainSubject._id.toString();
      }
      
      return plainSubject;
    });
    
    console.log(`API: Returning ${processedSubjects.length} subjects`);
    
    return NextResponse.json(processedSubjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects', details: error.message },
      { status: 500 }
    );
  }
} 