// src/pages/api/knowledge-base/list.ts
import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type'); // 'file' or 'text'
    
    let query = adminDb.collection('knowledge_base').orderBy('uploadedAt', 'desc');
    
    // Filter by type if specified
    if (type && (type === 'file' || type === 'text')) {
      query = query.where('type', '==', type);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const snapshot = await query.limit(limit).offset(offset).get();

    // Get total count for pagination
    const totalSnapshot = await (type ? 
      adminDb.collection('knowledge_base').where('type', '==', type).get() :
      adminDb.collection('knowledge_base').get()
    );
    const totalDocuments = totalSnapshot.size;

    const documents = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        type: data.type,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        originalName: data.originalName || null,
        fileSize: data.fileSize || null,
        mimeType: data.mimeType || null,
        content: data.type === 'text' ? data.content : null,
        characterCount: data.characterCount || null,
        wordCount: data.wordCount || null,
        uploadedAt: data.uploadedAt,
        createdAt: data.createdAt
      };
    });

    const totalPages = Math.ceil(totalDocuments / limit);

    return new Response(JSON.stringify({ 
      success: true, 
      documents: documents,
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