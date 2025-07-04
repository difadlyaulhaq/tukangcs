// src/pages/api/knowledge-base/text.ts
import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return new Response(JSON.stringify({ error: 'Title dan content harus diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (content.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Content minimal 10 karakter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Simpan data teks ke Firestore
    const docData = {
      title: title.trim(),
      type: 'text',
      content: content.trim(),
      characterCount: content.trim().length,
      wordCount: content.trim().split(/\s+/).length,
      uploadedAt: FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('knowledge_base').add(docData);

    return new Response(JSON.stringify({ 
      success: true, 
      docId: docRef.id,
      characterCount: docData.characterCount,
      wordCount: docData.wordCount,
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