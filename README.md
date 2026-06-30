# AvtoBazar Admin Frontend

Админ-панель маркетплейса AvtoBazar. **React + TypeScript + Vite + Tailwind + shadcn/ui + TanStack**.
Полный план и контекст — в репозитории бэкенда `AvtoBazarBackend` (`ADMIN_PANEL_IMPLEMENTATION_PLAN.md`).
Бэкенд — на отдельном сервере; фронт деплоится на Netlify (`netlify.toml` в корне).

## Запуск (dev)

```bash
cp .env.example .env        # указать VITE_API_BASE (бэкенд, по умолчанию http://localhost:8090)
npm install
npm run dev                 # http://localhost:5173
```

Бэкенд должен быть запущен на `:8090` и иметь CORS, разрешающий origin `http://localhost:5173`
(тикет B1 — уже добавлен в `WebSecurityConfig`, origin берётся из `cors.allowed-origins` / env `CORS_ALLOWED_ORIGINS`).

## Скрипты
- `npm run dev` — дев-сервер Vite
- `npm run build` — typecheck (`tsc --noEmit`) + прод-сборка
- `npm run typecheck` — только проверка типов
- `npm run preview` — предпросмотр прод-сборки

## Что реализовано
- Дизайн-токены (light/dark + всегда-тёмный сайдбар), шрифты Manrope / IBM Plex Mono.
- HTTP-клиент (axios) с `Bearer` + `Accept-Language` и **single-flight refresh** на 401; токены — **вариант C** (refresh→localStorage, access→in-memory).
- Auth: Telegram-логин (2 шага + QR) и **ADMIN-гейт** пробой `POST /control/brands/pageable`.
- Каркас (сайдбар 7 разделов, топбар: язык/тема/меню), экран «Доступ запрещён», i18n (uz/ru/en), тема.
- Общий серверный DataGrid, Drawer, тосты/ConfirmDialog, трёхъязычное поле, enum-кэш, маппинг ошибок API.
- Экраны: **Dashboard, Vehicles (список + карточка), Users, Brands, Models, SOATO (+импорт Excel), Media** — полный CRUD/модерация.
- Code-splitting (lazy-роуты), a11y (focus-trap/Escape в диалогах).

## Деплой (Netlify)
- Netlify env: **`VITE_API_BASE`** = HTTPS-origin бэкенда (build-time).
- Бэкенд env: **`CORS_ALLOWED_ORIGINS`** = origin сайта Netlify; бэкенд по HTTPS.

## Структура
- `src/lib/api` — клиент, эндпоинты, контракт pageable, ресурс-модули
- `src/lib/auth` — токены, контекст авторизации, refresh
- `src/lib/i18n`, `src/lib/theme` — локализация и тема
- `src/components/layout` — каркас (Sidebar/Topbar/…)
- `src/components/ui` — примитивы (shadcn-style)
- `src/features/*` — экраны по фичам
- `src/types/api.ts` — DTO-типы (выверены по бэкенду)
