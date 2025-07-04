// src/pages/api/knowledge-base/[id].ts
import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ params }) => {
  try {
    const docId = params.id;

    if (!docId) {
      return new Response(JSON.stringify({ error: 'Document ID tidak ditemukan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get document from Firestore
    const docRef = adminDb.collection('knowledge_base').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return new Response(JSON.stringify({ error: 'Dokumen tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = doc.data();
    const document = {
      id: doc.id,
      title: data?.title,
      type: data?.type,
      fileUrl: data?.fileUrl || null,
      fileName: data?.fileName || null,
      originalName: data?.originalName || null,
      fileSize: data?.fileSize || null,
      mimeType: data?.mimeType || null,
      content: data?.type === 'text' ? data?.content : null,
      characterCount: data?.characterCount || null,
      wordCount: data?.wordCount || null,
      uploadedAt: data?.uploadedAt,
      createdAt: data?.createdAt
    };

    return new Response(JSON.stringify({ 
      success: true, 
      document: document
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get document error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal mengambil dokumen',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};