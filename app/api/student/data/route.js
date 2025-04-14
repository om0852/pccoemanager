import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Department from '@/models/Department';
import Subject from '@/models/Subject';
import Chapter from '@/models/Chapter';
import User from '@/models/User';

// @desc    Get all data needed for student portal
// @route   GET /api/student/data
// @access  Public
export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all departments with their subjects
    const departments = await Department.find()
      .sort({ name: 1 });

    // Process departments and fetch related data
    const processedData = await Promise.all(departments.map(async (department) => {
      // Get subjects for this department
      const subjects = await Subject.find({ department: department._id })
        .sort({ name: 1 });

      // Get chapters for all subjects in this department
      const chapters = await Chapter.find({
        subject: { $in: subjects.map(s => s._id) }
      }).sort({ number: 1 });

      // Get teachers for this department
      const teachers = await User.find({
        role: 'teacher',
        department: department._id
      })
      .select('name email')
      .sort({ name: 1 });

      // Process the data to ensure stable format
      return {
        _id: department._id.toString(),
        name: department.name,
        code: department.code,
        subjects: subjects.map(subject => ({
          _id: subject._id.toString(),
          name: subject.name,
          code: subject.code,
          semester: subject.semester,
          year: subject.year,
          chapters: chapters
            .filter(chapter => chapter.subject.toString() === subject._id.toString())
            .map(chapter => ({
              _id: chapter._id.toString(),
              name: chapter.name,
              number: chapter.number
            }))
        })),
        teachers: teachers.map(teacher => ({
          _id: teacher._id.toString(),
          name: teacher.name,
          email: teacher.email
        }))
      };
    }));

    // Get unique semesters and years from all subjects
    const allSubjects = await Subject.find();
    const semesters = [...new Set(allSubjects.map(s => s.semester))].filter(Boolean).sort((a, b) => a - b);
    const years = [...new Set(allSubjects.map(s => s.year))].filter(Boolean).sort((a, b) => a - b);

    return NextResponse.json({
      departments: processedData,
      semesters,
      years
    });
  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student data' },
      { status: 500 }
    );
  }
} 