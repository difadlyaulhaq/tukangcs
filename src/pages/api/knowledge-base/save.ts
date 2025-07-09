// src/pages/api/knowledge-base/save.ts
import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { title, content, userId, email, nama_umkm } = await request.json();

    // Validasi input utama (title dan content tetap wajib)
    if (!title || !content) {
      return new Response(JSON.stringify({ 
        error: 'Title dan content harus diisi' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const titleTrimmed = title.trim();
    const contentTrimmed = content.trim();

    // Validasi panjang karakter
    if (titleTrimmed.length < 3) {
      return new Response(JSON.stringify({ error: 'Title minimal 3 karakter' }), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }
    if (contentTrimmed.length < 200) {
      return new Response(JSON.stringify({ error: 'Content minimal 200 karakter' }), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }
    if (titleTrimmed.length > 200) {
      return new Response(JSON.stringify({ error: 'Title maksimal 200 karakter' }), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }
    if (contentTrimmed.length > 10000) {
      return new Response(JSON.stringify({ error: 'Content maksimal 10.000 karakter' }), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }

    // Cek duplikasi judul HANYA jika userId disediakan
    if (userId) {
      const duplicateQuery = await adminDb.collection('knowledge')
        .where('userId', '==', userId)
        .where('title', '==', titleTrimmed)
        .get();

      if (!duplicateQuery.empty) {
        return new Response(JSON.stringify({ 
          error: 'Knowledge dengan title yang sama sudah ada untuk Anda' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Siapkan data untuk disimpan ke Firestore
    const knowledgeData = {
      title: titleTrimmed,
      content: contentTrimmed,
      userId: userId || null, // Simpan null jika tidak ada userId
      email: email || null, // Simpan null jika tidak ada email
      nama_umkm: nama_umkm || null, // Simpan null jika tidak ada nama_umkm
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const docRef = await adminDb.collection('knowledge').add(knowledgeData);

    const responseData = {
      id: docRef.id,
      ...knowledgeData,
      createdAt: new Date().toISOString(), // Kirim timestamp kembali sebagai string
      updatedAt: new Date().toISOString()
    };
    
    delete (responseData as any).userId; // Hapus userId dari data respons jika perlu

    return new Response(JSON.stringify({ 
      success: true, 
      id: docRef.id,
      message: 'Knowledge berhasil disimpan',
      data: responseData
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Save knowledge error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal menyimpan knowledge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};