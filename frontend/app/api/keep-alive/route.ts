import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rimn-backend.onrender.com';
    const response = await fetch(`${apiUrl}/health`);
    const data = await response.json();
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Keep-alive ping sent successfully to prevent Render sleep',
      backendStatus: data 
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to ping backend' },
      { status: 500 }
    );
  }
}
