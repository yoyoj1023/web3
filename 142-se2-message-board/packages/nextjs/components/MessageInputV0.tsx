import React, { useState } from 'react';
import { useScaffoldWriteContract } from '~~/hooks/scaffold-eth';

interface MessageInputProps {
    onMessagePosted?: () => void;
}

interface FormData {
    text: string;
    author: string;
    title: string;
    tags: string;
}

interface PostingStatus {
    isPosting: boolean;
    currentStep: 'idle' | 'uploading' | 'confirming' | 'success' | 'error';
    error: string | null;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onMessagePosted }) => {
    // ==================== 狀態管理 ====================

    const [formData, setFormData] = useState<FormData>({
        text: '',
        author: '',
        title: '',
        tags: '',
    });

    const [status, setStatus] = useState<PostingStatus>({
        isPosting: false,
        currentStep: 'idle',
        error: null,
    });

    // ==================== Scaffold-eth-2 Hook ====================

    const { writeContractAsync: postMessage } = useScaffoldWriteContract({
        contractName: 'MessageBoard',
    });

    // ==================== 表單處理 ====================

    const handleInputChange = (
        field: keyof FormData,
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = (): string | null => {
        if (!formData.text.trim()) {
            return '請輸入留言內容';
        }

        if (formData.text.length > 5000) {
            return '留言內容不能超過 5000 字';
        }

        if (formData.author.length > 100) {
            return '作者名稱不能超過 100 字';
        }

        if (formData.title.length > 200) {
            return '標題不能超過 200 字';
        }

        return null;
    };

    // ==================== IPFS 上傳 ====================

    const uploadToIPFS = async (): Promise<string> => {
        const tags = formData.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        const messageContent = {
            text: formData.text.trim(),
            ...(formData.author.trim() && { author: formData.author.trim() }),
            ...(formData.title.trim() && { title: formData.title.trim() }),
            ...(tags.length > 0 && { tags }),
        };

        const response = await fetch('/api/upload-to-ipfs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageContent),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '上傳失敗');
        }

        const data = await response.json();
        if (!data.success || !data.cid) {
            throw new Error('上傳回應格式錯誤');
        }

        return data.cid;
    };

    // ==================== 主要提交邏輯 ====================

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 驗證表單
        const validationError = validateForm();
        if (validationError) {
            setStatus({
                isPosting: false,
                currentStep: 'error',
                error: validationError,
            });
            return;
        }

        try {
            setStatus({
                isPosting: true,
                currentStep: 'uploading',
                error: null,
            });

            // 步驟 1: 上傳到 IPFS
            console.log('開始上傳到 IPFS...');
            const cid = await uploadToIPFS();
            console.log('IPFS 上傳成功，CID:', cid);

            // 步驟 2: 呼叫智能合約
            setStatus(prev => ({
                ...prev,
                currentStep: 'confirming',
            }));

            console.log('開始呼叫智能合約...');
            const txHash = await postMessage({
                functionName: 'postMessage',
                args: [cid],
            });

            console.log('交易已提交:', txHash);
            
            // 設置成功狀態
            setStatus({
                isPosting: false,
                currentStep: 'success',
                error: null,
            });

            // 重置表單
            setFormData({
                text: '',
                author: '',
                title: '',
                tags: '',
            });

            // 通知父元件更新留言列表
            onMessagePosted?.();

            // 3 秒後重置狀態
            setTimeout(() => {
                setStatus(prev => ({ ...prev, currentStep: 'idle' }));
            }, 3000);

        } catch (error: any) {
            console.error('發布留言失敗:', error);

            setStatus({
                isPosting: false,
                currentStep: 'error',
                error: error.message || '發布留言時發生未知錯誤',
            });
        }
    };

    // ==================== 渲染邏輯 ====================

    const getStepMessage = () => {
        switch (status.currentStep) {
            case 'uploading':
                return '正在上傳到 IPFS...';
            case 'confirming':
                return '正在確認區塊鏈交易...';
            case 'success':
                return '留言發布成功！';
            case 'error':
                return `發布失敗: ${status.error}`;
            default:
                return '';
        }
    };

    const getButtonText = () => {
        if (status.isPosting) {
            switch (status.currentStep) {
                case 'uploading':
                    return '上傳中...';
                case 'confirming':
                    return '確認中...';
                default:
                    return '發布中...';
            }
        }
        return '發布留言';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">發布新留言</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 留言內容 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        留言內容 *
                    </label>
                    <textarea
                        value={formData.text}
                        onChange={(e) => handleInputChange('text', e.target.value)}
                        placeholder="分享您的想法..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={status.isPosting}
                    />
                    <div className="text-right text-sm text-gray-500">
                        {formData.text.length} / 5000
                    </div>
                </div>

                {/* 作者名稱 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        作者名稱 (可選)
                    </label>
                    <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => handleInputChange('author', e.target.value)}
                        placeholder="您的名稱"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={status.isPosting}
                    />
                </div>

                {/* 標題 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        標題 (可選)
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="留言標題"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={status.isPosting}
                    />
                </div>

                {/* 標籤 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        標籤 (可選)
                    </label>
                    <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        placeholder="標籤1, 標籤2, 標籤3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={status.isPosting}
                    />
                    <div className="text-sm text-gray-500">
                        用逗號分隔多個標籤
                    </div>
                </div>

                {/* 狀態訊息 */}
                {status.currentStep !== 'idle' && (
                    <div className={`p-3 rounded-md ${status.currentStep === 'success'
                            ? 'bg-green-100 text-green-700'
                            : status.currentStep === 'error'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                        }`}>
                        {getStepMessage()}
                    </div>
                )}

                {/* 提交按鈕 */}
                <button
                    type="submit"
                    disabled={status.isPosting || !formData.text.trim()}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${status.isPosting || !formData.text.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {getButtonText()}
                </button>
            </form>
        </div>
    );
};