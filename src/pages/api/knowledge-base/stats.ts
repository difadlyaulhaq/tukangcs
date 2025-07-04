// src/pages/api/knowledge-base/stats.ts - Fixed TypeScript version
import type { APIRoute } from 'astro';
import { adminDb } from '../../../lib/firebase-admin';

interface FileTypeMap {
  [key: string]: number;
  'application/pdf': number;
  'application/msword': number;
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': number;
  'text/plain': number;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    // Get all documents
    const snapshot = await adminDb.collection('knowledge_base').get();
    
    let totalDocuments = 0;
    let totalFiles = 0;
    let totalTexts = 0;
    let totalFileSize = 0;
    let totalCharacters = 0;
    let totalWords = 0;
    
    const fileTypes: FileTypeMap = {
      'application/pdf': 0,
      'application/msword': 0,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 0,
      'text/plain': 0
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      totalDocuments++;
      
      if (data.type === 'file') {
        totalFiles++;
        totalFileSize += data.fileSize || 0;
        
        if (data.mimeType && data.mimeType in fileTypes) {
          fileTypes[data.mimeType as keyof FileTypeMap]++;
        }
      } else if (data.type === 'text') {
        totalTexts++;
        totalCharacters += data.characterCount || 0;
        totalWords += data.wordCount || 0;
      }
    });

    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSnapshot = await adminDb
      .collection('knowledge_base')
      .where('uploadedAt', '>=', sevenDaysAgo)
      .get();

    const stats = {
      overview: {
        totalDocuments,
        totalFiles,
        totalTexts,
        totalFileSize: formatFileSize(totalFileSize),
        totalCharacters,
        totalWords,
        recentUploads: recentSnapshot.size
      },
      fileTypes: {
        pdf: fileTypes['application/pdf'],
        word: fileTypes['application/msword'] + fileTypes['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        text: fileTypes['text/plain']
      },
      storage: {
        totalSizeBytes: totalFileSize,
        totalSizeFormatted: formatFileSize(totalFileSize),
        averageFileSize: totalFiles > 0 ? formatFileSize(totalFileSize / totalFiles) : '0 B'
      }
    };

    return new Response(JSON.stringify({ 
      success: true, 
      stats: stats
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal mengambil statistik',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Knowledge Base Frontend Script with TypeScript fixes
interface Document {
  id: string;
  title: string;
  type: 'file' | 'text';
  fileUrl?: string;
  fileName?: string;
  originalName?: string;
  fileSize?: number;
  mimeType?: string;
  content?: string;
  characterCount?: number;
  wordCount?: number;
  uploadedAt: any;
  createdAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  documents?: T[];
  message?: string;
  docId?: string;
  characterCount?: number;
  wordCount?: number;
  fileName?: string;
  fileUrl?: string;
  details?: string;
}

type NotificationType = 'success' | 'error' | 'warning' | 'info';

declare global {
  interface Window {
    deleteDocument: (docId: string, title: string) => Promise<void>;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements with proper type assertions
  const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
  const textArea = document.querySelector('.form-textarea') as HTMLTextAreaElement | null;
  const saveTextBtn = textArea?.nextElementSibling as HTMLButtonElement | null;
  const documentsContainer = document.querySelector('#knowledge-base .document-item')?.parentNode as HTMLElement | null;
  
  // Remove existing document items (they're just examples)
  const existingItems = document.querySelectorAll('.document-item');
  existingItems.forEach(item => item.remove());

  // Initialize
  loadDocuments();

  // File Upload Handler
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }

  // Save Text Handler
  if (saveTextBtn) {
    saveTextBtn.addEventListener('click', handleSaveText);
  }

  // Handle File Upload
  async function handleFileUpload(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    for (let file of files) {
      await uploadFile(file);
    }
    
    // Clear input
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Reload documents
    loadDocuments();
  }

  // Upload File Function
  async function uploadFile(file: File): Promise<void> {
    try {
      showNotification('Mengupload file...', 'info');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const response = await fetch('/api/knowledge-base/upload', {
        method: 'POST',
        body: formData
      });

      const result: ApiResponse<never> = await response.json();

      if (result.success) {
        showNotification(`File ${file.name} berhasil diupload`, 'success');
      } else {
        throw new Error(result.error || 'Gagal upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showNotification(`Gagal upload ${file.name}: ${errorMessage}`, 'error');
    }
  }

  // Handle Save Text
  async function handleSaveText(): Promise<void> {
    const content = textArea?.value?.trim();
    
    if (!content) {
      showNotification('Masukkan data teks terlebih dahulu', 'warning');
      return;
    }

    if (content.length < 10) {
      showNotification('Data teks minimal 10 karakter', 'warning');
      return;
    }

    try {
      showNotification('Menyimpan data teks...', 'info');
      
      // Generate title from first line or first 50 characters
      const title = content.split('\n')[0].substring(0, 50) + (content.length > 50 ? '...' : '');

      const response = await fetch('/api/knowledge-base/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          content: content
        })
      });

      const result: ApiResponse<never> = await response.json();

      if (result.success) {
        if (textArea) {
          textArea.value = '';
        }
        showNotification('Data teks berhasil disimpan', 'success');
        loadDocuments();
      } else {
        throw new Error(result.error || 'Gagal menyimpan data teks');
      }
    } catch (error) {
      console.error('Save text error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showNotification(`Gagal menyimpan: ${errorMessage}`, 'error');
    }
  }

  // Load Documents
  async function loadDocuments(): Promise<void> {
    try {
      const response = await fetch('/api/knowledge-base/list');
      const result: ApiResponse<Document> = await response.json();

      if (result.success && result.documents) {
        displayDocuments(result.documents);
      } else {
        throw new Error(result.error || 'Gagal memuat dokumen');
      }
    } catch (error) {
      console.error('Load documents error:', error);
      showNotification('Gagal memuat dokumen', 'error');
    }
  }

  // Display Documents
  function displayDocuments(documents: Document[]): void {
    if (!documentsContainer) return;

    // Clear existing documents
    const existingItems = document.querySelectorAll('.document-item');
    existingItems.forEach(item => item.remove());

    if (documents.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #666;">
          <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>Belum ada dokumen tersimpan</p>
          <small>Upload file atau tambah data teks untuk memulai</small>
        </div>
      `;
      documentsContainer.appendChild(emptyState);
      return;
    }

    documents.forEach(doc => {
      const docItem = createDocumentItem(doc);
      documentsContainer.appendChild(docItem);
    });
  }

  // Create Document Item
  function createDocumentItem(doc: Document): HTMLElement {
    const docItem = document.createElement('div');
    docItem.className = 'document-item';
    docItem.setAttribute('data-doc-id', doc.id);

    const icon = getDocumentIcon(doc);
    const info = getDocumentInfo(doc);

    docItem.innerHTML = `
      <div class="document-info">
        <span class="document-icon">${icon}</span>
        <div>
          <h4>${doc.title}</h4>
          <small>${info}</small>
        </div>
      </div>
      <button class="btn btn-danger" onclick="deleteDocument('${doc.id}', '${doc.title}')">
        <i class="fas fa-trash"></i> Hapus
      </button>
    `;

    return docItem;
  }

  // Get Document Icon
  function getDocumentIcon(doc: Document): string {
    if (doc.type === 'text') {
      return '<i class="fas fa-file-alt"></i>';
    }
    
    switch (doc.mimeType) {
      case 'application/pdf':
        return '<i class="fas fa-file-pdf"></i>';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '<i class="fas fa-file-word"></i>';
      case 'text/plain':
        return '<i class="fas fa-file-alt"></i>';
      default:
        return '<i class="fas fa-file"></i>';
    }
  }

  // Get Document Info
  function getDocumentInfo(doc: Document): string {
    if (doc.type === 'text') {
      return `Data teks • ${doc.characterCount || 0} karakter`;
    }
    
    const fileSize = formatFileSize(doc.fileSize || 0);
    const uploadDate = formatDate(doc.createdAt || doc.uploadedAt);
    return `Diupload ${uploadDate} • ${fileSize}`;
  }

  // Format File Size
  function formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Format Date
  function formatDate(dateInput: any): string {
    let date: Date;
    if (dateInput && dateInput.seconds) {
      // Firestore timestamp
      date = new Date(dateInput.seconds * 1000);
    } else if (dateInput) {
      date = new Date(dateInput);
    } else {
      return 'Tidak diketahui';
    }
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Delete Document (global function)
  window.deleteDocument = async function(docId: string, title: string): Promise<void> {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${title}"?`)) {
      return;
    }

    try {
      showNotification('Menghapus dokumen...', 'info');
      
      const response = await fetch('/api/knowledge-base/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ docId })
      });

      const result: ApiResponse<never> = await response.json();

      if (result.success) {
        showNotification('Dokumen berhasil dihapus', 'success');
        
        // Remove from DOM
        const docItem = document.querySelector(`[data-doc-id="${docId}"]`);
        if (docItem) {
          docItem.remove();
        }
        
        // Reload if no items left
        const remainingItems = document.querySelectorAll('.document-item');
        if (remainingItems.length === 0) {
          loadDocuments();
        }
      } else {
        throw new Error(result.error || 'Gagal menghapus dokumen');
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showNotification(`Gagal menghapus: ${errorMessage}`, 'error');
    }
  };

  // Show Notification Function
  function showNotification(message: string, type: NotificationType = 'info'): void {
    const notification = document.getElementById('notification');
    if (notification) {
      const iconMap: Record<NotificationType, string> = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
      };

      notification.innerHTML = `
        <i class="fas ${iconMap[type]}"></i>
        <span>${message}</span>
      `;
      notification.style.display = 'flex';
      notification.classList.add('show');
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          notification.style.display = 'none';
        }, 300);
      }, 5000);
    }
  }
});