# Si! Bank

Banco 100% digital para portafolio. Experiencia moderna con identidad neón/cyber sobre fondo oscuro.

## Stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS v4** (design tokens en CSS)
- **Lucide React** (iconos)

## Colores

Sistema de diseño en `app/globals.css` (`@theme`) y `styles/_variables.scss`. Verde neón (`#39ff14`), cyan (`#00e5ff`), fondos oscuros y efectos de glow.

## Cómo correr

```bash
cd si-bank
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Bienvenida / landing |
| `/login` | Inicio de sesión (placeholder) |
| `/dashboard` | Inicio del dashboard (saldo, movimientos, accesos) |
| `/dashboard/transfer` | Transferencias (placeholder) |
| `/dashboard/cards` | Tarjetas digitales (placeholder) |
| `/dashboard/statistics` | Estadísticas (placeholder) |
| `/dashboard/settings` | Ajustes (placeholder) |

## Plan de fases

Ver [PLAN.md](./PLAN.md) para el roadmap de características (auth, movimientos, transferencias, tarjetas, estadísticas, seguridad, PWA).
