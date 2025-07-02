// src/scripts/knowledgeBase.js
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

class KnowledgeBaseClient {
  constructor() {
    this.currentUser = null;
    this.documents = [];
    this.isLoading = false;
    
    // Initialize auth state listener
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.loadDocuments();
      }
    });

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // File upload
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.querySelector('.upload-area');
    
    if (fileInput && uploadArea) {
      uploadArea.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
      
      // Drag and drop
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
      });
      
      uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
      });
      
      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        this.uploadFiles(files);
      });
    }

    // Text data save
    const saveTextBtn = document.querySelector('.btn[onclick*="save"]') || 
                       document.querySelector('button:has(i.fa-save)');
    if (saveTextBtn) {
      saveTextBtn.addEventListener('click', () => this.handleTextSave());
    }
  }

  async handleFileUpload(event) {
    const files = Array.from(event.target.files);
    await this.uploadFiles(files);
  }

  async uploadFiles(files) {
    if (!this.currentUser) {
      this.showNotification('Silakan login terlebih dahulu', 'error');
      return;
    }

    for (const file of files) {
      await this.uploadSingleFile(file);
    }
    
    // Clear file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  }

  async uploadSingleFile(file) {
    try {
      // Show upload progress
      this.showUploadProgress(file.name, 0);

      // Get auth token
      const token = await this.currentUser.getIdToken();

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('authToken', token);

      // Upload file
      const response = await fetch('/api/knowledge-base/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification(`${file.name} berhasil diupload`, 'success');
        this.updateUploadProgress(file.name, 100);
        await this.loadDocuments(); // Refresh list
      } else {
        throw new Error(result.error || 'Upload gagal');
      }

    } catch (error) {
      console.error('Upload error:', error);
      this.showNotification(`Gagal upload ${file.name}: ${error.message}`, 'error');
      this.updateUploadProgress(file.name, 0, 'error');
    }
  }

  async handleTextSave() {
    if (!this.currentUser) {
      this.showNotification('Silakan login terlebih dahulu', 'error');
      return;
    }

    const textarea = document.querySelector('.form-textarea');
    const titleInput = document.querySelector('input[placeholder*="judul"]') || 
                      document.createElement('input');
    
    const content = textarea?.value?.trim();
    const title = titleInput.value?.trim() || 'Data Teks Baru';

    if (!content) {
      this.showNotification('Silakan masukkan data teks', 'error');
      return;
    }

    try {
      this.setLoading(true);

      const token = await this.currentUser.getIdToken();

      const response = await fetch('/api/knowledge-base/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          content: content,
          authToken: token
        })
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification('Data teks berhasil disimpan', 'success');
        if (textarea) textarea.value = '';
        if (titleInput.value) titleInput.value = '';
        await this.loadDocuments(); // Refresh list
      } else {
        throw new Error(result.error || 'Gagal menyimpan data teks');
      }

    } catch (error) {
      console.error('Save text error:', error);
      this.showNotification(`Gagal menyimpan: ${error.message}`, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async loadDocuments() {
    if (!this.currentUser) return;

    try {
      this.setLoading(true);

      const token = await this.currentUser.getIdToken();
      const response = await fetch(`/api/knowledge-base/list?authToken=${encodeURIComponent(token)}`);
      
      const result = await response.json();

      if (result.success) {
        this.documents = result.documents;
        this.renderDocuments();
      } else {
        throw new Error(result.error || 'Gagal memuat dokumen');
      }

    } catch (error) {
      console.error('Load documents error:', error);
      this.showNotification(`Gagal memuat dokumen: ${error.message}`, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async deleteDocument(docId, title) {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${title}"?`)) {
      return;
    }

    try {
      this.setLoading(true);

      const token = await this.currentUser.getIdToken();

      const response = await fetch('/api/knowledge-base/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          docId: docId,
          authToken: token
        })
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification('Dokumen berhasil dihapus', 'success');
        await this.loadDocuments(); // Refresh list
      } else {
        throw new Error(result.error || 'Gagal menghapus dokumen');
      }

    } catch (error) {
      console.error('Delete document error:', error);
      this.showNotification(`Gagal menghapus: ${error.message}`, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  renderDocuments() {
    const container = document.querySelector('#knowledge-base .card');
    if (!container) return;

    // Remove existing document items
    const existingItems = container.querySelectorAll('.document-item');
    existingItems.forEach(item => item.remove());

    // Add documents section header if not exists
    let documentsHeader = container.querySelector('h3');
    if (!documentsHeader) {
      documentsHeader = document.createElement('h3');
      documentsHeader.innerHTML = '<i class="fas fa-file-alt"></i> Dokumen Tersimpan';
      documentsHeader.style.margin = '2rem 0 1rem 0';
      container.appendChild(documentsHeader);
    }

    // Render documents
    this.documents.forEach(doc => {
      const docElement = this.createDocumentElement(doc);
      container.appendChild(docElement);
    });

    // Show empty state if no documents
    if (this.documents.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <p style="text-align: center; color: #666; margin: 2rem 0;">
          <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          Belum ada dokumen yang diupload
        </p>
      `;
      container.appendChild(emptyState);
    }
  }

  createDocumentElement(doc) {
    const docItem = document.createElement('div');
    docItem.className = 'document-item';
    
    const isFile = doc.type === 'file';
    const icon = isFile ? this.getFileIcon(doc.mimeType) : 'fas fa-file-alt';
    const size = isFile ? this.formatFileSize(doc.fileSize) : `${doc.characterCount} karakter`;
    const date = this.formatDate(doc.uploadedAt);

    docItem.innerHTML = `
      <div class="document-info">
        <span class="document-icon"><i class="${icon}"></i></span>
        <div>
          <h4>${doc.title}</h4>
          <small>${isFile ? `Diupload ${date} • ${size}` : `Data teks • ${size}`}</small>
        </div>
      </div>
      <button class="btn btn-danger" onclick="knowledgeBase.deleteDocument('${doc.id}', '${doc.title}')">
        <i class="fas fa-trash"></i> Hapus
      </button>
    `;

    return docItem;
  }

  getFileIcon(mimeType) {
    switch (mimeType) {
      case 'application/pdf':
        return 'fas fa-file-pdf';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'fas fa-file-word';
      case 'text/plain':
        return 'fas fa-file-alt';
      default:
        return 'fas fa-file';
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(timestamp) {
    let date;
    if (timestamp && timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp && timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  showUploadProgress(fileName, progress) {
    // Create or update progress indicator
    let progressContainer = document.querySelector('.upload-progress');
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.className = 'upload-progress';
      progressContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        min-width: 300px;
      `;
      document.body.appendChild(progressContainer);
    }

    progressContainer.innerHTML = `
      <div style="margin-bottom: 0.5rem;">
        <strong>Upload Progress</strong>
      </div>
      <div style="margin-bottom: 0.5rem;">${fileName}</div>
      <div style="background: #f0f0f0; border-radius: 4px; overflow: hidden;">
        <div style="background: #007bff; height: 8px; width: ${progress}%; transition: width 0.3s;"></div>
      </div>
      <div style="text-align: right; font-size: 0.8rem; margin-top: 0.25rem;">${progress}%</div>
    `;

    if (progress >= 100) {
      setTimeout(() => {
        if (progressContainer.parentNode) {
          progressContainer.parentNode.removeChild(progressContainer);
        }
      }, 2000);
    }
  }

  updateUploadProgress(fileName, progress, status = 'uploading') {
    const progressContainer = document.querySelector('.upload-progress');
    if (!progressContainer) return;

    let color = '#007bff';
    if (status === 'error') color = '#dc3545';
    if (status === 'completed') color = '#28a745';

    const progressBar = progressContainer.querySelector('div[style*="background: #007bff"]') ||
                       progressContainer.querySelector('div[style*="background: #dc3545"]') ||
                       progressContainer.querySelector('div[style*="background: #28a745"]');
    
    if (progressBar) {
      progressBar.style.background = color;
      progressBar.style.width = `${progress}%`;
    }

    const percentText = progressContainer.querySelector('div[style*="text-align: right"]');
    if (percentText) {
      percentText.textContent = status === 'error' ? 'Error' : `${progress}%`;
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#007bff'
    };

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 1001;
      max-width: 400px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span>${message}</span>
        <button style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; margin-left: 1rem;" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add animation styles
    if (!document.querySelector('#notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }

  setLoading(loading) {
    this.isLoading = loading;
    
    // Update UI to show loading state
    const buttons = document.querySelectorAll('#knowledge-base button');
    buttons.forEach(btn => {
      btn.disabled = loading;
      if (loading) {
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    });

    // Show/hide loading indicator
    let loadingIndicator = document.querySelector('.knowledge-base-loading');
    if (loading && !loadingIndicator) {
      loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'knowledge-base-loading';
      loadingIndicator.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255,255,255,0.9);
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        z-index: 100;
      `;
      loadingIndicator.innerHTML = `
        <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
        <div>Memproses...</div>
      `;
      
      const knowledgeBaseCard = document.querySelector('#knowledge-base .card');
      if (knowledgeBaseCard) {
        knowledgeBaseCard.style.position = 'relative';
        knowledgeBaseCard.appendChild(loadingIndicator);
      }
    } else if (!loading && loadingIndicator) {
      loadingIndicator.remove();
    }
  }

  // Utility method to add title input if not exists
  addTitleInput() {
    const textarea = document.querySelector('.form-textarea');
    if (!textarea) return;

    let titleInput = textarea.parentElement.querySelector('input[placeholder*="judul"]');
    if (!titleInput) {
      titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.className = 'form-input';
      titleInput.placeholder = 'Masukkan judul untuk data teks...';
      titleInput.style.marginBottom = '0.5rem';
      
      textarea.parentElement.insertBefore(titleInput, textarea);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.knowledgeBase = new KnowledgeBaseClient();
  
  // Add title input for text data
  window.knowledgeBase.addTitleInput();
});

// CSS Styles for better UI
const additionalStyles = `
<style>
.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #007bff;
  background: #f0f8ff;
}

.upload-area.drag-over {
  border-color: #007bff;
  background: #e3f2fd;
  transform: scale(1.02);
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: white;
  transition: all 0.2s ease;
}

.document-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

.document-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.document-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.2rem;
}

.document-icon .fa-file-pdf { color: #dc3545; }
.document-icon .fa-file-word { color: #007bff; }
.document-icon .fa-file-alt { color: #28a745; }

.document-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.document-info small {
  color: #666;
  font-size: 0.875rem;
}

.btn-danger {
  background: #dc3545 !important;
  border-color: #dc3545 !important;
}

.btn-danger:hover {
  background: #c82333 !important;
  border-color: #bd2130 !important;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);