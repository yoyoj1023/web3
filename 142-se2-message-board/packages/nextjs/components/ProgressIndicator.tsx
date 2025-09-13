// packages/nextjs/components/ProgressIndicator.tsx
import React from 'react';

interface ProgressIndicatorProps {
    currentStep: 'idle' | 'uploading' | 'confirming' | 'success' | 'error';
    progress: number;
    error?: string | null;
}

const steps = [
    { key: 'uploading', label: '上傳到 IPFS', icon: '☁️' },
    { key: 'confirming', label: '確認交易', icon: '⛓️' },
    { key: 'success', label: '發布成功', icon: '✅' },
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    currentStep,
    progress,
    error,
}) => {
    if (currentStep === 'idle') return null;

    const getStepStatus = (stepKey: string) => {
        const stepIndex = steps.findIndex(s => s.key === stepKey);
        const currentIndex = steps.findIndex(s => s.key === currentStep);

        if (currentStep === 'error') return 'error';
        if (currentStep === 'success') return 'completed';
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'pending';
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
            {/* 整體進度條 */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>發布進度</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${currentStep === 'error' ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* 步驟指示器 */}
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const status = getStepStatus(step.key);

                    return (
                        <div key={step.key} className="flex flex-col items-center">
                            {/* 步驟圓圈 */}
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${status === 'completed'
                                        ? 'bg-green-500 text-white'
                                        : status === 'active'
                                            ? 'bg-blue-500 text-white animate-pulse'
                                            : status === 'error'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-300 text-gray-500'
                                    }`}
                            >
                                {status === 'completed' ? '✓' :
                                    status === 'error' ? '✗' :
                                        index + 1}
                            </div>

                            {/* 步驟標籤 */}
                            <div className="text-xs text-center">
                                <div>{step.icon}</div>
                                <div className={
                                    status === 'active' ? 'text-blue-600 font-medium' : 'text-gray-600'
                                }>
                                    {step.label}
                                </div>
                            </div>

                            {/* 連接線 */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`absolute h-0.5 w-16 mt-4 ml-8 ${getStepStatus(steps[index + 1].key) === 'completed'
                                            ? 'bg-green-500'
                                            : 'bg-gray-300'
                                        }`}
                                    style={{
                                        transform: 'translateY(-16px)',
                                        zIndex: -1,
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 錯誤訊息 */}
            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
                    <div className="text-red-700 text-sm">
                        <strong>錯誤:</strong> {error}
                    </div>
                </div>
            )}

            {/* 當前狀態訊息 */}
            <div className="mt-3 text-center text-sm text-gray-600">
                {currentStep === 'uploading' && '正在將您的留言上傳到 IPFS 分散式儲存...'}
                {currentStep === 'confirming' && '正在等待區塊鏈網路確認交易...'}
                {currentStep === 'success' && '🎉 您的留言已成功發布到區塊鏈！'}
                {currentStep === 'error' && '發布過程中遇到問題，請稍後重試。'}
            </div>
        </div>
    );
};