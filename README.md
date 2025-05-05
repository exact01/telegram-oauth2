# Telegram OAuth2 для TypeScript/JavaScript

Библиотека для упрощённой авторизации пользователей через Telegram OAuth2 и TMA(telegram mini apps). Для TMA большенство веще делать не надо.

## Установка

```bash
npm install @exact-team/telegram-oauth2
```

## Подготовка

1. Создайте бота через [@BotFather](https://t.me/BotFather) и получите токен.
2. Привяжите свой домен командой `/setdomain` внутри @BotFather.
3. Извлеките `botId` — это часть токена до символа `:`, например в `1234567890:ABC...` бот id будет `1234567890`.
4. Сохраните `botId` для использования на frontend.

---

## Frontend

### Подключение Telegram Widget

Добавьте скрипт в `<body>` вашего HTML:

```html
<body>
  <script async src="https://telegram.org/js/telegram-widget.js"></script>
</body>
```

### Описание глобальных типов (telegram.d.ts)

Создайте файл `telegram.d.ts` рядом с `tsconfig.json`:

Давайте разберём подробнее, почему мы используем именно этот подход к авторизации:

### 🔹 Авторизация через Telegram Login Widget

#### Преимущества:

- **Гибкость интеграции**: Авторизацию можно инициировать в любом месте приложения в удобный момент
- **Отсутствие iframe**: Решение работает без использования iframe, что улучшает производительность
- **Официальная поддержка**: Метод официально поддерживается Telegram!
- **Удобная обработка данных**: Полученные данные пользователя можно сразу отправить на backend для дальнейшей обработки
- **Кастомизация UI**: Полный контроль над внешним видом кнопки авторизации, что большой плюс для UI!

#### Ограничения:

- **Необходимость проверки подписи**: Требуется дополнительная проверка hash на backend (уже реализовано в библиотеке)
- **Ограниченный контроль**: Popup-окно авторизации управляется Telegram и не может быть кастомизировано, но нам это и не надо

```typescript
declare global {
  interface ITelegramOptions {
    bot_id: string;
    request_access?: boolean;
    lang?: string;
  }

  interface ITelegramData {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    auth_date: number;
    hash: string;
  }

  type ITelegramCallback = (dataOrFalse: ITelegramData | false) => void;

  interface Window {
    Telegram: {
      Login: {
        auth(options: ITelegramOptions, callback: ITelegramCallback): void;
      };
    };
  }
}

export {};
```

И добавьте `telegram.d.ts` в секцию `include` вашего `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ...
  },
  "include": [
    "telegram.d.ts"
    // другие файлы
  ]
}
```

### Пример на React (TypeScript)

```typescript
import React from 'react';
import { Button } from '@shared/components/ui/button';

const botId = process.env.REACT_APP_TELEGRAM_BOT_ID!; // Ваш botID !!!!!

export function LoginPage() {
  const handleCallback = (data: ITelegramData | false) => {
    if (!data) return;
    // Отправьте данные на backend для проверки и генерации JWT
    fetch('/api/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  const handleLogin = () => {
    window.Telegram.Login.auth({ bot_id: botId, request_access: true }, handleCallback);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button onClick={handleLogin}>Войти через Telegram</Button>
    </div>
  );
}
```

---

## Backend

### Инициализация

```typescript
import { TelegramOAuth2 } from 'telegram-oauth2';

const telegramAuth = new TelegramOAuth2({
  botToken: process.env.TELEGRAM_BOT_TOKEN!, // Токен бота
  validUntil: 2000, // (опционально) сколько секунд тело запроса считается валидным
});
```

### Обработка callback

В вашем роуте (например, Express или любая другая фреймворк):

```typescript
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.post('/api/auth/telegram', (req: Request, res: Response) => {
  const result = telegramAuth.handleTelegramOAuthCallback(req.body);

  if (!result.isSuccess || !result.data) {
    return res
      .status(400)
      .json({ error: result.message || 'Неправильная подпись данных или auth_date истёк' });
  }

  const user = result.data;
  // Найдите или создайте пользователя в БД и сгенерируйте JWT

  res.json({ user });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
```

---

## Интерфейсы

```typescript
// Параметры конструктора TelegramOAuth2
interface ICfgConstructor {
  botToken: string;
}

// Данные пользователя из Telegram
interface IUserTelegram {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
}

// Ответ команды библиотеки
interface ICommandResponse<T> {
  isSuccess: boolean;
  message?: string;
  data?: T;
}
```

---

## Обработка ошибок

Библиотека может возвращать следующие типы ошибок:

- `INVALID_HASH` — некорректная подпись данных, возможная попытка взлома.
- `EXPIRED_HASH` — Время auth_date истекло.

---

## Лицензия

Этот проект распространяется под лицензией ISC.")}
