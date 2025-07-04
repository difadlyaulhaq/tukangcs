// src/pages/api/knowledge-base/delete.ts
import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';
import { getStorage } from 'firebase-admin/storage';

const storage = getStorage();

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { docId } = await request.json();

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

    // If it's a file, delete from Storage
    if (docData?.type === 'file' && docData?.fileName) {
      const bucket = storage.bucket();
      const fileRef = bucket.file(`knowledge-base/${docData.fileName}`);
      
      try {
        await fileRef.delete();
        console.log(`File ${docData.fileName} deleted from storage`);
      } catch (error) {
        console.warn('File deletion warning:', error);
        // Continue even if file deletion fails (file might not exist)
      }
    }

    // Delete from Firestore
    await docRef.delete();

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Dokumen berhasil dihapus',
      deletedDocId: docId,
      deletedTitle: docData?.title || 'Unknown'
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