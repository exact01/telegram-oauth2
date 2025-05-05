import crypto from 'node:crypto';
import { ERRORS } from './constants/errors.constan';
import { ICfgConstructor } from './interfaces/cfg-constructor.interface';
import { ICommandResponse } from './interfaces/command-response.interface';
import { ITelegramData } from './interfaces/data-telegram.interface';

export class TelegramOAuth2 {
    private readonly botToken: string;

    constructor(cfg: ICfgConstructor) {
        this.botToken = cfg.botToken;
    }

    public handleTelegramOAuthCallback(body: ITelegramData): ICommandResponse<ITelegramData> {
        const { hash, ...dataToCheck } = body;
        const dataCheckString = Object.keys(dataToCheck)
            .sort()
            .map((key) => `${key}=${(dataToCheck as Record<string, string | number>)[key]}`)
            .join('\n');

        const secretKey = crypto.createHash('sha256').update(this.botToken).digest();

        const checkHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

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
}
