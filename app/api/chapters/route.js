import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Chapter from '@/models/Chapter';
import Subject from '@/models/Subject';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// @desc    Create a new chapter
// @route   POST /api/chapters
// @access  Private (Admin/Teacher)
export async function POST(request) {
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
    
    const data = await request.json();
    
    // Validate subject ID
    if (!mongoose.Types.ObjectId.isValid(data.subject)) {
      return NextResponse.json(
        { error: 'Invalid subject ID format' },
        { status: 400 }
      );
    }
    
    // Check if subject exists
    const subject = await Subject.findById(data.subject);
    
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    if (session.user.role === 'teacher') {
      // Teachers can only add chapters to subjects they teach
      const isTeacher = subject.teachers.some(
        teacherId => teacherId.toString() === session.user.id
      );
      
      if (!isTeacher) {
        return NextResponse.json(
          { error: 'Not authorized to add chapters to this subject' },
          { status: 403 }
        );
      }
    } else if (session.user.role === 'admin') {
      // Admins can only add chapters to subjects in departments they created
      const department = await Department.findById(subject.department);
      
      if (department.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to add chapters to this subject' },
          { status: 403 }
        );
      }
    }
    
    // Get current max order for this subject
    const maxOrderChapter = await Chapter.findOne({ subject: data.subject })
      .sort({ order: -1 });
    
    // Set order (current max + 1, or 1 if no chapters exist)
    const order = maxOrderChapter ? maxOrderChapter.order + 1 : 1;
    
    // Add the user who created this chapter and set order
    const chapterData = {
      ...data,
      createdBy: session.user.id,
      order
    };
    
    const chapter = await Chapter.create(chapterData);
    
    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { error: 'Failed to create chapter', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Get all chapters (with filtering)
// @route   GET /api/chapters
// @access  Private (Authenticated users)
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Not authorized to view chapters' },
        { status: 403 }
      );
    }
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject');
    
    const query = {};
    
    // Apply filters if provided
    if (subjectId) {
      // Validate subject ID
      if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return NextResponse.json(
          { error: 'Invalid subject ID format' },
          { status: 400 }
        );
      }
      query.subject = subjectId;
    }
    
    // Teachers can only view chapters for subjects they teach
    if (session.user.role === 'teacher') {
      // Get subjects this teacher teaches
      const teacherSubjects = await Subject.find({ teachers: session.user.id }).select('_id');
      const subjectIds = teacherSubjects.map(sub => sub._id);
      
      if (subjectId) {
        if (!subjectIds.some(id => id.toString() === subjectId)) {
          return NextResponse.json(
            { error: 'Not authorized to view chapters for this subject' },
            { status: 403 }
          );
        }
      } else {
        query.subject = { $in: subjectIds };
      }
    }
    // Admins can only see chapters in departments they created
    else if (session.user.role === 'admin') {
      // Get departments created by this admin
      const adminDepartments = await Department.find({ createdBy: session.user.id }).select('_id');
      const departmentIds = adminDepartments.map(dept => dept._id);
      
      // Get subjects in these departments
      const departmentSubjects = await Subject.find({ 
        department: { $in: departmentIds } 
      }).select('_id');
      
      const subjectIds = departmentSubjects.map(sub => sub._id);
      
      if (subjectId) {
        if (!subjectIds.some(id => id.toString() === subjectId)) {
          return NextResponse.json(
            { error: 'Not authorized to view chapters for this subject' },
            { status: 403 }
          );
        }
      } else {
        query.subject = { $in: subjectIds };
      }
    }
    
    // Find chapters
    const chapters = await Chapter.find(query)
      .populate('subject', 'name code')
      .populate('createdBy', 'name email')
      .sort({ subject: 1, order: 1 });
    
    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters', details: error.message },
      { status: 500 }
    );
  }
} 