// lib/whatsapp-manager.js
import WhatsAppService from '../services/whatsapp-service.js';

class WhatsAppManager {
  constructor() {
    this.service = null;
  }

  getInstance() {
    if (!this.service) {
      this.service = new WhatsAppService();
    }
    return this.service;
  }

  getConnectionStatus() {
    if (!this.service) {
      return {
        connected: false,
        connecting: false,
        qr: null,
        pairingCode: null,
        phoneNumber: null,
        targetPhoneNumber: null,
        usePairingCode: false
      };
    }
    return this.service.getConnectionStatus();
  }

  async connect(phoneNumber = null, usePairingCode = true) {
    const service = this.getInstance();
    return await service.initialize(phoneNumber, usePairingCode);
  }

  async disconnect() {
    if (this.service) {
      await this.service.disconnect();
      this.service = null;
    }
  }

  async sendMessage(jid, message) {
    if (!this.service || !this.service.getConnectionStatus().connected) {
      throw new Error('WhatsApp not connected');
    }
    return await this.service.sendMessage(jid, message);
  }

  async generatePairingCode(phoneNumber) {
    const service = this.getInstance();
    
    // Jika belum ada socket, initialize dulu
    if (!service.sock) {
      await service.initialize(phoneNumber, true);
    }
    
    return await service.generatePairingCode(phoneNumber);
  }

  async sendImage(jid, imagePath, caption = '') {
    if (!this.service || !this.service.getConnectionStatus().connected) {
      throw new Error('WhatsApp not connected');
    }
    return await this.service.sendImage(jid, imagePath, caption);
  }

  async sendDocument(jid, documentPath, fileName, caption = '') {
    if (!this.service || !this.service.getConnectionStatus().connected) {
      throw new Error('WhatsApp not connected');
    }
    return await this.service.sendDocument(jid, documentPath, fileName, caption);
  }

  async markAsRead(jid, messageId) {
    if (!this.service || !this.service.getConnectionStatus().connected) {
      throw new Error('WhatsApp not connected');
    }
    return await this.service.markAsRead(jid, messageId);
  }

  async getProfilePicture(jid) {
    if (!this.service || !this.service.getConnectionStatus().connected) {
      throw new Error('WhatsApp not connected');
    }
    return await this.service.getProfilePicture(jid);
  }

  async checkWhatsAppNumber(phoneNumber) {
    if (!this.service || !this.service.getConnectionStatus().connected) {
      throw new Error('WhatsApp not connected');
    }
    return await this.service.checkWhatsAppNumber(phoneNumber);
  }

  formatPhoneToJid(phoneNumber) {
    const service = this.getInstance();
    return service.formatPhoneToJid(phoneNumber);
  }

  isValidJid(jid) {
    const service = this.getInstance();
    return service.isValidJid(jid);
  }
}

// Singleton instance
const whatsappManager = new WhatsAppManager();

export default whatsappManager;