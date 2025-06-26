// src/pages/api/whatsapp/connect.js
import whatsappManager from "../../../lib/whatsapp-manager.js";

export const prerender = false;

export const POST = async ({ request }) => {
  try {
    console.log('WhatsApp connect API called');
    
    const body = await request.json();
    const { action } = body;
    console.log('Action:', action);

    switch (action) {
      case 'connect':
        try {
          console.log('Starting WhatsApp connection...');
          await whatsappManager.connect();
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'WhatsApp connection initiated',
            data: whatsappManager.getConnectionStatus()
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

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Invalid action. Valid actions: connect, disconnect, status' 
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