import crypto from 'node:crypto';
import { ICfgConstructor, ICommandResponse, ITelegramPayload, IUserTelegram } from './interfaces';
import { ERRORS } from './constants/errors.constan';

export class TelegramOAuth2 {
    private readonly botToken: string;
    private readonly publicKey: string;

    constructor(cfg: ICfgConstructor) {
        this.botToken = cfg.botToken;
        this.publicKey = cfg.publicKey;
    }

    public handleTelegramOAuthCallback(reqUrl: string): ICommandResponse<IUserTelegram> {
        const parsedUrl = new URL(reqUrl);
        const queryParams: Record<string, string> = Object.fromEntries(parsedUrl.searchParams);
        const hash = queryParams.hash;
        const payloadString = queryParams.payload;

        if (!hash || !payloadString) {
            return {
                isSuccess: false,
                message: ERRORS.MISSING_REQUIRED_PARAMETERS,
            };
        }

        const payload: ITelegramPayload = JSON.parse(
            Buffer.from(payloadString, 'base64').toString(),
        );

        const secretKey = crypto
            .createHash('sha256')
            .update(this.botToken + this.publicKey)
            .digest();

        const checkHash = crypto
            .createHmac('sha256', secretKey)
            .update(payloadString)
            .digest('hex');

        if (hash !== checkHash) {
            return {
                isSuccess: false,
                message: ERRORS.INVALID_HASH,
            };
        }

        const user = payload.user;

        return {
            isSuccess: true,
            data: user,
        };
    }
}
