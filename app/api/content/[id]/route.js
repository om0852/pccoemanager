import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Content from '@/models/Content';
import Subject from '@/models/Subject';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// @desc    Get content by ID
// @route   GET /api/content/:id
// @access  Private (Authenticated users with proper permissions)
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
    
    const contentId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json(
        { error: 'Invalid content ID format' },
        { status: 400 }
      );
    }
    
    // Find content
    const content = await Content.findById(contentId)
      .populate('subject', 'name code department')
      .populate('createdBy', 'name email');
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Check access permissions
    if (session.user.role === 'teacher') {
      // Teachers can only view content for subjects they teach
      const subject = await Subject.findById(content.subject._id);
      
      const isTeacher = subject.teachers.some(
        teacherId => teacherId.toString() === session.user.id
      );
      
      if (!isTeacher) {
        return NextResponse.json(
          { error: 'Not authorized to view this content' },
          { status: 403 }
        );
      }
    } else if (session.user.role === 'admin') {
      // Admins can only view content for subjects in departments they created
      const subject = await Subject.findById(content.subject._id);
      const department = await Department.findById(subject.department);
      
      if (department.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to view this content' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private (Content owner or Admin/Master Admin)
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
    
    const contentId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json(
        { error: 'Invalid content ID format' },
        { status: 400 }
      );
    }
    
    // Get content data
    const data = await request.json();
    
    // Find content
    const content = await Content.findById(contentId);
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    // Allow content creator to update their own content
    const isOwner = content.createdBy.toString() === session.user.id;
    
    if (!isOwner) {
      if (session.user.role === 'teacher') {
        // Teachers who don't own the content cannot update it
        return NextResponse.json(
          { error: 'Not authorized to update this content' },
          { status: 403 }
        );
      } else if (session.user.role === 'admin') {
        // Admins can only update content for subjects in departments they created
        const subject = await Subject.findById(content.subject);
        const department = await Department.findById(subject.department);
        
        if (department.createdBy.toString() !== session.user.id) {
          return NextResponse.json(
            { error: 'Not authorized to update this content' },
            { status: 403 }
          );
        }
      }
    }
    
    // If subject is being changed, validate it
    if (data.subject && data.subject !== content.subject.toString()) {
      // Validate subject ID
      if (!mongoose.Types.ObjectId.isValid(data.subject)) {
        return NextResponse.json(
          { error: 'Invalid subject ID format' },
          { status: 400 }
        );
      }
      
      // Check if subject exists
      const newSubject = await Subject.findById(data.subject);
      
      if (!newSubject) {
        return NextResponse.json(
          { error: 'Subject not found' },
          { status: 404 }
        );
      }
      
      // Check permissions for new subject
      if (session.user.role === 'teacher') {
        // Teachers can only move content to subjects they teach
        const isTeacher = newSubject.teachers.some(
          teacherId => teacherId.toString() === session.user.id
        );
        
        if (!isTeacher) {
          return NextResponse.json(
            { error: 'Not authorized to move content to this subject' },
            { status: 403 }
          );
        }
      } else if (session.user.role === 'admin') {
        // Admins can only move content to subjects in departments they created
        const department = await Department.findById(newSubject.department);
        
        if (department.createdBy.toString() !== session.user.id) {
          return NextResponse.json(
            { error: 'Not authorized to move content to this subject' },
            { status: 403 }
          );
        }
      }
    }
    
    // Update content
    const updatedContent = await Content.findByIdAndUpdate(
      contentId,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('subject', 'name code')
      .populate('createdBy', 'name email');
    
    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private (Content owner or Admin/Master Admin)
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
    
    const contentId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json(
        { error: 'Invalid content ID format' },
        { status: 400 }
      );
    }
    
    // Find content
    const content = await Content.findById(contentId);
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    // Allow content creator to delete their own content
    const isOwner = content.createdBy.toString() === session.user.id;
    
    if (!isOwner) {
      if (session.user.role === 'teacher') {
        // Teachers who don't own the content cannot delete it
        return NextResponse.json(
          { error: 'Not authorized to delete this content' },
          { status: 403 }
        );
      } else if (session.user.role === 'admin') {
        // Admins can only delete content for subjects in departments they created
        const subject = await Subject.findById(content.subject);
        const department = await Department.findById(subject.department);
        
        if (department.createdBy.toString() !== session.user.id) {
          return NextResponse.json(
            { error: 'Not authorized to delete this content' },
            { status: 403 }
          );
        }
      }
    }
    
    // TODO: Delete the file from storage if using cloud storage
    
    // Delete content
    await Content.findByIdAndDelete(contentId);
    
    return NextResponse.json(
      { message: 'Content deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content', details: error.message },
      { status: 500 }
    );
  }
} 