import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Content from '@/models/Content';
import Subject from '@/models/Subject';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// @desc    Create new content
// @route   POST /api/content
// @access  Private (Admin/Teacher - teachers only for their subjects)
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
    
    // Validate department ID
    if (!data.department || !mongoose.Types.ObjectId.isValid(data.department)) {
      return NextResponse.json(
        { error: 'Invalid or missing department ID' },
        { status: 400 }
      );
    }
    
    // Validate subject ID
    if (!data.subject || !mongoose.Types.ObjectId.isValid(data.subject)) {
      return NextResponse.json(
        { error: 'Invalid or missing subject ID' },
        { status: 400 }
      );
    }
    
    // Validate chapter ID if provided
    if (data.chapter && !mongoose.Types.ObjectId.isValid(data.chapter)) {
      return NextResponse.json(
        { error: 'Invalid chapter ID' },
        { status: 400 }
      );
    }
    
    // Validate semester if provided
    if (data.semester) {
      const semester = parseInt(data.semester);
      if (isNaN(semester) || semester < 1 || semester > 8) {
        return NextResponse.json(
          { error: 'Semester must be a number between 1 and 8' },
          { status: 400 }
        );
      }
      data.semester = semester;
    }
    
    // Validate year if provided
    if (data.year) {
      const year = parseInt(data.year);
      if (isNaN(year) || year < 1 || year > 4) {
        return NextResponse.json(
          { error: 'Year must be a number between 1 and 4' },
          { status: 400 }
        );
      }
      data.year = year;
    }
    
    // Check if department exists
    const department = await Department.findById(data.department);
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Check if subject exists and belongs to the specified department
    const subject = await Subject.findById(data.subject);
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Verify that the subject belongs to the specified department
    if (subject.department.toString() !== data.department) {
      return NextResponse.json(
        { error: 'Subject does not belong to the specified department' },
        { status: 400 }
      );
    }
    
    // Check if chapter exists and belongs to the specified subject
    if (data.chapter) {
      const chapter = await mongoose.models.Chapter.findById(data.chapter);
      if (!chapter) {
        return NextResponse.json(
          { error: 'Chapter not found' },
          { status: 404 }
        );
      }
      
      // Verify that the chapter belongs to the specified subject
      if (chapter.subject.toString() !== data.subject) {
        return NextResponse.json(
          { error: 'Chapter does not belong to the specified subject' },
          { status: 400 }
        );
      }
    }
    
    // Check permissions
    if (session.user.role === 'teacher') {
      // Teachers can only add content to subjects they teach
      const isTeacher = subject.teachers.some(
        teacherId => teacherId.toString() === session.user.id
      );
      
      if (!isTeacher) {
        return NextResponse.json(
          { error: 'Not authorized to add content to this subject' },
          { status: 403 }
        );
      }
    } else if (session.user.role === 'admin') {
      // Admins can only add content to subjects in departments they created
      if (department.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to add content to this department' },
          { status: 403 }
        );
      }
    }
    
    // Add the user who created this content
    data.createdBy = session.user.id;
    
    const content = await Content.create(data);
    
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Get all content (with filtering)
// @route   GET /api/content
// @access  Private (Authenticated users)
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Not authorized to view content' },
        { status: 403 }
      );
    }
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department');
    const subjectId = searchParams.get('subject');
    const chapterId = searchParams.get('chapter');
    const semester = searchParams.get('semester');
    const year = searchParams.get('year');
    const contentType = searchParams.get('type');
    
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
    
    if (chapterId) {
      // Validate chapter ID
      if (!mongoose.Types.ObjectId.isValid(chapterId)) {
        return NextResponse.json(
          { error: 'Invalid chapter ID format' },
          { status: 400 }
        );
      }
      query.chapter = chapterId;
    }
    
    if (semester) {
      // Validate semester
      const semesterNum = parseInt(semester);
      if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
        return NextResponse.json(
          { error: 'Invalid semester. Must be between 1 and 8' },
          { status: 400 }
        );
      }
      query.semester = semesterNum;
    }
    
    if (year) {
      // Validate year
      const yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 1 || yearNum > 4) {
        return NextResponse.json(
          { error: 'Invalid year. Must be between 1 and 4' },
          { status: 400 }
        );
      }
      query.year = yearNum;
    }
    
    if (contentType) {
      query.contentType = contentType;
    }
    
    // Teachers can only view content for subjects they teach
    if (session.user.role === 'teacher') {
      // Get subjects this teacher teaches
      const teacherSubjects = await Subject.find({ teachers: session.user.id }).select('_id');
      const subjectIds = teacherSubjects.map(sub => sub._id);
      
      if (subjectId) {
        if (!subjectIds.some(id => id.toString() === subjectId)) {
          return NextResponse.json(
            { error: 'Not authorized to view content for this subject' },
            { status: 403 }
          );
        }
      } else {
        query.subject = { $in: subjectIds };
      }
    }
    // Admins can only see content in departments they created
    else if (session.user.role === 'admin') {
      // Get departments created by this admin
      const adminDepartments = await Department.find({ createdBy: session.user.id }).select('_id');
      const departmentIds = adminDepartments.map(dept => dept._id);
      
      if (departmentId) {
        if (!departmentIds.some(id => id.toString() === departmentId)) {
          return NextResponse.json(
            { error: 'Not authorized to view content for this department' },
            { status: 403 }
          );
        }
      } else {
        // If no department filter, add department filter based on admin's departments
        query.department = { $in: departmentIds };
      }
    }
    
    // Find content
    const content = await Content.find(query)
      .populate('department', 'name code')
      .populate('subject', 'name code')
      .populate('chapter', 'title')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    );
  }
} 