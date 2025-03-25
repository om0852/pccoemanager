import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Department from '@/models/Department';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Check if user is admin
    const userEmail = session.user.email;
    await connectToDatabase();
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    
    let departments;
    
    // Find departments where the user is the head or admin is associated with the department
    // For now, we'll assume admins can access all departments
    // In a real application, you would implement specific access control logic here
    
    // Option 1: Return all departments (if no specific access control is implemented)
    departments = await Department.find({})
      .populate({ path: 'head', select: 'name email role' })
      .sort({ name: 1 });
    
    // Option 2: If you implement admin-to-department relationships:
    // departments = await Department.find({ adminId: user._id })
    //  .populate({ path: 'head', select: 'name email role' })
    //  .sort({ name: 1 });
    
    return NextResponse.json(departments);
    
  } catch (error) {
    console.error('Error fetching admin departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
} 