import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Chapter from '@/models/Chapter';
import Subject from '@/models/Subject';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// @desc    Reorder chapters within a subject
// @route   POST /api/chapters/reorder
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
    
    const { subjectId, chapterOrders } = await request.json();
    
    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return NextResponse.json(
        { error: 'Invalid or missing subject ID' },
        { status: 400 }
      );
    }
    
    if (!chapterOrders || !Array.isArray(chapterOrders) || chapterOrders.length === 0) {
      return NextResponse.json(
        { error: 'Chapter orders must be a non-empty array' },
        { status: 400 }
      );
    }
    
    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    if (session.user.role === 'teacher') {
      // Teachers can only reorder chapters for subjects they teach
      const isTeacher = subject.teachers.some(
        teacherId => teacherId.toString() === session.user.id
      );
      
      if (!isTeacher) {
        return NextResponse.json(
          { error: 'Not authorized to reorder chapters for this subject' },
          { status: 403 }
        );
      }
    } else if (session.user.role === 'admin') {
      // Admins can only reorder chapters for subjects in departments they created
      const department = await Department.findById(subject.department);
      
      if (department.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to reorder chapters for this subject' },
          { status: 403 }
        );
      }
    }
    
    // Validate all chapter IDs
    for (const item of chapterOrders) {
      if (!item.id || !mongoose.Types.ObjectId.isValid(item.id)) {
        return NextResponse.json(
          { error: 'Invalid chapter ID in order array' },
          { status: 400 }
        );
      }
      
      if (typeof item.order !== 'number' || item.order < 1) {
        return NextResponse.json(
          { error: 'Invalid order value in order array' },
          { status: 400 }
        );
      }
    }
    
    // Get all chapters for this subject to verify they all belong to it
    const existingChapters = await Chapter.find({ subject: subjectId });
    const existingChapterIds = existingChapters.map(ch => ch._id.toString());
    
    for (const item of chapterOrders) {
      if (!existingChapterIds.includes(item.id)) {
        return NextResponse.json(
          { error: 'One or more chapters do not belong to the specified subject' },
          { status: 400 }
        );
      }
    }
    
    // Update order for each chapter
    const updates = chapterOrders.map(item => {
      return Chapter.findByIdAndUpdate(
        item.id,
        { $set: { order: item.order, updatedAt: Date.now() } },
        { new: true }
      );
    });
    
    await Promise.all(updates);
    
    return NextResponse.json(
      { message: 'Chapters reordered successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reordering chapters:', error);
    return NextResponse.json(
      { error: 'Failed to reorder chapters', details: error.message },
      { status: 500 }
    );
  }
} 