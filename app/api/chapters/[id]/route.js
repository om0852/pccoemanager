import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Chapter from '@/models/Chapter';
import Subject from '@/models/Subject';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// @desc    Get chapter by ID
// @route   GET /api/chapters/:id
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
    
    const chapterId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json(
        { error: 'Invalid chapter ID format' },
        { status: 400 }
      );
    }
    
    // Find chapter with populated fields
    const chapter = await Chapter.findById(chapterId)
      .populate('subject', 'name code department')
      .populate('createdBy', 'name email');
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    // Check access permissions
    if (session.user.role === 'teacher') {
      // Teachers can only view chapters for subjects they teach
      const subject = await Subject.findById(chapter.subject._id);
      
      const isTeacher = subject.teachers.some(
        teacherId => teacherId.toString() === session.user.id
      );
      
      if (!isTeacher) {
        return NextResponse.json(
          { error: 'Not authorized to view this chapter' },
          { status: 403 }
        );
      }
    } else if (session.user.role === 'admin') {
      // Admins can only view chapters for subjects in departments they created
      const subject = await Subject.findById(chapter.subject._id);
      const department = await Department.findById(subject.department);
      
      if (department.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to view this chapter' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Update chapter
// @route   PUT /api/chapters/:id
// @access  Private (Admin/Teacher)
export async function PUT(request, { params }) {
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
    
    const chapterId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json(
        { error: 'Invalid chapter ID format' },
        { status: 400 }
      );
    }
    
    // Get chapter data
    const data = await request.json();
    
    // Find chapter
    const chapter = await Chapter.findById(chapterId);
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    // Find subject
    const subject = await Subject.findById(chapter.subject);
    
    // Check permissions
    if (session.user.role === 'teacher') {
      // Teachers can only update chapters for subjects they teach
      const isTeacher = subject.teachers.some(
        teacherId => teacherId.toString() === session.user.id
      );
      
      if (!isTeacher) {
        return NextResponse.json(
          { error: 'Not authorized to update this chapter' },
          { status: 403 }
        );
      }
    } else if (session.user.role === 'admin') {
      // Admins can only update chapters for subjects in departments they created
      const department = await Department.findById(subject.department);
      
      if (department.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to update this chapter' },
          { status: 403 }
        );
      }
    }
    
    // Allow updating only specific fields (not the subject or order)
    const updateData = {
      title: data.title || chapter.title,
      description: data.description || chapter.description,
      learningOutcomes: data.learningOutcomes || chapter.learningOutcomes,
      isActive: data.isActive !== undefined ? data.isActive : chapter.isActive,
      updatedAt: Date.now()
    };
    
    // Update chapter
    const updatedChapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('subject', 'name code');
    
    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json(
      { error: 'Failed to update chapter', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Delete chapter
// @route   DELETE /api/chapters/:id
// @access  Private (Admin/Teacher)
export async function DELETE(request, { params }) {
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
    
    const chapterId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json(
        { error: 'Invalid chapter ID format' },
        { status: 400 }
      );
    }
    
    // Find chapter
    const chapter = await Chapter.findById(chapterId);
    
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    // Find subject
    const subject = await Subject.findById(chapter.subject);
    
    // Check permissions
    if (session.user.role === 'teacher') {
      // Teachers can only delete chapters for subjects they teach
      const isTeacher = subject.teachers.some(
        teacherId => teacherId.toString() === session.user.id
      );
      
      if (!isTeacher) {
        return NextResponse.json(
          { error: 'Not authorized to delete this chapter' },
          { status: 403 }
        );
      }
    } else if (session.user.role === 'admin') {
      // Admins can only delete chapters for subjects in departments they created
      const department = await Department.findById(subject.department);
      
      if (department.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to delete this chapter' },
          { status: 403 }
        );
      }
    }
    
    // Delete chapter
    await Chapter.findByIdAndDelete(chapterId);
    
    // Re-order remaining chapters
    const chaptersToUpdate = await Chapter.find({ 
      subject: chapter.subject,
      order: { $gt: chapter.order }
    }).sort({ order: 1 });
    
    for (const chapterToUpdate of chaptersToUpdate) {
      chapterToUpdate.order = chapterToUpdate.order - 1;
      await chapterToUpdate.save();
    }
    
    return NextResponse.json(
      { message: 'Chapter deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      { error: 'Failed to delete chapter', details: error.message },
      { status: 500 }
    );
  }
} 