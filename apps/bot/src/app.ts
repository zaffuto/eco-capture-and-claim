import { WhatsAppAdapter, WhatsAppMessage } from './adapters/builderbot.adapter';
import { createLogger } from './utils/logger';

const logger = createLogger('App');

export class EcoCaptureBot {
  private bot: WhatsAppAdapter;
  private commands: Map<string, (msg: WhatsAppMessage) => Promise<void>>;

  constructor() {
    this.bot = new WhatsAppAdapter();
    this.commands = new Map();
  }

  public async initialize() {
    try {
      // Registrar comandos
      this.registerCommands();

      // Escuchar mensajes
      this.bot.on('message', async (msg: WhatsAppMessage) => {
        try {
          const command = this.getCommand(msg.body);
          if (command) {
            await command(msg);
          } else {
            await this.handleUnknownCommand(msg);
          }
        } catch (error) {
          logger.error('Error al procesar mensaje:', error);
          await this.bot.send(msg.from, 'Lo siento, ocurrió un error al procesar tu mensaje.');
        }
      });

      logger.info('Bot inicializado correctamente');

    } catch (error) {
      logger.error('Error al inicializar el bot:', error);
      process.exit(1);
    }
  }

  private registerCommands() {
    // Comando de reciclaje
    this.commands.set('reciclar', async (msg: WhatsAppMessage) => {
      await this.bot.send(msg.from, [
        '¡Hola! 👋 Vamos a registrar tu reciclaje.',
        'Por favor, envía una foto del código QR del contenedor.'
      ]);
    });

    // Comando de ayuda
    this.commands.set('ayuda', async (msg: WhatsAppMessage) => {
      await this.bot.send(msg.from, [
        '¡Hola! 👋 Estos son los comandos disponibles:',
        '• *reciclar* - Registrar un nuevo reciclaje',
        '• *ayuda* - Ver este mensaje de ayuda'
      ]);
    });
  }

  private getCommand(message: string): ((msg: WhatsAppMessage) => Promise<void>) | undefined {
    const commandText = message.toLowerCase().trim();
    return this.commands.get(commandText);
  }

  private async handleUnknownCommand(msg: WhatsAppMessage) {
    await this.bot.send(msg.from, [
      '¡Hola! 👋 No entendí tu mensaje.',
      'Puedes usar los siguientes comandos:',
      '• *reciclar* - Registrar un nuevo reciclaje',
      '• *ayuda* - Ver este mensaje de ayuda'
    ]);
  }
}

// Crear instancia del bot y mantenerla viva
const bot = new EcoCaptureBot();
bot.initialize();

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('Promesa rechazada no manejada:', error);
});

// Manejar señales de terminación
process.on('SIGTERM', () => {
  logger.info('Recibida señal SIGTERM, cerrando bot...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Recibida señal SIGINT, cerrando bot...');
  process.exit(0);
});
