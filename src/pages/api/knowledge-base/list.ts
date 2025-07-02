// src/pages/api/knowledge-base/list.ts
import type { APIRoute } from 'astro';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const authToken = url.searchParams.get('authToken');

    if (!authToken) {
      return new Response(JSON.stringify({ error: 'Token tidak ditemukan' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // Get documents from Firestore
    const snapshot = await adminDb
      .collection('knowledge_base')
      .where('userId', '==', userId)
      .orderBy('uploadedAt', 'desc')
      .get();

    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return new Response(JSON.stringify({ 
      success: true, 
      documents: documents
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('List documents error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal mengambil dokumen',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};