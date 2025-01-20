import makeWASocket, { 
  DisconnectReason,
  useMultiFileAuthState,
  makeInMemoryStore,
  proto 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { createLogger } from '../utils/logger';
import * as path from 'path';
import { EventEmitter } from 'events';
import QRCode from 'qrcode-terminal';

const logger = createLogger('WhatsAppAdapter');

export interface WhatsAppMessage {
  from: string;
  body: string;
  hasMedia: boolean;
  location?: {
    degreesLatitude: number;
    degreesLongitude: number;
  };
  message: proto.IWebMessageInfo;
}

export class WhatsAppAdapter extends EventEmitter {
  private socket!: ReturnType<typeof makeWASocket>;
  private store: ReturnType<typeof makeInMemoryStore>;
  private authPath: string;

  constructor() {
    super();
    this.authPath = path.join(process.cwd(), 'auth_info_baileys');
    this.store = makeInMemoryStore({});
    this.initialize();
  }

  private async initialize() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authPath);

      this.socket = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        logger: logger as any,
      });

      this.store.bind(this.socket.ev);

      // Manejar conexión
      this.socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          QRCode.generate(qr, { small: true });
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          
          if (shouldReconnect) {
            await this.initialize();
          }
        }

        if (connection === 'open') {
          logger.info('WhatsApp conectado exitosamente');
          this.emit('ready');
        }
      });

      // Guardar credenciales
      this.socket.ev.on('creds.update', saveCreds);

      // Manejar mensajes
      this.socket.ev.on('messages.upsert', async (m) => {
        if (m.type === 'notify') {
          for (const msg of m.messages) {
            if (!msg.key.fromMe) {
              const messageContent = this.extractMessageContent(msg);
              if (messageContent) {
                this.emit('message', {
                  from: msg.key.remoteJid as string,
                  body: messageContent,
                  hasMedia: msg.message?.imageMessage !== undefined,
                  location: msg.message?.locationMessage,
                  message: msg
                } as WhatsAppMessage);
              }
            }
          }
        }
      });

    } catch (error) {
      logger.error('Error al inicializar WhatsApp:', error);
      throw error;
    }
  }

  private extractMessageContent(msg: proto.IWebMessageInfo): string | null {
    if (!msg.message) return null;

    if (msg.message.conversation) {
      return msg.message.conversation;
    }

    if (msg.message.extendedTextMessage?.text) {
      return msg.message.extendedTextMessage.text;
    }

    return null;
  }

  async send(to: string, message: string | string[]) {
    try {
      const messages = Array.isArray(message) ? message : [message];
      
      for (const text of messages) {
        await this.socket.sendMessage(to, { text });
      }
    } catch (error) {
      logger.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  async sendImage(to: string, image: Buffer, caption?: string) {
    try {
      await this.socket.sendMessage(to, {
        image,
        caption
      });
    } catch (error) {
      logger.error('Error al enviar imagen:', error);
      throw error;
    }
  }

  async sendLocation(to: string, latitude: number, longitude: number) {
    try {
      await this.socket.sendMessage(to, {
        location: {
          degreesLatitude: latitude,
          degreesLongitude: longitude
        }
      });
    } catch (error) {
      logger.error('Error al enviar ubicación:', error);
      throw error;
    }
  }
}
