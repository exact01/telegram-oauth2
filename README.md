# Telegram OAuth2

Библиотека для авторизации через Telegram OAuth2 на TypeScript/JavaScript.

## Установка

```bash
npm install @exact-team/telegram-oauth2
```

## Подготовка

1. Создайте бота через [@BotFather](https://t.me/BotFather) в Telegram
2. Получите токен бота
3. Сгенерируйте публичный ключ командой:

```bash
openssl rand -hex 64
```

## Использование

### Инициализация

```typescript
import { TelegramOAuth2 } from 'telegram-oauth2';

const telegramAuth = new TelegramOAuth2({
  botToken: 'YOUR_BOT_TOKEN',
  publicKey: 'YOUR_PUBLIC_KEY',
});
```

### Перенаправление пользователя на страницу авторизации Telegram

```typescript
const botId = 'YOUR_BOT_ID';
const scope = 'basic';
const publicKey = 'YOUR_PUBLIC_KEY';
const nonce = 'UNIQUE_RANDOM_STRING'; // example new Date().getTime().toString()

const authUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&scope=${scope}&public_key=${publicKey}&nonce=${nonce}`;
// Перенаправьте пользователя на authUrl
```

### Обработка callback от Telegram

```typescript
const result = telegramAuth.handleTelegramOAuthCallback(callbackUrl);

if (result.isSuccess) {
  const user = result.data;
  // user содержит информацию о пользователе:
  // - id: number
  // - first_name: string
  // - last_name?: string
  // - username?: string
  // - photo_url?: string
  // - auth_date: number
} else {
  console.error(result.message);
}
```

## Интерфейсы

### ICfgConstructor

```typescript
interface ICfgConstructor {
  botToken: string;
  publicKey: string;
}
```

### IUserTelegram

```typescript
interface IUserTelegram {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
}
```

### ICommandResponse

```typescript
interface ICommandResponse<T> {
  isSuccess: boolean;
  message?: string;
  data?: T;
}
```

## Обработка ошибок

Библиотека может возвращать следующие ошибки:

- `MISSING_REQUIRED_PARAMETERS` - отсутствуют обязательные параметры в URL
- `INVALID_HASH` - неверная подпись данных

## Пример использования с Express

```typescript
import express from 'express';
import { TelegramOAuth2 } from 'telegram-oauth2';

const app = express();
const telegramAuth = new TelegramOAuth2({
  botToken: 'YOUR_BOT_TOKEN',
  publicKey: 'YOUR_PUBLIC_KEY',
});

app.get('/auth/telegram/callback', (req, res) => {
  const result = telegramAuth.handleTelegramOAuthCallback(req.url);

  if (result.isSuccess) {
    // Сохраните информацию о пользователе
    res.json(result.data);
  } else {
    res.status(400).json({ error: result.message });
  }
});

app.listen(3000);
```

## Лицензия

ISC
