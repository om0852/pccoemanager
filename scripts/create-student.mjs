import fetch from 'node-fetch';

async function createStudent() {
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Student User',
        email: 'student@gmail.com',
        password: 'student@22',
        role: 'student'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create student user');
    }

    console.log('Student user created successfully:');
    console.log('Email: student@gmail.com');
    console.log('Password: student@22');
    
  } catch (error) {
    console.error('Error creating student user:', error);
    process.exit(1);
  }
}

createStudent(); 