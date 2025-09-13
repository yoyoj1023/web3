// packages/nextjs/utils/error-classification.ts
export enum ErrorCategory {
    NETWORK = 'NETWORK',
    VALIDATION = 'VALIDATION',
    IPFS = 'IPFS',
    BLOCKCHAIN = 'BLOCKCHAIN',
    USER_REJECTED = 'USER_REJECTED',
    UNKNOWN = 'UNKNOWN',
}

export interface ClassifiedError {
    category: ErrorCategory;
    message: string;
    isRetryable: boolean;
    suggestedAction: string;
}

export function classifyError(error: any): ClassifiedError {
    const errorMessage = error?.message || error?.toString() || '未知錯誤';

    // 網路錯誤
    if (errorMessage.includes('Network Error') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('timeout')) {
        return {
            category: ErrorCategory.NETWORK,
            message: '網路連線問題',
            isRetryable: true,
            suggestedAction: '請檢查網路連線後重試',
        };
    }

    // 使用者拒絕交易
    if (errorMessage.includes('User denied') ||
        errorMessage.includes('user rejected')) {
        return {
            category: ErrorCategory.USER_REJECTED,
            message: '使用者取消交易',
            isRetryable: true,
            suggestedAction: '請重新嘗試並確認交易',
        };
    }

    // IPFS 相關錯誤
    if (errorMessage.includes('Pinata') ||
        errorMessage.includes('IPFS')) {
        return {
            category: ErrorCategory.IPFS,
            message: 'IPFS 儲存服務問題',
            isRetryable: true,
            suggestedAction: 'IPFS 服務暫時不可用，請稍後重試',
        };
    }

    // 區塊鏈錯誤
    if (errorMessage.includes('execution reverted') ||
        errorMessage.includes('gas') ||
        errorMessage.includes('transaction')) {
        return {
            category: ErrorCategory.BLOCKCHAIN,
            message: '區塊鏈交易問題',
            isRetryable: true,
            suggestedAction: '請確認錢包有足夠 ETH 並重試',
        };
    }

    // 驗證錯誤
    if (errorMessage.includes('validation') ||
        errorMessage.includes('invalid')) {
        return {
            category: ErrorCategory.VALIDATION,
            message: '輸入資料有誤',
            isRetryable: false,
            suggestedAction: '請檢查輸入內容並重新填寫',
        };
    }

    return {
        category: ErrorCategory.UNKNOWN,
        message: errorMessage,
        isRetryable: true,
        suggestedAction: '發生未知錯誤，請重試或聯繫支援',
    };
}