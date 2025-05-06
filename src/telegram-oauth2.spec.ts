import { TelegramOAuth2 } from './telegram-oauth2';
import { ITelegramData } from './interfaces/data-telegram.interface';
import { ERRORS } from './constants/errors.constans';

describe('TelegramOAuth2', () => {
    const botToken = '7737759018:AAG3BnKJKNh8XVeZ69tdYW0KZ3N9pWhqZK0';
    const validUntil = 2000;

    let telegramOAuth: TelegramOAuth2;
    let validData: ITelegramData;

    beforeEach(() => {
        telegramOAuth = new TelegramOAuth2({ botToken, validUntil });
        validData = {
            id: 6734228260,
            first_name: 'Ivan',
            username: 'reacty',
            photo_url:
                'https://t.me/i/userpic/320/ywDhRGPP2zRKa4S8OnyX0rfwYU7ycTQpRiSKkQ1wr1JMVcd_A_2rlsFba9d8vnvt.jpg',
            auth_date: 1746529672,
            hash: 'af6ac3dd6e3278624f380fc5bc993aec54b0ab4a36e8a90d1477b942f2619b76',
        };
        // Подменяем системное время на ровно auth_date
        jest.useFakeTimers();
        jest.setSystemTime(validData.auth_date * 1000);
    });

    afterEach(() => {
        // Восстанавливаем реальное время
        jest.useRealTimers();
    });

    describe('handleTelegramOAuthCallback', () => {
        it('должен успешно валидировать корректные данные', () => {
            const result = telegramOAuth.handleTelegramOAuthCallback(validData);
            expect(result.isSuccess).toBe(true);
            expect(result.data).toEqual(validData);
        });

        it('должен отклонять данные с истекшим сроком действия', () => {
            const expiredData = {
                ...validData,
                auth_date: validData.auth_date - validUntil - 100,
            };

            const result = telegramOAuth.handleTelegramOAuthCallback(expiredData);
            expect(result.isSuccess).toBe(false);
            expect(result.message).toBe(ERRORS.EXPIRED_HASH);
        });

        it('должен отклонять данные с неверным хешем', () => {
            const invalidHashData = {
                ...validData,
                hash: 'invalid_hash',
            };

            const result = telegramOAuth.handleTelegramOAuthCallback(invalidHashData);
            expect(result.isSuccess).toBe(false);
            expect(result.message).toBe(ERRORS.INVALID_HASH);
        });

        it('должен отклонять данные без username и photo_url', () => {
            const minimalData = {
                id: validData.id,
                first_name: validData.first_name,
                auth_date: validData.auth_date,
                hash: validData.hash,
            };

            const result = telegramOAuth.handleTelegramOAuthCallback(minimalData as ITelegramData);
            expect(result.isSuccess).toBe(false);
            expect(result.message).toBe(ERRORS.INVALID_HASH);
        });

        it('должен отклонять данные с измененным значением last_name', () => {
            const dataWithLastName = {
                ...validData,
                last_name: 'Petrov',
            };

            const result = telegramOAuth.handleTelegramOAuthCallback(dataWithLastName);
            expect(result.isSuccess).toBe(false);
            expect(result.message).toBe(ERRORS.INVALID_HASH);
        });

        it('должен отклонять данные с измененным значением поля first_name', () => {
            const modifiedData = {
                ...validData,
                first_name: 'John',
            };

            const result = telegramOAuth.handleTelegramOAuthCallback(modifiedData);
            expect(result.isSuccess).toBe(false);
            expect(result.message).toBe(ERRORS.INVALID_HASH);
        });
    });
});
