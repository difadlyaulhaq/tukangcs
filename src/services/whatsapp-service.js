// services/whatsapp-service.js
import { Boom } from '@hapi/boom';
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';
// Import dari file yang sama dengan auth/login.ts
import { adminDb } from '../lib/firebase-admin.js';

export default class WhatsAppService {
  constructor() {
    this.sock = null;
    this.qr = null;
    this.qrString = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.authPath = './auth_info_baileys';
    this.connectionPromise = null;
    
    // Pastikan direktori auth ada
    this.ensureAuthDirectory();
  }

  ensureAuthDirectory() {
    try {
      if (!fs.existsSync(this.authPath)) {
        fs.mkdirSync(this.authPath, { recursive: true });
        console.log('Auth directory created:', this.authPath);
      }
    } catch (error) {
      console.error('Error creating auth directory:', error);
    }
  }

  async initialize() {
    // Prevent multiple simultaneous connections
    if (this.isConnecting) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    
    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('Initializing WhatsApp connection...');
        
        // Tidak perlu inisialisasi Firebase lagi karena sudah dihandle di firebase-admin.js
        
        const { state, saveCreds } = await useMultiFileAuthState(this.authPath);

        this.sock = makeWASocket({
          auth: state,
          printQRInTerminal: false,
          browser: ['WhatsApp Business Bot', 'Chrome', '91.0.4472.124'],
          defaultQueryTimeoutMs: 60000,
        });

        this.sock.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect, qr } = update;
          console.log('Connection update:', { connection, qr: !!qr });

          if (qr) {
            try {
              this.qr = qr;
              this.qrString = await QRCode.toDataURL(qr);
              console.log('QR Code generated');
            } catch (qrError) {
              console.error('Error generating QR code:', qrError);
            }
          }

          if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error instanceof Boom
              ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
              : true;

            console.log('Connection closed. Should reconnect:', shouldReconnect);
            
            this.isConnected = false;
            this.isConnecting = false;
            
            if (shouldReconnect) {
              setTimeout(() => {
                this.initialize();
              }, 5000);
            } else {
              this.qr = null;
              this.qrString = null;
              reject(new Error('Logged out from WhatsApp'));
            }
          } else if (connection === 'open') {
            console.log('WhatsApp connected successfully');
            this.isConnected = true;
            this.isConnecting = false;
            this.qr = null;
            this.qrString = null;
            resolve(true);
          }
        });

        this.sock.ev.on('creds.update', saveCreds);

        // Handle incoming messages
        this.sock.ev.on('messages.upsert', async (m) => {
          try {
            const message = m.messages[0];
            if (!message?.message || message.key.fromMe) return;

            const messageContent = message.message.conversation ||
              message.message.extendedTextMessage?.text ||
              '[Media]';

            console.log('New message received:', messageContent);

            // Simpan ke Firestore menggunakan adminDb yang sudah ada
            await adminDb.collection('pesan').add({
              platform: 'whatsapp',
              senderId: message.key.remoteJid,
              senderName: message.pushName || 'Unknown',
              isi: messageContent,
              waktu: new Date().toISOString(),
              status: 'baru',
              userId: 'default-user',
              metadata: {
                messageType: message.message ? Object.keys(message.message)[0] : 'unknown',
                messageId: message.key.id
              }
            });
          } catch (error) {
            console.error('Error handling incoming message:', error);
          }
        });

        this.sock.ev.on('CB:call', (node) => {
          console.log('Received call:', node);
        });

      } catch (error) {
        console.error('Error initializing WhatsApp:', error);
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  async disconnect() {
    try {
      console.log('Disconnecting WhatsApp...');
      if (this.sock) {
        await this.sock.logout();
        this.sock = null;
      }
      this.isConnected = false;
      this.isConnecting = false;
      this.qr = null;
      this.qrString = null;
      this.connectionPromise = null;
      console.log('WhatsApp disconnected');
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
      qr: this.qrString,
      phoneNumber: this.sock?.user?.id
        ? this.sock.user.id.replace(/:.*@/, '').replace('@s.whatsapp.net', '')
        : null
    };
  }

  async sendMessage(jid, message) {
    if (!this.sock || !this.isConnected) {
      throw new Error('WhatsApp is not connected');
    }
    
    try {
      console.log('Sending message to:', jid);
      await this.sock.sendMessage(jid, { text: message });
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}