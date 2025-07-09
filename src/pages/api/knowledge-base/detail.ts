// src/pages/api/knowledge-base/detail.ts
import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const id = url.searchParams.get('id');
    const userId = url.searchParams.get('userId');

    if (!id || !userId) {
      return new Response(JSON.stringify({ 
        error: 'ID dan userId harus disediakan' 
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
        error: 'Anda tidak memiliki akses untuk melihat knowledge ini' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      data: {
        id: doc.id,
        title: docData.title || 'Untitled',
        content: docData.content || '',
        userId: docData.userId,
        createdAt: docData.createdAt,
        updatedAt: docData.updatedAt
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get knowledge detail error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal mengambil detail knowledge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};