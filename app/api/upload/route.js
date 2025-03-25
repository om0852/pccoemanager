import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { validateFileType, generateUniqueFilename } from '@/lib/utils';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// @desc    Upload a file
// @route   POST /api/upload
// @access  Private (Authenticated users)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }
    
    // Parse the FormData
    const formData = await request.formData();
    const file = formData.get('file');
    const contentType = formData.get('contentType');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    if (!contentType) {
      return NextResponse.json(
        { error: 'Content type is required' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!validateFileType(file.type, contentType)) {
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
    const uniqueFilename = generateUniqueFilename(file.name);
    
    // Define the upload directory based on content type
    const uploadDir = join(process.cwd(), 'public', 'uploads', contentType);
    
    // Create the file path
    const filePath = join(uploadDir, uniqueFilename);
    
    // Convert the file to a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write the file to the server
    await writeFile(filePath, buffer);
    
    // Create the public URL
    const fileUrl = `/uploads/${contentType}/${uniqueFilename}`;
    
    return NextResponse.json({
      message: 'File uploaded successfully',
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    );
  }
} 