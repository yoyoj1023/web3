import axios from 'axios';
import { NextResponse } from 'next/server';

interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    services: {
        pinata: 'connected' | 'disconnected' | 'error';
    };
    timestamp: string;
    message?: string;
}

export async function GET() {
    let pinataStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';

    try {
        // 檢查環境變數
        const apiKey = process.env.PINATA_API_KEY;
        const apiSecret = process.env.PINATA_API_SECRET;

        if (!apiKey || !apiSecret) {
            throw new Error('API 金鑰未設定');
        }

        // 測試 Pinata 連接
        const response = await axios.get(
            'https://api.pinata.cloud/data/testAuthentication',
            {
                headers: {
                    'pinata_api_key': apiKey,
                    'pinata_secret_api_key': apiSecret,
                },
                timeout: 5000,
            }
        );

        if (response.status === 200) {
            pinataStatus = 'connected';
        }

    } catch (error) {
        console.error('Pinata 健康檢查失敗:', error);
        pinataStatus = 'error';
    }

    const isHealthy = pinataStatus === 'connected';

    const responseData: HealthCheckResponse = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        services: { pinata: pinataStatus },
        timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { 
        status: isHealthy ? 200 : 503 
    });
}
