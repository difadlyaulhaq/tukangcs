// src/pages/api/knowledge-base/delete.ts
import type { APIRoute } from 'astro';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';
import { getStorage } from 'firebase-admin/storage';

const storage = getStorage();

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { docId, authToken } = await request.json();

    if (!authToken) {
      return new Response(JSON.stringify({ error: 'Token tidak ditemukan' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    if (!docId) {
      return new Response(JSON.stringify({ error: 'Document ID harus disediakan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get document data
    const docRef = adminDb.collection('knowledge_base').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return new Response(JSON.stringify({ error: 'Dokumen tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const docData = doc.data();

    // Check if user owns the document
    if (docData?.userId !== userId) {
      return new Response(JSON.stringify({ error: 'Tidak memiliki akses ke dokumen ini' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If it's a file, delete from Storage
    if (docData?.type === 'file' && docData?.fileName) {
      const bucket = storage.bucket();
      const fileRef = bucket.file(`knowledge-base/${userId}/${docData.fileName}`);
      
      try {
        await fileRef.delete();
      } catch (error) {
        console.warn('File deletion warning:', error);
        // Continue even if file deletion fails
      }
    }

    // Delete from Firestore
    await docRef.delete();

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Dokumen berhasil dihapus'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Delete document error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal menghapus dokumen',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};