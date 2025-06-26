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
        phoneNumber: null
      };
    }
    return this.service.getConnectionStatus();
  }

  async connect() {
    const service = this.getInstance();
    return await service.initialize();
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
}

// Singleton instance
const whatsappManager = new WhatsAppManager();

export default whatsappManager;