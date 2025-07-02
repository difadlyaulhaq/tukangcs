// src/pages/api/knowledge-base/text.ts
import type { APIRoute } from 'astro';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { title, content, authToken } = await request.json();

    if (!authToken) {
      return new Response(JSON.stringify({ error: 'Token tidak ditemukan' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    if (!title || !content) {
      return new Response(JSON.stringify({ error: 'Title dan content harus diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Simpan data teks ke Firestore
    const docData = {
      title: title,
      type: 'text',
      content: content,
      characterCount: content.length,
      uploadedAt: FieldValue.serverTimestamp(),
      userId: userId
    };

    const docRef = await adminDb.collection('knowledge_base').add(docData);

    return new Response(JSON.stringify({ 
      success: true, 
      docId: docRef.id,
      message: 'Data teks berhasil disimpan'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Save text error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal menyimpan data teks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};