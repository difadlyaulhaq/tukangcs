// services/whatsapp-service.js
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import pino from 'pino';
import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  delay,
} from '@whiskeysockets/baileys';
import { adminDb } from '../lib/firebase-admin.js';

// Cache untuk menyimpan sessions
const msgRetryCounterCache = new NodeCache();

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.qr = null;
    this.pairingCode = null;
    this.connected = false;
    this.connecting = false;
    this.phoneNumber = null;
    this.logger = pino({ level: 'silent' }); // Silent logger untuk production
    this.sessionId = 'whatsapp-session';
    this.authState = null;
    this.saveCreds = null;
    this.usePairingCode = true; // Default menggunakan pairing code
    this.targetPhoneNumber = null; // Nomor untuk pairing code
  }

  async initialize(phoneNumber = null, usePairingCode = true) {
    try {
      if (this.connected) {
        console.log('WhatsApp already connected');
        return {
          success: true,
          message: 'Already connected',
          status: this.getConnectionStatus()
        };
      }

      if (this.connecting) {
        console.log('WhatsApp connection in progress');
        return {
          success: true,
          message: 'Connection in progress',
          status: this.getConnectionStatus()
        };
      }

      this.connecting = true;
      this.usePairingCode = usePairingCode;
      this.targetPhoneNumber = phoneNumber;
      
      console.log('Initializing WhatsApp connection...');
      console.log('Using pairing code:', this.usePairingCode);
      console.log('Target phone number:', this.targetPhoneNumber);

      // Setup auth state
      const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
      this.authState = state;
      this.saveCreds = saveCreds;

      // Get latest Baileys version
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`Using Baileys v${version.join('.')}, isLatest: ${isLatest}`);

      // Create socket
      this.sock = makeWASocket({
        version,
        logger: this.logger,
        printQRInTerminal: !this.usePairingCode, // Hanya print QR jika tidak pakai pairing code
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, this.logger),
        },
        msgRetryCounterCache,
        generateHighQualityLinkPreview: true,
        shouldIgnoreJid: jid => isJidBroadcast(jid),
        // Konfigurasi tambahan untuk stabilitas
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        retryRequestDelayMs: 250,
        maxMsgRetryCount: 5,
        // Browser info untuk pairing code
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
      });

      this.setupEventHandlers();

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.connecting = false;
          reject(new Error('Connection timeout'));
        }, 60000); // 60 detik timeout

        // Handle initial connection update
        const handleInitialConnection = (update) => {
          const { connection, lastDisconnect, qr } = update;

          if (qr && !this.usePairingCode) {
            this.qr = qr;
            console.log('QR Code generated');
            resolve({
              success: true,
              message: 'QR Code generated',
              qr: qr,
              status: this.getConnectionStatus()
            });
          }

          if (connection === 'open') {
            clearTimeout(timeout);
            this.connected = true;
            this.connecting = false;
            this.qr = null;
            this.pairingCode = null;
            console.log('WhatsApp connected successfully');
            
            // Remove listener after successful connection
            this.sock.ev.off('connection-update', handleInitialConnection);
            
            resolve({
              success: true,
              message: 'Connected successfully',
              status: this.getConnectionStatus()
            });
          }

          if (connection === 'close') {
            clearTimeout(timeout);
            this.connected = false;
            this.connecting = false;
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            
            // Remove listener
            this.sock.ev.off('connection-update', handleInitialConnection);
            
            if (shouldReconnect) {
              console.log('Connection closed, attempting to reconnect...');
              setTimeout(() => this.initialize(this.targetPhoneNumber, this.usePairingCode), 3000);
              resolve({
                success: false,
                message: 'Connection closed, reconnecting...',
                status: this.getConnectionStatus()
              });
            } else {
              console.log('Connection closed, logged out');
              reject(new Error('Logged out from WhatsApp'));
            }
          }
        };

        this.sock.ev.on('connection-update', handleInitialConnection);

        // Generate pairing code jika menggunakan pairing code mode
        if (this.usePairingCode && this.targetPhoneNumber && !state.creds.registered) {
          setTimeout(async () => {
            try {
              // Format nomor telepon
              let formattedNumber = this.targetPhoneNumber.replace(/\D/g, '');
              
              // Add country code if not present (untuk Indonesia)
              if (!formattedNumber.startsWith('62') && formattedNumber.startsWith('0')) {
                formattedNumber = '62' + formattedNumber.substring(1);
              }
              
              console.log('Requesting pairing code for:', formattedNumber);
              const code = await this.sock.requestPairingCode(formattedNumber);
              this.pairingCode = code;
              
              console.log('Pairing code generated:', code);
              
              clearTimeout(timeout);
              resolve({
                success: true,
                message: 'Pairing code generated',
                pairingCode: code,
                phoneNumber: formattedNumber,
                status: this.getConnectionStatus()
              });
            } catch (error) {
              console.error('Failed to generate pairing code:', error);
              clearTimeout(timeout);
              reject(error);
            }
          }, 3000); // Wait 3 seconds for socket to be ready
        }
      });

    } catch (error) {
      this.connecting = false;
      console.error('Failed to initialize WhatsApp:', error);
      throw error;
    }
  }

  setupEventHandlers() {
    if (!this.sock) return;

    // Handle credentials update
    this.sock.ev.on('creds.update', this.saveCreds);

    // Handle connection updates
    this.sock.ev.on('connection-update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr && !this.usePairingCode) {
        this.qr = qr;
        console.log('New QR Code generated');
      }

      if (connection === 'connecting') {
        console.log('Connecting to WhatsApp...');
        this.connecting = true;
      }

      if (connection === 'open') {
        console.log('WhatsApp connection opened');
        this.connected = true;
        this.connecting = false;
        this.qr = null;
        this.pairingCode = null;
        
        // Get phone number info
        try {
          const user = this.sock.user;
          this.phoneNumber = user?.id?.split(':')[0] || user?.id?.split('@')[0];
          console.log('Connected as:', this.phoneNumber);
        } catch (err) {
          console.warn('Could not get phone number:', err);
        }
      }

      if (connection === 'close') {
        this.connected = false;
        this.connecting = false;
        this.qr = null;
        this.pairingCode = null;
        
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Connection closed due to:', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
        
        if (shouldReconnect) {
          // Reconnect after delay
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.initialize(this.targetPhoneNumber, this.usePairingCode).catch(console.error);
          }, 3000);
        }
      }
    });

    // Handle incoming messages
    this.sock.ev.on('messages.upsert', async (m) => {
      try {
        await this.handleIncomingMessages(m);
      } catch (error) {
        console.error('Error handling incoming message:', error);
      }
    });

    // Handle message updates (read receipts, etc.)
    this.sock.ev.on('messages.update', (messageUpdate) => {
      console.log('Message update:', messageUpdate);
    });

    // Handle presence updates
    this.sock.ev.on('presence.update', (presenceUpdate) => {
      console.log('Presence update:', presenceUpdate);
    });
  }

  async handleIncomingMessages(m) {
    const { messages } = m;
    
    for (const message of messages) {
      if (!message.message) continue;
      if (message.key.fromMe) continue; // Skip pesan dari diri sendiri
      
      try {
        const messageData = this.extractMessageData(message);
        await this.saveMessageToDatabase(messageData);
        console.log('Saved incoming message from:', messageData.senderName);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }
  }

  extractMessageData(message) {
    const { key, message: msg, messageTimestamp, pushName } = message;
    
    let messageText = '';
    let messageType = 'text';
    
    // Extract pesan berdasarkan tipe
    if (msg.conversation) {
      messageText = msg.conversation;
    } else if (msg.extendedTextMessage) {
      messageText = msg.extendedTextMessage.text;
    } else if (msg.imageMessage) {
      messageText = msg.imageMessage.caption || '[Image]';
      messageType = 'image';
    } else if (msg.videoMessage) {
      messageText = msg.videoMessage.caption || '[Video]';
      messageType = 'video';
    } else if (msg.audioMessage) {
      messageText = '[Audio]';
      messageType = 'audio';
    } else if (msg.documentMessage) {
      messageText = msg.documentMessage.fileName || '[Document]';
      messageType = 'document';
    } else if (msg.stickerMessage) {
      messageText = '[Sticker]';
      messageType = 'sticker';
    } else {
      messageText = '[Unsupported message type]';
      messageType = 'unknown';
    }

    return {
      platform: 'whatsapp',
      senderId: key.remoteJid,
      senderName: pushName || key.remoteJid.split('@')[0],
      isi: messageText,
      waktu: new Date(messageTimestamp * 1000).toISOString(),
      status: 'diterima',
      messageId: key.id,
      messageType,
      phoneNumber: key.remoteJid.split('@')[0],
      metadata: {
        messageType,
        isGroup: key.remoteJid.includes('@g.us'),
        fromMe: key.fromMe,
        participant: key.participant || null
      }
    };
  }

  async saveMessageToDatabase(messageData) {
    try {
      await adminDb.collection('pesan').add({
        ...messageData,
        userId: 'default-user', // Atau ambil dari context
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  }

  async sendMessage(jid, message) {
    if (!this.connected || !this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      console.log('Sending message to:', jid);
      const result = await this.sock.sendMessage(jid, { text: message });
      console.log('Message sent successfully');
      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async sendImage(jid, imagePath, caption = '') {
    if (!this.connected || !this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      const result = await this.sock.sendMessage(jid, {
        image: { url: imagePath },
        caption: caption
      });
      return result;
    } catch (error) {
      console.error('Failed to send image:', error);
      throw error;
    }
  }

  async sendDocument(jid, documentPath, fileName, caption = '') {
    if (!this.connected || !this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      const result = await this.sock.sendMessage(jid, {
        document: { url: documentPath },
        fileName: fileName,
        caption: caption
      });
      return result;
    } catch (error) {
      console.error('Failed to send document:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      connected: this.connected,
      connecting: this.connecting,
      qr: this.qr,
      pairingCode: this.pairingCode,
      phoneNumber: this.phoneNumber,
      targetPhoneNumber: this.targetPhoneNumber,
      usePairingCode: this.usePairingCode,
      timestamp: new Date().toISOString()
    };
  }

  async disconnect() {
    try {
      if (this.sock) {
        await this.sock.logout();
        this.sock.end();
        this.sock = null;
      }
      
      this.connected = false;
      this.connecting = false;
      this.qr = null;
      this.pairingCode = null;
      this.phoneNumber = null;
      this.targetPhoneNumber = null;
      
      console.log('WhatsApp disconnected successfully');
      return true;
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      throw error;
    }
  }

  async markAsRead(jid, messageId) {
    if (!this.connected || !this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      await this.sock.readMessages([{
        remoteJid: jid,
        id: messageId,
        participant: undefined
      }]);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  }

  async getProfilePicture(jid) {
    if (!this.connected || !this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      const profilePicUrl = await this.sock.profilePictureUrl(jid, 'image');
      return profilePicUrl;
    } catch (error) {
      console.error('Failed to get profile picture:', error);
      return null;
    }
  }

  // Utility function untuk validasi JID
  isValidJid(jid) {
    return jid && (jid.includes('@s.whatsapp.net') || jid.includes('@g.us'));
  }

  // Format nomor telepon ke JID WhatsApp
  formatPhoneToJid(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Untuk nomor Indonesia
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return cleaned + '@s.whatsapp.net';
  }

  // Utility untuk check apakah nomor terdaftar di WhatsApp
  async checkWhatsAppNumber(phoneNumber) {
    if (!this.connected || !this.sock) {
      throw new Error('WhatsApp not connected');
    }

    try {
      const jid = this.formatPhoneToJid(phoneNumber);
      const [result] = await this.sock.onWhatsApp(jid);
      return result?.exists || false;
    } catch (error) {
      console.error('Failed to check WhatsApp number:', error);
      return false;
    }
  }

  // Method untuk generate pairing code secara manual
  async generatePairingCode(phoneNumber) {
    if (!this.sock) {
      throw new Error('Socket not initialized');
    }

    try {
      let formattedNumber = phoneNumber.replace(/\D/g, '');
      
      // Add country code if not present (untuk Indonesia)
      if (!formattedNumber.startsWith('62') && formattedNumber.startsWith('0')) {
        formattedNumber = '62' + formattedNumber.substring(1);
      }
      
      console.log('Generating pairing code for:', formattedNumber);
      const code = await this.sock.requestPairingCode(formattedNumber);
      this.pairingCode = code;
      this.targetPhoneNumber = formattedNumber;
      
      return {
        success: true,
        pairingCode: code,
        phoneNumber: formattedNumber
      };
    } catch (error) {
      console.error('Failed to generate pairing code:', error);
      throw error;
    }
  }
}

// Utility function untuk check broadcast JID
function isJidBroadcast(jid) {
  return jid === 'status@broadcast';
}

export default WhatsAppService;