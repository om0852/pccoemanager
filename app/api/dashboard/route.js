import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Department from "@/models/Department";
import Subject from "@/models/Subject";
import User from "@/models/User";
import Content from "@/models/Content";
import connectToDatabase from "@/lib/db";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get dashboard stats based on user role
    const stats = {};
    
    // Common stats for all roles
    const contentItems = await Content.countDocuments();
    stats.contentItems = contentItems;
    
    // Stats for admin and master-admin
    if (user.role === 'admin' || user.role === 'master-admin') {
      // For master-admin, get all departments
      // For admin, get only departments they manage
      const departmentQuery = user.role === 'master-admin' 
        ? {} 
        : { createdBy: user._id };
      
      const departments = await Department.countDocuments(departmentQuery);
      stats.departments = departments;
      
      // Get subjects count
      const subjectQuery = user.role === 'master-admin'
        ? {}
        : { department: { $in: await Department.find({ createdBy: user._id }).distinct('_id') } };
      
      const subjects = await Subject.countDocuments(subjectQuery);
      stats.subjects = subjects;
      
      // Get users count
      const userQuery = user.role === 'master-admin'
        ? { role: { $ne: 'master-admin' } }
        : { createdBy: user._id, role: { $ne: 'master-admin' } };
      
      const users = await User.countDocuments(userQuery);
      stats.users = users;
    }
    
    // Stats for teachers
    if (user.role === 'teacher') {
      // Count teacher's content
      const teacherContent = await Content.countDocuments({ createdBy: user._id });
      stats.teacherContent = teacherContent;
      
      // Count teacher's subjects
      const teacherSubjects = await Subject.countDocuments({ teachers: user._id });
      stats.teacherSubjects = teacherSubjects;
    }
    
    console.log("Dashboard stats:", stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
} 