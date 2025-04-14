import connectToDatabase from '@/lib/db';
import Content from '@/models/Content';



export async function GET(request) {
    try {
        await connectToDatabase();
        const data = await Content.find({});
        console.log(data);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
}


// http://localhost:3000/api/content/student