export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    PINATA_AUTH_ERROR = 'PINATA_AUTH_ERROR',
    PINATA_QUOTA_ERROR = 'PINATA_QUOTA_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface APIError {
    code: ErrorCode;
    message: string;
    details?: any;
    timestamp: string;
}

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly details?: any;

    constructor(code: ErrorCode, message: string, statusCode = 500, details?: any) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }

    toJSON(): APIError {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
            timestamp: new Date().toISOString(),
        };
    }
}

// 錯誤處理中介軟體
export function handleAPIError(error: unknown): { status: number; body: APIError } {
    if (error instanceof AppError) {
        return {
            status: error.statusCode,
            body: error.toJSON(),
        };
    }

    // 處理 Zod 驗證錯誤
    if (error && typeof error === 'object' && 'issues' in error) {
        return {
            status: 400,
            body: new AppError(
                ErrorCode.VALIDATION_ERROR,
                '輸入資料驗證失敗',
                400,
                error
            ).toJSON(),
        };
    }

    // 處理未知錯誤
    console.error('未預期的錯誤:', error);
    return {
        status: 500,
        body: new AppError(
            ErrorCode.INTERNAL_ERROR,
            '伺服器內部錯誤'
        ).toJSON(),
    };
}