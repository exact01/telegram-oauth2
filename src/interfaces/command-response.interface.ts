export interface ICommandResponse<T> {
    isSuccess: boolean;
    data?: T;
    message?: string;
}
