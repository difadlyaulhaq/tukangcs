// src/pages/api/knowledge-base/upload.ts
import type { APIRoute } from 'astro';
import { adminDb, adminStorage } from '../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📤 Starting file upload process...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    console.log('📁 File received:', file?.name, 'Size:', file?.size);

    if (!file) {
      console.error('❌ No file found in request');
      return new Response(JSON.stringify({ error: 'File tidak ditemukan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validasi file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size);
      return new Response(JSON.stringify({ error: 'Ukuran file maksimal 10MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type);
      return new Response(JSON.stringify({ error: 'Format file tidak didukung. Gunakan PDF, DOC, DOCX, atau TXT' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ File validation passed');

    // Generate unique filename
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `knowledge-base/${fileName}`;
    
    console.log('📦 Uploading to path:', filePath);

    try {
      // Get Storage bucket
      const bucket = adminStorage.bucket();
      console.log('🪣 Got storage bucket:', bucket.name);

      // Create file reference
      const fileRef = bucket.file(filePath);

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log('💾 Buffer created, size:', buffer.length);

      // Upload file
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      console.log('✅ File uploaded successfully');

      // Make file publicly accessible
      await fileRef.makePublic();
      console.log('🌐 File made public');

      // Generate download URL
      const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      console.log('🔗 Download URL:', downloadURL);

      // Save metadata to Firestore
      const docData = {
        title: title || file.name,
        type: 'file',
        fileUrl: downloadURL,
        fileName: fileName,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: FieldValue.serverTimestamp(),
        createdAt: new Date().toISOString()
      };

      console.log('💾 Saving to Firestore...');
      const docRef = await adminDb.collection('knowledge_base').add(docData);
      console.log('✅ Document saved with ID:', docRef.id);

      return new Response(JSON.stringify({ 
        success: true, 
        docId: docRef.id,
        fileName: fileName,
        fileUrl: downloadURL,
        message: 'File berhasil diupload'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (storageError) {
      console.error('❌ Storage error:', storageError);
      throw new Error(`Storage error: ${storageError instanceof Error ? storageError.message : 'Unknown storage error'}`);
    }

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Gagal upload file';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      // Check for specific error types
      if (error.message.includes('credential')) {
        errorMessage = 'Konfigurasi Firebase tidak valid';
        errorDetails = 'Silakan periksa konfigurasi Firebase Admin SDK';
      } else if (error.message.includes('Storage')) {
        errorMessage = 'Gagal menyimpan file ke storage';
      } else if (error.message.includes('Firestore')) {
        errorMessage = 'Gagal menyimpan metadata ke database';
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};