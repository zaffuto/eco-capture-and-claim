# EcoCapture WhatsApp Bot

Este bot de WhatsApp está diseñado para facilitar el proceso de reciclaje de baterías y la gestión de recompensas en la plataforma EcoCapture.

## Características

- Registro de reciclaje mediante códigos QR
- Verificación de ubicación
- Generación de certificados de reciclaje
- Sistema de puntos y recompensas
- Integración con Shopify para canjear recompensas

## Requisitos

- Node.js >= 18
- PostgreSQL
- Cuenta de BuilderBot Premium
- Número de WhatsApp registrado

## Configuración

1. Crea un archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Configura las variables de entorno:
   - `BUILDERBOT_TOKEN`: Token de tu cuenta BuilderBot Premium
   - `PHONE_NUMBER`: Número de WhatsApp registrado
   - `DATABASE_URL`: URL de conexión a PostgreSQL
   - `JWT_SECRET`: Clave secreta para JWT (32 caracteres)
   - `ENCRYPTION_KEY`: Clave de encriptación (32 caracteres)

3. Instala las dependencias:
   ```bash
   pnpm install
   ```

4. Ejecuta las migraciones de la base de datos:
   ```bash
   pnpm run migrate
   ```

## Desarrollo

```bash
# Iniciar en modo desarrollo
pnpm run dev

# Compilar TypeScript
pnpm run build

# Iniciar en producción
pnpm start
```

## Seguridad

- Todos los mensajes sensibles son encriptados
- Las claves de API se almacenan de forma segura
- Se implementa validación de datos con Zod
- Los logs son monitoreados y rotados
- Se implementan límites de tasa para prevenir spam

## Flujos Disponibles

1. **Reciclaje**
   - Comando: `reciclar`
   - Pasos:
     1. Enviar foto del código QR del contenedor
     2. Compartir ubicación
     3. Seleccionar tipo de batería
     4. Recibir certificado y puntos

2. **Ayuda**
   - Comando: `ayuda`
   - Muestra los comandos disponibles

## Contribución

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.
