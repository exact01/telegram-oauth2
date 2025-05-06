import { createHash, createHmac } from 'node:crypto';
import { ERRORS } from './constants/errors.constans';
import { ICfgConstructor } from './interfaces/cfg-constructor.interface';
import { ICommandResponse } from './interfaces/command-response.interface';
import { ITelegramData } from './interfaces/data-telegram.interface';

export class TelegramOAuth2 {
    private readonly botToken: string;
    private readonly validUntil: number | undefined;

    constructor(cfg: ICfgConstructor) {
        this.botToken = cfg.botToken;
        this.validUntil = cfg.validUntil;
    }

    public handleTelegramOAuthCallback(body: ITelegramData): ICommandResponse<ITelegramData> {
        const { hash, ...dataToCheck } = body;

        const currentTimeSec = Math.floor(Date.now() / 1000);

        if (this.validUntil && dataToCheck.auth_date + this.validUntil < currentTimeSec) {
            return {
                isSuccess: false,
                message: ERRORS.EXPIRED_HASH,
            };
        }

        const dataCheckString = Object.keys(dataToCheck)
            .sort()
            .map((key) => `${key}=${(dataToCheck as Record<string, string | number>)[key]}`)
            .join('\n');

        const secretKey = createHash('sha256').update(this.botToken).digest();

        const checkHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (hash !== checkHash) {
            return {
                isSuccess: false,
                message: ERRORS.INVALID_HASH,
            };
        }

        return {
            isSuccess: true,
            data: body,
        };
    }

    public getBotId(): number {
        const botId = this.botToken.split(':')[0];
        return Number(botId);
    }
}
