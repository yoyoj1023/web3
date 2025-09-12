const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// 測試資料
const testMessages = [
    {
        text: '這是一則測試留言',
        author: '測試使用者',
        title: '測試標題',
        tags: ['測試', 'API'],
    },
    {
        text: '只有文字內容的簡單留言',
    },
    {
        text: '包含各種字元的留言 123 !@# 中文 English',
        author: 'Multi-Language User',
        tags: ['多語言', 'multilingual', 'test'],
    },
];

// 錯誤測試資料
const errorTestCases = [
    {
        name: '空內容測試',
        data: { text: '' },
        expectedError: 'VALIDATION_ERROR',
    },
    {
        name: '過長內容測試',
        data: { text: 'A'.repeat(6000) },
        expectedError: 'VALIDATION_ERROR',
    },
    {
        name: '過多標籤測試',
        data: {
            text: '測試',
            tags: Array(15).fill('tag'),
        },
        expectedError: 'VALIDATION_ERROR',
    },
];

async function testHealthCheck() {
    console.log('🔍 測試健康檢查 API...');

    try {
        const response = await axios.get(`${API_BASE_URL}/health-check`);
        console.log('✅ 健康檢查通過:', response.data);
    } catch (error) {
        console.error('❌ 健康檢查失敗:', error.response?.data || error.message);
    }
}

async function testUploadMessage(message, index) {
    console.log(`\n🔍 測試上傳留言 ${index + 1}...`);
    console.log('資料:', JSON.stringify(message, null, 2));

    try {
        const response = await axios.post(`${API_BASE_URL}/upload-to-ipfs`, message, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
        });

        console.log('✅ 上傳成功:', response.data);

        // 驗證 CID 格式
        const cid = response.data.cid;
        if (cid && (cid.startsWith('Qm') || cid.startsWith('bafy'))) {
            console.log(`✅ CID 格式正確: ${cid}`);
        } else {
            console.warn(`⚠️ CID 格式可能有問題: ${cid}`);
        }

        return response.data;
    } catch (error) {
        console.error('❌ 上傳失敗:', error.response?.data || error.message);
        return null;
    }
}

async function testErrorHandling(testCase) {
    console.log(`\n🔍 測試錯誤處理: ${testCase.name}`);

    try {
        const response = await axios.post(`${API_BASE_URL}/upload-to-ipfs`, testCase.data);
        console.warn('⚠️ 預期應該失敗，但成功了:', response.data);
    } catch (error) {
        const errorData = error.response?.data;
        if (errorData && errorData.error) {
            console.log('✅ 正確捕獲錯誤:', errorData.error);
        } else {
            console.error('❌ 未預期的錯誤格式:', errorData);
        }
    }
}

async function runAllTests() {
    console.log('🚀 開始 API 測試...\n');

    // 健康檢查
    await testHealthCheck();

    // 測試正常上傳
    console.log('\n📤 測試正常上傳功能...');
    const results = [];
    for (let i = 0; i < testMessages.length; i++) {
        const result = await testUploadMessage(testMessages[i], i);
        if (result) results.push(result);
    }

    // 測試錯誤處理
    console.log('\n🛡️ 測試錯誤處理...');
    for (const testCase of errorTestCases) {
        await testErrorHandling(testCase);
    }

    // 測試總結
    console.log('\n📊 測試總結:');
    console.log(`✅ 成功上傳: ${results.length} 則留言`);
    console.log(`🔗 生成的 CID 列表:`);
    results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.cid}`);
    });

    console.log('\n🎉 API 測試完成！');
}

// 執行測試
runAllTests().catch(console.error);