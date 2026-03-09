# Si! Bank — Plan del proyecto

Banco digital 100% para portafolio. Experiencia moderna, rápida y transparente con identidad visual neón/cyber sobre fondo oscuro.

---

## Stack recomendado

| Capa | Tecnología | Motivo |
|------|------------|--------|
| **Framework** | Next.js 15 (App Router) | SSR/SSG, rutas, API routes, ideal para portfolio y posible PWA |
| **Estilos** | Tailwind CSS v4 | Design tokens en CSS, tema Si! Bank, responsive |
| **Tipografía** | Clash Display (display) + Satoshi (UI) o similar | Diferenciación, legibilidad en dark |
| **Estado** | React 19 + Zustand o Context | Ligero, suficiente para flujos bancarios simulados |
| **Formularios** | React Hook Form + Zod | Validación y UX en login/registro/transferencias |
| **Gráficas** | Recharts o Chart.js | Estadísticas y gastos por categoría |
| **Iconos** | Lucide React | Consistente y ligero |

---

## Fases de desarrollo

### Fase 1 — Base (actual)
- [x] Sistema de diseño (colores, tokens, tipografía)
- [x] Scaffold Next.js + Tailwind v4
- [x] Pantalla de bienvenida / onboarding
- [x] Shell del dashboard (navbar, layout)

### Fase 2 — Autenticación y cuenta
- [ ] Pantalla de login (email/contraseña)
- [ ] Registro simplificado (flujo “cuenta digital inmediata”)
- [ ] Pantalla de resumen de cuenta (saldo, cuenta digital)
- [ ] Persistencia simulada (localStorage o API mock)

### Fase 3 — Movimientos y categorías
- [ ] Listado de movimientos (ingresos/gastos)
- [ ] Filtros por fecha y categoría
- [ ] Categorías de gasto con iconos/colores
- [ ] Detalle de movimiento

### Fase 4 — Transferencias y pagos
- [ ] Flujo de transferencia (selección contacto/cuenta, monto, confirmación)
- [ ] Lista de beneficiarios/contactos
- [ ] Pagos de servicios (simulados)
- [ ] Comprobante / voucher

### Fase 5 — Tarjetas y estadísticas
- [ ] Vista de tarjetas digitales (bloqueo, límites)
- [ ] Gráficas: gastos por categoría, evolución mensual
- [ ] Reportes descargables o compartibles (PDF/PNG)

### Fase 6 — Seguridad y pulido
- [x] Pantalla de seguridad (sesiones activas, cerrar otras sesiones)
- [x] Monitoreo de actividad reciente (inicios de sesión, cierres)
- [x] Ajustes (tema oscuro/sistema, notificaciones push/email, idioma es/en)
- [x] PWA (manifest.json, service worker, instalable) para “app móvil” en portfolio

---

## Estructura de carpetas (objetivo)

```
si-bank/
├── app/
│   ├── (auth)/           # login, registro
│   ├── (dashboard)/     # rutas protegidas
│   │   ├── home/
│   │   ├── movements/
│   │   ├── transfer/
│   │   ├── cards/
│   │   ├── statistics/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx          # landing/welcome
├── components/
│   ├── ui/               # botones, cards, inputs (design system)
│   ├── layout/           # navbar, sidebar, shell
│   └── features/         # por dominio
├── lib/
│   ├── tokens/           # colores, tipografía
│   ├── utils/
│   └── api/              # mocks o cliente API
├── styles/
│   ├── globals.css       # Tailwind + @theme Si! Bank
│   └── _variables.scss   # SCSS si se usa en algún módulo
└── public/
```

---

## Identidad Si! Bank

- **Tono**: Moderno, directo, “sin complicaciones”.
- **Visual**: Fondo oscuro, acentos neón (verde #39ff14, cyan #00e5ff), glow sutil en CTAs y tarjetas.
- **Diferenciador**: Paleta neón/cyber en fintech; sensación de app nativa actual, no genérica.
