// src/pages/api/knowledge-base/update.ts
import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const PUT: APIRoute = async ({ request }) => {
  try {
    const { id, title, content, userId } = await request.json();

    // Validasi input
    if (!id || !title || !content || !userId) {
      return new Response(JSON.stringify({ 
        error: 'ID, title, content, dan userId harus diisi' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const titleTrimmed = title.trim();
    const contentTrimmed = content.trim();

    if (titleTrimmed.length < 3) {
      return new Response(JSON.stringify({ 
        error: 'Title minimal 3 karakter' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (contentTrimmed.length < 200) {
      return new Response(JSON.stringify({ 
        error: 'Content minimal 200 karakter' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (titleTrimmed.length > 200) {
      return new Response(JSON.stringify({ 
        error: 'Title maksimal 200 karakter' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (contentTrimmed.length > 10000) {
      return new Response(JSON.stringify({ 
        error: 'Content maksimal 10.000 karakter' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get document data
    const docRef = adminDb.collection('knowledge').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return new Response(JSON.stringify({ 
        error: 'Knowledge tidak ditemukan' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const docData = doc.data();

    // Check if user is owner
    if (docData?.userId !== userId) {
      return new Response(JSON.stringify({ 
        error: 'Anda tidak memiliki akses untuk mengubah knowledge ini' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for duplicate title for same user (excluding current document)
    const duplicateQuery = await adminDb.collection('knowledge')
      .where('userId', '==', userId)
      .where('title', '==', titleTrimmed)
      .get();

    const duplicateExists = duplicateQuery.docs.some(doc => doc.id !== id);

    if (duplicateExists) {
      return new Response(JSON.stringify({ 
        error: 'Knowledge dengan title yang sama sudah ada' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update document
    const updateData = {
      title: titleTrimmed,
      content: contentTrimmed,
      updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.update(updateData);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Knowledge berhasil diperbarui',
      data: {
        id: id,
        title: updateData.title,
        content: updateData.content,
        userId: userId
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update knowledge error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal memperbarui knowledge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};