export interface EnvironmentStatus {
    isValid: boolean;
    issues: string[];
    warnings: string[];
}

export function checkEnvironment(): EnvironmentStatus {
    const issues: string[] = [];
    const warnings: string[] = [];

    // 檢查必要的環境變數
    const requiredVars = [
        'PINATA_API_KEY',
        'PINATA_API_SECRET',
    ];

    const optionalVars = [
        'NEXT_PUBLIC_PINATA_GATEWAY_URL',
        'NEXT_PUBLIC_APP_NAME',
    ];

    // 檢查必要變數
    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            issues.push(`缺少必要環境變數: ${varName}`);
        }
    });

    // 檢查可選變數
    optionalVars.forEach(varName => {
        if (!process.env[varName]) {
            warnings.push(`建議設定環境變數: ${varName}`);
        }
    });

    // 檢查 API 金鑰格式
    if (process.env.PINATA_API_KEY && process.env.PINATA_API_KEY.length < 10) {
        issues.push('PINATA_API_KEY 格式可能有誤');
    }

    if (process.env.PINATA_API_SECRET && process.env.PINATA_API_SECRET.length < 20) {
        issues.push('PINATA_API_SECRET 格式可能有誤');
    }

    // 檢查公開變數洩露
    if (process.env.NEXT_PUBLIC_PINATA_API_SECRET) {
        issues.push('❌ 嚴重安全問題：API Secret 設定為公開變數！');
    }

    return {
        isValid: issues.length === 0,
        issues,
        warnings,
    };
}

// 在開發模式下自動檢查
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    const status = checkEnvironment();

    if (!status.isValid) {
        console.error('🚨 環境設定有問題：');
        status.issues.forEach(issue => console.error(`  - ${issue}`));
    }

    if (status.warnings.length > 0) {
        console.warn('⚠️ 環境設定建議：');
        status.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    if (status.isValid && status.warnings.length === 0) {
        console.log('✅ 環境設定完全正確！');
    }
}