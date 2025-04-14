import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Content } from '@/lib/models';

// @desc    Get all public content
// @route   GET /api/content/public
// @access  Public
export async function GET() {
  try {
    await connectToDatabase();
    
    // Find all content and populate necessary fields
    const content = await Content.find()
      .populate('subject', 'name code department')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });
    
    // Process data to ensure stable format
    const processedContent = content.map(item => {
      const plainItem = item.toObject();
      return {
        _id: plainItem._id.toString(),
        title: plainItem.title,
        description: plainItem.description,
        contentType: plainItem.contentType,
        fileUrl: plainItem.fileUrl,
        subject: plainItem.subject ? {
          _id: plainItem.subject._id.toString(),
          name: plainItem.subject.name,
          code: plainItem.subject.code,
          department: plainItem.subject.department.toString()
        } : null,
        createdAt: plainItem.createdAt
      };
    });
    
    return NextResponse.json(processedContent);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
} 