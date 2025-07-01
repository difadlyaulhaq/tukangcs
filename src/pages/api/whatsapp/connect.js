// src/pages/api/whatsapp/connect.js
import whatsappManager from "../../../lib/whatsapp-manager.js";

export const prerender = false;

export const POST = async ({ request }) => {
  try {
    console.log('WhatsApp connect API called');
    
    const body = await request.json();
    const { action, phoneNumber, usePairingCode } = body;
    console.log('Action:', action);
    console.log('Phone Number:', phoneNumber);
    console.log('Use Pairing Code:', usePairingCode);

    switch (action) {
      case 'connect':
        try {
          console.log('Starting WhatsApp connection...');
          
          // Validasi nomor telepon jika menggunakan pairing code
          if (usePairingCode && !phoneNumber) {
            return new Response(JSON.stringify({ 
              success: false, 
              message: 'Phone number is required for pairing code connection'
            }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }

          const result = await whatsappManager.connect(phoneNumber, usePairingCode);
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: result.message || 'WhatsApp connection initiated',
            data: result.status || whatsappManager.getConnectionStatus(),
            pairingCode: result.pairingCode || null,
            qr: result.qr || null
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (connectError) {
          console.error('Connection error:', connectError);
          return new Response(JSON.stringify({ 
            success: false, 
            message: 'Failed to connect to WhatsApp',
            error: connectError.message
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

      case 'disconnect':
        try {
          console.log('Disconnecting WhatsApp...');
          await whatsappManager.disconnect();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'WhatsApp disconnected successfully' 
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (disconnectError) {
          console.error('Disconnect error:', disconnectError);
          return new Response(JSON.stringify({ 
            success: false, 
            message: 'Failed to disconnect WhatsApp',
            error: disconnectError.message
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

      case 'status':
        try {
          const status = whatsappManager.getConnectionStatus();
          console.log('Current status:', status);
          
          return new Response(JSON.stringify({ 
            success: true, 
            data: status 
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (statusError) {
          console.error('Status error:', statusError);
          return new Response(JSON.stringify({ 
            success: false, 
            message: 'Failed to get status',
            error: statusError.message
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

      case 'generate-pairing-code':
        try {
          if (!phoneNumber) {
            return new Response(JSON.stringify({ 
              success: false, 
              message: 'Phone number is required for pairing code generation'
            }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }

          console.log('Generating pairing code for:', phoneNumber);
          const result = await whatsappManager.generatePairingCode(phoneNumber);
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Pairing code generated successfully',
            data: {
              pairingCode: result.pairingCode,
              phoneNumber: result.phoneNumber,
              ...whatsappManager.getConnectionStatus()
            }
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (pairingError) {
          console.error('Pairing code error:', pairingError);
          return new Response(JSON.stringify({ 
            success: false, 
            message: 'Failed to generate pairing code',
            error: pairingError.message
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Invalid action. Valid actions: connect, disconnect, status, generate-pairing-code' 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};