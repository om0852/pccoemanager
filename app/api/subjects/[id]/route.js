import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Subject from '@/models/Subject';
import Department from '@/models/Department';
import Content from '@/models/Content';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// @desc    Get subject by ID
// @route   GET /api/subjects/:id
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
    
    const subjectId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return NextResponse.json(
        { error: 'Invalid subject ID format' },
        { status: 400 }
      );
    }
    
    // Find subject
    const subject = await Subject.findById(subjectId)
      .populate('department', 'name code')
      .populate('teachers', 'name email')
      .populate('createdBy', 'name email');
    
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Check access permissions
    if (session.user.role === 'teacher') {
      // Teachers can only view subjects they are assigned to
      const isTeacher = subject.teachers.some(
        teacher => teacher._id.toString() === session.user.id
      );
      
      if (!isTeacher) {
        return NextResponse.json(
          { error: 'Not authorized to view this subject' },
          { status: 403 }
        );
      }
    } else if (session.user.role === 'admin') {
      // Admins can only view subjects in departments they created
      const department = await Department.findById(subject.department._id);
      
      if (department.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to view this subject' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subject', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin/Master Admin only)
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'master-admin')) {
      return NextResponse.json(
        { error: 'Not authorized to update subjects' },
        { status: 403 }
      );
    }
    
    const subjectId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return NextResponse.json(
        { error: 'Invalid subject ID format' },
        { status: 400 }
      );
    }
    
    // Get subject data
    const data = await request.json();
    
    // Find subject
    const subject = await Subject.findById(subjectId);
    
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Check if admin has access to this subject's department
    if (session.user.role === 'admin') {
      const department = await Department.findById(subject.department);
      
      if (department.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to update this subject' },
          { status: 403 }
        );
      }
    }
    
    // If department is being changed, validate it
    if (data.department && data.department !== subject.department.toString()) {
      // Validate department ID
      if (!mongoose.Types.ObjectId.isValid(data.department)) {
        return NextResponse.json(
          { error: 'Invalid department ID format' },
          { status: 400 }
        );
      }
      
      // Check if department exists
      const newDepartment = await Department.findById(data.department);
      
      if (!newDepartment) {
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 }
        );
      }
      
      // Check if admin has access to the new department
      if (session.user.role === 'admin' && 
          newDepartment.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to move subject to this department' },
          { status: 403 }
        );
      }
    }
    
    // Check for duplicate subject code in the same department (if code is being updated)
    if (data.code && data.code !== subject.code) {
      const departmentId = data.department || subject.department;
      
      const existingSubject = await Subject.findOne({
        _id: { $ne: subjectId },
        department: departmentId,
        code: data.code
      });
      
      if (existingSubject) {
        return NextResponse.json(
          { error: 'Subject with this code already exists in this department' },
          { status: 400 }
        );
      }
    }
    
    // Update subject
    const updatedSubject = await Subject.findByIdAndUpdate(
      subjectId,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .populate('teachers', 'name email');
    
    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: 'Failed to update subject', details: error.message },
      { status: 500 }
    );
  }
}

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin/Master Admin only)
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has proper role
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'master-admin')) {
      return NextResponse.json(
        { error: 'Not authorized to delete subjects' },
        { status: 403 }
      );
    }
    
    const subjectId = params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return NextResponse.json(
        { error: 'Invalid subject ID format' },
        { status: 400 }
      );
    }
    
    // Find subject
    const subject = await Subject.findById(subjectId);
    
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Check if admin has access to this subject's department
    if (session.user.role === 'admin') {
      const department = await Department.findById(subject.department);
      
      if (department.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to delete this subject' },
          { status: 403 }
        );
      }
    }
    
    // Check if subject has content
    const contentCount = await Content.countDocuments({ subject: subjectId });
    
    if (contentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete subject with associated content. Remove all content first.' },
        { status: 400 }
      );
    }
    
    // Delete subject
    await Subject.findByIdAndDelete(subjectId);
    
    return NextResponse.json(
      { message: 'Subject deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: 'Failed to delete subject', details: error.message },
      { status: 500 }
    );
  }
} 