# EcoCapture & Claim

Sistema unificado de captura y reclamo de reciclaje ecológico.

## Estructura del Proyecto

```
/eco-capture-and-claim
├── apps/
│   ├── mobile/          # App React Native + Expo
│   │   ├── src/
│   │   └── app.json
│   └── web/            # App Next.js
│       ├── src/
│       └── next.config.js
├── packages/
│   ├── database/       # Cliente Supabase y tipos
│   ├── shared/         # Tipos y utilidades compartidas
│   └── ui/             # Componentes UI compartidos
└── turbo.json
```

## Stack Tecnológico

### Frontend
- **Web**: React con Next.js 13 (App Router)
- **Móvil**: React Native con Expo
- **UI**: Tailwind CSS + Headless UI
- **Empaquetado**: Capacitor para APK

### Backend
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **Notificaciones**: Firebase Cloud Messaging

### Integraciones
- WhatsApp Business API
- Shopify API
- Monday.com API

## Requisitos

- Node.js 18+
- npm 9+
- Expo CLI
- Supabase CLI
- Firebase CLI

## Inicio Rápido

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/eco-capture-and-claim.git
cd eco-capture-and-claim
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Iniciar desarrollo:
```bash
# Web
npm run dev:web

# Móvil
npm run dev:mobile
```

## Características Principales

### Usuarios B2C (Recolectores)
- Escaneo de QR de contenedores
- Registro de reciclaje con geolocalización
- Gestión de recompensas y certificados
- Chatbot WhatsApp para consultas

### Usuarios B2B (Negocios)
- Dashboard de certificados
- Gestión de inventario reciclado
- Integración con Shopify
- Reportes y analíticas

## Desarrollo

### Comandos Útiles

```bash
# Construir todos los paquetes
npm run build

# Ejecutar linting
npm run lint

# Formatear código
npm run format
```

### Estructura de Carpetas

- `apps/*`: Aplicaciones frontend
- `packages/*`: Paquetes compartidos
  - `database`: Cliente Supabase y tipos
  - `shared`: Tipos y utilidades compartidas
  - `ui`: Componentes UI compartidos

## Licencia

[MIT](LICENSE)
