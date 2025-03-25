# College Portal Application

A modern web application for college administration, enabling seamless management of departments, subjects, users, and educational content.

## Features

### User Management
- **Role-based Access Control**: Different access levels for Master Admin, Admin, and Teacher roles
- **User Creation**: Create and manage user accounts with different permission levels
- **Profile Management**: Users can update their profiles and change passwords

### Department Management
- Create, view, edit, and delete academic departments
- Assign department heads and manage departmental structure

### Subject Management
- Create and organize subjects within departments
- Assign teachers to subjects
- Track subject-specific educational content

### Chapter Management
- Organize educational content into chapters within subjects
- Create, edit, and reorder chapters
- Add learning outcomes for each chapter
- Set active/inactive status for chapters

### Content Library
- Upload various types of educational content (PDFs, videos, presentations)
- Categorize content by subject, chapter, and type
- Filter and search content based on various criteria
- Manage permissions for content access

### Dashboard
- At-a-glance statistics for departments, subjects, users, and content
- Quick access to frequently used functions
- Role-specific dashboard views

## Navigation Structure

### Common Navigation
- **Dashboard** (`/dashboard`) - Available to all authenticated users
- **Content Library** (`/content`) - Access educational materials

### Master Admin Navigation
- **Master Admin Dashboard** (`/master-admin`) - Overview and system statistics
- **Admin Users** (`/master-admin/users`) - Manage all users including admins
- **All Departments** (`/master-admin/departments`) - Manage all departments

### Admin Navigation
- **Departments** (`/admin/departments`) - Manage departments under admin's control
- **Users** (`/admin/users`) - Manage users (teachers) in admin's departments
- **Subjects** (`/admin/subjects`) - Manage subjects in admin's departments
- **Chapters** (`/admin/chapters`) - Manage chapters for subjects

### Teacher Navigation
- **My Content** (`/content/manage`) - Manage uploaded content
- **Upload Content** (`/content/new`) - Upload new educational materials

## User Roles

### Master Admin
- Complete system oversight
- Create and manage Admin users
- Access to all system features and data

### Admin
- Department management
- Teacher account creation and management
- Subject and chapter creation and organization

### Teacher
- Content creation and management
- Access to subject-specific information
- Viewing rights to departmental resources

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/college-portal.git
   cd college-portal
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_auth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the development server
   ```
   npm run dev
   ```
   The system will automatically create a master admin account on first startup:
   - Email: salunkeom474@gmail.com
   - Password: Master@123 (change after first login)

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```
npm run build
npm start
```

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **File Storage**: Local file system (can be extended to cloud storage)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
