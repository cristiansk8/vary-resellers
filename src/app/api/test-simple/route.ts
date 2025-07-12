import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🧪 TEST ENDPOINT LLAMADO');
  
  try {
    const body = await request.json();
    console.log('📦 Body recibido:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Test exitoso',
      received: body,
      loginInfo: {
        email: body.email,
        documentId: body.documentId,
        tempPassword: 'TEST123'
      }
    });
  } catch (error) {
    console.error('❌ Error en test:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Test endpoint funcionando',
    timestamp: new Date().toISOString()
  });
}