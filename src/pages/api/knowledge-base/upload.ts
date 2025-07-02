// src/pages/api/knowledge-base/upload.ts
import type { APIRoute } from 'astro';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { FieldValue } from 'firebase-admin/firestore';

const storage = getStorage();

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const authToken = formData.get('authToken') as string;
    const title = formData.get('title') as string;

    if (!authToken) {
      return new Response(JSON.stringify({ error: 'Token tidak ditemukan' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    if (!file) {
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
      return new Response(JSON.stringify({ error: 'Ukuran file maksimal 10MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Format file tidak didukung' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upload file ke Storage
    const fileName = `${Date.now()}_${file.name}`;
    const bucket = storage.bucket();
    const fileRef = bucket.file(`knowledge-base/${userId}/${fileName}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedBy: userId
        }
      }
    });

    // Get download URL
    await fileRef.makePublic();
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;

    // Simpan metadata ke Firestore
    const docData = {
      title: title || file.name,
      type: 'file',
      fileUrl: downloadURL,
      fileName: fileName,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: FieldValue.serverTimestamp(),
      userId: userId
    };

    const docRef = await adminDb.collection('knowledge_base').add(docData);

    return new Response(JSON.stringify({ 
      success: true, 
      docId: docRef.id,
      message: 'File berhasil diupload'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};