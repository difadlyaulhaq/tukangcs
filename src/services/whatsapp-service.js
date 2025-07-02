// services/whatsapp-service.js - IMPROVED VERSION
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
import fs from 'fs';
import path from 'path';

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
    this.logger = pino({ level: 'silent' });
    this.sessionId = 'whatsapp-session';
    this.authState = null;
    this.saveCreds = null;
    this.usePairingCode = true;
    this.targetPhoneNumber = null;
    this.connectionPromise = null; // Track ongoing connection
    this.maxRetries = 3;
    this.currentRetry = 0;
  }

  async initialize(phoneNumber = null, usePairingCode = true) {
    try {
      // Prevent multiple simultaneous connections
      if (this.connectionPromise) {
        console.log('Connection already in progress, waiting...');
        return await this.connectionPromise;
      }

      if (this.connected) {
        console.log('WhatsApp already connected');
        return {
          success: true,
          message: 'Already connected',
          status: this.getConnectionStatus()
        };
      }

      // Create connection promise to prevent race conditions
      this.connectionPromise = this._doInitialize(phoneNumber, usePairingCode);
      
      try {
        const result = await this.connectionPromise;
        return result;
      } finally {
        this.connectionPromise = null;
      }

    } catch (error) {
      this.connectionPromise = null;
      this.connecting = false;
      console.error('Failed to initialize WhatsApp:', error);
      throw error;
    }
  }

  async _doInitialize(phoneNumber, usePairingCode) {
    this.connecting = true;
    this.usePairingCode = usePairingCode;
    this.targetPhoneNumber = phoneNumber;
    
    console.log('Initializing WhatsApp connection...');
    console.log('Using pairing code:', this.usePairingCode);
    console.log('Target phone number:', this.targetPhoneNumber);

    // Ensure auth directory exists
    const authDir = './auth_info';
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Setup auth state with better error handling
    try {
      const { state, saveCreds } = await useMultiFileAuthState(authDir);
      this.authState = state;
      this.saveCreds = saveCreds;
    } catch (authError) {
      console.error('Auth state error:', authError);
      // Clear auth directory and try again
      if (fs.existsSync(authDir)) {
        fs.rmSync(authDir, { recursive: true, force: true });
        fs.mkdirSync(authDir, { recursive: true });
      }
      const { state, saveCreds } = await useMultiFileAuthState(authDir);
      this.authState = state;
      this.saveCreds = saveCreds;
    }

    // Get latest Baileys version
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using Baileys v${version.join('.')}, isLatest: ${isLatest}`);

    // Create socket with improved configuration
    this.sock = makeWASocket({
      version,
      logger: this.logger,
      printQRInTerminal: !this.usePairingCode,
      auth: {
        creds: this.authState.creds,
        keys: makeCacheableSignalKeyStore(this.authState.keys, this.logger),
      },
      msgRetryCounterCache,
      generateHighQualityLinkPreview: true,
      shouldIgnoreJid: jid => isJidBroadcast(jid),
      // Improved connection settings
      keepAliveIntervalMs: 30000, // Increased to 30 seconds
      connectTimeoutMs: 120000, // Increased to 2 minutes
      defaultQueryTimeoutMs: 60000,
      retryRequestDelayMs: 1000, // Increased delay
      maxMsgRetryCount: 3,
      // Browser info for pairing code
      browser: ['WhatsApp Manager', 'Chrome', '20.0.04'],
      // Additional stability settings
      syncFullHistory: false,
      markOnlineOnConnect: true,
    });

    this.setupEventHandlers();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.connecting = false;
        this.connectionPromise = null;
        reject(new Error('Connection timeout after 3 minutes'));
      }, 180000); // 3 minutes timeout

      let resolved = false;

      const resolveOnce = (result) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(result);
        }
      };

      const rejectOnce = (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          reject(error);
        }
      };

      // Handle initial connection update
      const handleInitialConnection = (update) => {
        const { connection, lastDisconnect, qr } = update;

        console.log('Connection update:', { connection, qr: !!qr });

        if (qr && !this.usePairingCode) {
          this.qr = qr;
          console.log('QR Code generated');
          resolveOnce({
            success: true,
            message: 'QR Code generated',
            qr: qr,
            status: this.getConnectionStatus()
          });
        }

        if (connection === 'open') {
          this.connected = true;
          this.connecting = false;
          this.qr = null;
          this.pairingCode = null;
          this.currentRetry = 0;
          console.log('WhatsApp connected successfully');
          
          // Remove listener after successful connection
          this.sock.ev.off('connection-update', handleInitialConnection);
          
          resolveOnce({
            success: true,
            message: 'Connected successfully',
            status: this.getConnectionStatus()
          });
        }

        if (connection === 'close') {
          this.connected = false;
          this.connecting = false;
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          
          console.log('Connection closed, status code:', statusCode, 'shouldReconnect:', shouldReconnect);
          
          // Remove listener
          this.sock.ev.off('connection-update', handleInitialConnection);
          
          if (shouldReconnect && this.currentRetry < this.maxRetries) {
            console.log(`Connection closed, attempting to reconnect... (${this.currentRetry + 1}/${this.maxRetries})`);
            this.currentRetry++;
            setTimeout(() => {
              this.initialize(this.targetPhoneNumber, this.usePairingCode).catch(console.error);
            }, 5000);
            
            resolveOnce({
              success: false,
              message: 'Connection closed, reconnecting...',
              status: this.getConnectionStatus()
            });
          } else {
            console.log('Connection closed, not reconnecting');
            rejectOnce(new Error(statusCode === DisconnectReason.loggedOut ? 'Logged out from WhatsApp' : 'Connection failed'));
          }
        }
      };

      this.sock.ev.on('connection-update', handleInitialConnection);

      // Generate pairing code jika menggunakan pairing code mode
      if (this.usePairingCode && this.targetPhoneNumber && !this.authState.creds.registered) {
        // Wait longer for socket to be ready
        setTimeout(async () => {
          try {
            // Check if socket is still valid
            if (!this.sock || resolved) return;

            // Format nomor telepon
            let formattedNumber = this.targetPhoneNumber.replace(/\D/g, '');
            
            // Add country code if not present (untuk Indonesia)
            if (!formattedNumber.startsWith('62') && formattedNumber.startsWith('0')) {
              formattedNumber = '62' + formattedNumber.substring(1);
            } else if (!formattedNumber.startsWith('62') && !formattedNumber.startsWith('0')) {
              // Assume it's local number without 0
              formattedNumber = '62' + formattedNumber;
            }
            
            console.log('Requesting pairing code for:', formattedNumber);
            
            // Add retry mechanism for pairing code generation
            let pairingCodeGenerated = false;
            let attempts = 0;
            const maxAttempts = 3;
            
            while (!pairingCodeGenerated && attempts < maxAttempts && !resolved) {
              try {
                attempts++;
                console.log(`Pairing code attempt ${attempts}/${maxAttempts}`);
                
                const code = await this.sock.requestPairingCode(formattedNumber);
                this.pairingCode = code;
                pairingCodeGenerated = true;
                
                console.log('Pairing code generated successfully:', code);
                
                resolveOnce({
                  success: true,
                  message: 'Pairing code generated',
                  pairingCode: code,
                  phoneNumber: formattedNumber,
                  status: this.getConnectionStatus()
                });
                
              } catch (pairingError) {
                console.error(`Pairing code attempt ${attempts} failed:`, pairingError);
                
                if (attempts >= maxAttempts) {
                  rejectOnce(new Error(`Failed to generate pairing code after ${maxAttempts} attempts: ${pairingError.message}`));
                } else {
                  // Wait before retry
                  await new Promise(resolve => setTimeout(resolve, 2000));
                }
              }
            }
          } catch (error) {
            console.error('Failed to generate pairing code:', error);
            rejectOnce(error);
          }
        }, 5000); // Wait 5 seconds for socket to be ready
      }
    });
  }

  setupEventHandlers() {
    if (!this.sock) return;

    // Handle credentials update
    this.sock.ev.on('creds.update', this.saveCreds);

    // Handle connection updates (for ongoing connections)
    this.sock.ev.on('connection-update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      // Only handle if not in initial connection phase
      if (this.connectionPromise) return;
      
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
        this.currentRetry = 0;
        
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
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        
        console.log('Connection closed due to:', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
        
        if (shouldReconnect && this.currentRetry < this.maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, this.currentRetry), 30000);
          this.currentRetry++;
          
          setTimeout(() => {
            console.log(`Attempting to reconnect... (${this.currentRetry}/${this.maxRetries})`);
            this.initialize(this.targetPhoneNumber, this.usePairingCode).catch(console.error);
          }, delay);
        } else {
          console.log('Max retries reached or logged out, stopping reconnection attempts');
          this.currentRetry = 0;
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
        userId: 'default-user',
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

  getConnectionStatus() {
    return {
      connected: this.connected,
      connecting: this.connecting,
      qr: this.qr,
      pairingCode: this.pairingCode,
      phoneNumber: this.phoneNumber,
      targetPhoneNumber: this.targetPhoneNumber,
      usePairingCode: this.usePairingCode,
      timestamp: new Date().toISOString(),
      retryCount: this.currentRetry
    };
  }

  async disconnect() {
    try {
      // Clear connection promise
      this.connectionPromise = null;
      
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
      this.currentRetry = 0;
      
      console.log('WhatsApp disconnected successfully');
      return true;
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      throw error;
    }
  }

  // Method untuk generate pairing code secara manual
  async generatePairingCode(phoneNumber) {
    try {
      // Initialize socket if not exists
      if (!this.sock) {
        await this.initialize(phoneNumber, true);
        // Wait for socket to be ready
        let attempts = 0;
        while (!this.sock && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
        
        if (!this.sock) {
          throw new Error('Socket not ready after initialization');
        }
      }

      let formattedNumber = phoneNumber.replace(/\D/g, '');
      
      // Add country code if not present (untuk Indonesia)
      if (!formattedNumber.startsWith('62') && formattedNumber.startsWith('0')) {
        formattedNumber = '62' + formattedNumber.substring(1);
      } else if (!formattedNumber.startsWith('62') && !formattedNumber.startsWith('0')) {
        formattedNumber = '62' + formattedNumber;
      }
      
      console.log('Generating pairing code for:', formattedNumber);
      
      // Retry mechanism for pairing code generation
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Pairing code attempt ${attempts}/${maxAttempts}`);
          
          const code = await this.sock.requestPairingCode(formattedNumber);
          this.pairingCode = code;
          this.targetPhoneNumber = formattedNumber;
          
          console.log('Pairing code generated successfully:', code);
          
          return {
            success: true,
            pairingCode: code,
            phoneNumber: formattedNumber
          };
          
        } catch (error) {
          console.error(`Pairing code attempt ${attempts} failed:`, error);
          
          if (attempts >= maxAttempts) {
            throw new Error(`Failed to generate pairing code after ${maxAttempts} attempts: ${error.message}`);
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
    } catch (error) {
      console.error('Failed to generate pairing code:', error);
      throw error;
    }
  }

  // Additional utility methods
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
}

// Utility function untuk check broadcast JID
function isJidBroadcast(jid) {
  return jid === 'status@broadcast';
}

export default WhatsAppService;