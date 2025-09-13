// packages/nextjs/components/MessageInput.tsx (更新版本)
import React, { useState } from 'react';
import { useMessagePosting } from '~~/hooks/useMessagePosting';
import { ProgressIndicator } from './ProgressIndicator';

interface MessageInputProps {
    onMessagePosted?: () => void;
}

interface FormData {
    text: string;
    author: string;
    title: string;
    tags: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onMessagePosted }) => {
    const [formData, setFormData] = useState<FormData>({
        text: '',
        author: '',
        title: '',
        tags: '',
    });

    const { state, postMessage, reset } = useMessagePosting(() => {
        // 成功回調
        setFormData({
            text: '',
            author: '',
            title: '',
            tags: '',
        });
        onMessagePosted?.();
    });

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

    const handleInputChange = (
        field: keyof FormData,
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 驗證表單
        const validationError = validateForm();
        if (validationError) {
            alert(validationError); // 可以用更好的 UI 組件替換
            return;
        }

        // 準備內容
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

        await postMessage(messageContent);
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
                        disabled={state.isPosting}
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
                        disabled={state.isPosting}
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
                        disabled={state.isPosting}
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
                        disabled={state.isPosting}
                    />
                    <div className="text-sm text-gray-500">
                        用逗號分雔多個標籤
                    </div>
                </div>

                {/* 進度指示器 */}
                <ProgressIndicator
                    currentStep={state.currentStep}
                    progress={state.progress}
                    error={state.error}
                />

                {/* 提交按鈕 */}
                <div className="flex space-x-3">
                    <button
                        type="submit"
                        disabled={state.isPosting || !formData.text.trim()}
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${state.isPosting || !formData.text.trim()
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {state.isPosting ? '發布中...' : '發布留言'}
                    </button>

                    {state.currentStep === 'error' && (
                        <button
                            type="button"
                            onClick={reset}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            重置
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};