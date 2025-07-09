// src/pages/api/knowledge-base/list.ts
import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const userId = url.searchParams.get('userId');
    const search = url.searchParams.get('search') || '';
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'User ID harus disediakan' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let query = adminDb.collection('knowledge')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    // Apply search filter if provided
    const snapshot = await query.get();
    
    let filteredDocs = snapshot.docs;
    
    // Client-side search filtering (since Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDocs = filteredDocs.filter(doc => {
        const data = doc.data();
        const title = (data.title || '').toLowerCase();
        const content = (data.content || '').toLowerCase();
        return title.includes(searchLower) || content.includes(searchLower);
      });
    }

    // Apply pagination
    const totalDocuments = filteredDocs.length;
    const totalPages = Math.ceil(totalDocuments / limit);
    const offset = (page - 1) * limit;
    const paginatedDocs = filteredDocs.slice(offset, offset + limit);

    const knowledgeData = paginatedDocs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled',
        content: data.content || '',
        userId: data.userId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: knowledgeData,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalDocuments: totalDocuments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('List knowledge error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal mengambil data knowledge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
