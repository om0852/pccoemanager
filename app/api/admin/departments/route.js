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
    
    // Check if user has admin or master-admin role
    const userEmail = session.user.email;
    await connectToDatabase();
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user || (user.role !== 'admin' && user.role !== 'master-admin')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    
    let departments;
    
    // Different department access based on role
    // Master admins can see all departments
    // Regular admins can only see departments they created
    if (user.role === 'master-admin') {
      departments = await Department.find({})
        .sort({ name: 1 });
    } else {
      // For regular admins, only show departments they created
      departments = await Department.find({ createdBy: user._id })
        .sort({ name: 1 });
    }
    
    return NextResponse.json(departments);
    
  } catch (error) {
    console.error('Error fetching admin departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
} 