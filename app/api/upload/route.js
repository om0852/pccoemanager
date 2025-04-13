import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
  'notes': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  'video': [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm'
  ],
  'assignment': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  'question-paper': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  'answer-paper': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// @desc    Upload a file
// @route   POST /api/upload
// @access  Private (Authenticated users)
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    const contentType = formData.get('contentType');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!contentType) {
      return NextResponse.json({ error: 'Content type is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ALLOWED_FILE_TYPES[contentType];
    if (!allowedTypes?.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type for this content' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the limit (10MB)' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const filename = `${contentType}/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;

    try {
      // Upload to Vercel Blob Storage
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false // We already add timestamp and random string
      });

      // Return the blob URL and metadata
      return NextResponse.json({
        success: true,
        fileUrl: blob.url,
        filename: originalName,
        size: file.size,
        type: file.type
      });

    } catch (uploadError) {
      console.error('Blob storage error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage', details: uploadError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed', details: error.message },
      { status: 500 }
    );
  }
} 