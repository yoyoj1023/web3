// packages/nextjs/hooks/useRetry.ts
import { useState, useCallback } from 'react';

interface RetryConfig {
    maxAttempts: number;
    delay: number; // 毫秒
    backoffMultiplier: number;
}

export const useRetry = (config: RetryConfig = {
    maxAttempts: 3,
    delay: 1000,
    backoffMultiplier: 2,
}) => {
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    const retry = useCallback(async <T>(
        fn: () => Promise<T>,
        onProgress?: (attempt: number) => void
    ): Promise<T> => {
        let lastError: any;

        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            try {
                setRetryCount(attempt - 1);
                onProgress?.(attempt);

                if (attempt > 1) {
                    setIsRetrying(true);
                    const delay = config.delay * Math.pow(config.backoffMultiplier, attempt - 2);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                const result = await fn();
                setIsRetrying(false);
                setRetryCount(0);
                return result;

            } catch (error) {
                lastError = error;
                console.warn(`嘗試 ${attempt}/${config.maxAttempts} 失敗:`, error);

                if (attempt === config.maxAttempts) {
                    setIsRetrying(false);
                    throw lastError;
                }
            }
        }

        throw lastError;
    }, [config]);

    const reset = useCallback(() => {
        setRetryCount(0);
        setIsRetrying(false);
    }, []);

    return {
        retry,
        retryCount,
        isRetrying,
        reset,
    };
};