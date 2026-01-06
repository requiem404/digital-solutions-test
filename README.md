# Digital Solutions

Монорепозиторий с фронтендом и бэкендом.

## Структура проекта

```
digital-solutions/
├── backend/          # Backend на Express 
├── frontend/         # Frontend React
├── package.json      # Корневой package.json для управления проектом
└── README.md
```

## Установка

### Установка всех зависимостей
```bash
npm run install:all
```

Или установка по отдельности:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Запуск

### Разработка

**Backend:**
```bash
npm run dev:backend
# или
cd backend && npm run dev
```

**Frontend:**
```bash
npm run dev:frontend
# или
cd frontend && npm run dev
```

### Сборка

**Backend:**
```bash
npm run build:backend
```

**Frontend:**
```bash
npm run build:frontend
```

**Все сразу:**
```bash
npm run build
```

### Production

**Backend:**
```bash
npm run start:backend
# или
cd backend && npm start
```

**Frontend:**
```bash
npm run start:frontend
# или
cd frontend && npm start
```

## Технологии

### Backend
- Express.js
- TypeScript
- Node.js

### Frontend
- React

