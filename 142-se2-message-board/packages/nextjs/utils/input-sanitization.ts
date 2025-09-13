// 類型定義
export interface MessageContent {
    text: string;
    author?: string;
    title?: string;
    tags?: string[];
}

export interface SanitizedMessage {
    text: string;
    author?: string;
    title?: string;
    tags?: string[];
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    data?: SanitizedMessage;
}

/**
 * 清理字串輸入，移除危險字元和多餘空白
 */
export function sanitizeString(input: string | null | undefined, maxLength: number): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    return input
        .trim()                                    // 移除前後空白
        .replace(/\s+/g, ' ')                     // 合併多個空白為一個
        .replace(/[<>"'&]/g, '')                  // 移除潛在的 HTML/指令注入字元
        .replace(/[\x00-\x1F\x7F]/g, '')          // 移除控制字元
        .slice(0, maxLength);                     // 限制長度
}

/**
 * 清理標籤陣列，去除重複和無效標籤
 */
export function sanitizeTags(tags: string[] | null | undefined): string[] {
    if (!Array.isArray(tags)) {
        return [];
    }

    return [...new Set(tags)]                     // 去除重複
        .map(tag => sanitizeString(tag, 50))      // 清理每個標籤
        .filter(tag => {
            // 只保留有效標籤（至少 2 個字元，且不全為數字）
            return tag.length >= 2 && 
                   tag.length <= 50 && 
                   !/^\d+$/.test(tag) &&           // 不全為數字
                   /^[\w\u4e00-\u9fff\s-]+$/.test(tag); // 只允許字母、數字、中文、空格和連字符
        })
        .slice(0, 10);                            // 限制數量
}

/**
 * 驗證輸入資料的基本規則
 */
export function validateMessageInput(input: any): ValidationResult {
    const errors: string[] = [];

    // 檢查輸入是否為物件
    if (!input || typeof input !== 'object') {
        return {
            isValid: false,
            errors: ['輸入資料格式錯誤']
        };
    }

    // 檢查必要欄位
    if (!input.text || typeof input.text !== 'string' || input.text.trim().length === 0) {
        errors.push('留言內容不能為空');
    }

    // 檢查長度限制
    if (input.text && input.text.length > 5000) {
        errors.push('留言內容不能超過 5000 字元');
    }

    if (input.author && input.author.length > 100) {
        errors.push('作者名稱不能超過 100 字元');
    }

    if (input.title && input.title.length > 200) {
        errors.push('標題不能超過 200 字元');
    }

    if (input.tags && Array.isArray(input.tags) && input.tags.length > 10) {
        errors.push('標籤數量不能超過 10 個');
    }

    if (errors.length > 0) {
        return {
            isValid: false,
            errors
        };
    }

    return {
        isValid: true,
        errors: []
    };
}

/**
 * 驗證並清理留言輸入
 */
export function validateAndSanitizeMessage(input: any): ValidationResult {
    // 先驗證輸入
    const validation = validateMessageInput(input);
    if (!validation.isValid) {
        return validation;
    }

    // 清理資料
    const sanitized: SanitizedMessage = {
        text: sanitizeString(input.text, 5000),
    };

    // 處理可選欄位
    if (input.author) {
        const cleanAuthor = sanitizeString(input.author, 100);
        if (cleanAuthor) {
            sanitized.author = cleanAuthor;
        }
    }

    if (input.title) {
        const cleanTitle = sanitizeString(input.title, 200);
        if (cleanTitle) {
            sanitized.title = cleanTitle;
        }
    }

    if (input.tags) {
        const cleanTags = sanitizeTags(input.tags);
        if (cleanTags.length > 0) {
            sanitized.tags = cleanTags;
        }
    }

    // 最終驗證清理後的資料
    if (!sanitized.text || sanitized.text.length === 0) {
        return {
            isValid: false,
            errors: ['清理後的留言內容為空']
        };
    }

    return {
        isValid: true,
        errors: [],
        data: sanitized
    };
}

/**
 * 檢查 IPFS CID 的格式是否正確
 */
export function validateIPFSCid(cid: string): boolean {
    if (!cid || typeof cid !== 'string') {
        return false;
    }

    // 基本 CID 格式檢查（簡化版）
    const cidRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|z[1-9A-HJ-NP-Za-km-z]+)$/;
    return cidRegex.test(cid.trim());
}

/**
 * 清理和驗證使用者地址
 */
export function sanitizeAddress(address: string | null | undefined): string | null {
    if (!address || typeof address !== 'string') {
        return null;
    }

    const cleaned = address.trim().toLowerCase();
    
    // 基本以太坊地址格式檢查
    if (!/^0x[a-f0-9]{40}$/.test(cleaned)) {
        return null;
    }

    return cleaned;
}