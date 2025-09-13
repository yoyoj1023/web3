// packages/nextjs/hooks/useMessagePosting.ts
import { useState, useCallback } from 'react';
import { useScaffoldWriteContract } from '~~/hooks/scaffold-eth';

export interface PostingState {
    isPosting: boolean;
    currentStep: 'idle' | 'uploading' | 'confirming' | 'success' | 'error';
    error: string | null;
    progress: number; // 0-100
}

export interface MessageContent {
    text: string;
    author?: string;
    title?: string;
    tags?: string[];
}

export const useMessagePosting = (onSuccess?: () => void) => {
    const [state, setState] = useState<PostingState>({
        isPosting: false,
        currentStep: 'idle',
        error: null,
        progress: 0,
    });

    const { writeContractAsync: postMessage } = useScaffoldWriteContract({
        contractName: 'MessageBoard',
    });

    const uploadToIPFS = useCallback(async (content: MessageContent): Promise<string> => {
        const response = await fetch('/api/upload-to-ipfs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(content),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'IPFS 上傳失敗');
        }

        const data = await response.json();
        if (!data.success || !data.cid) {
            throw new Error('IPFS 回應格式錯誤');
        }

        return data.cid;
    }, []);

    const postMessageToBlockchain = useCallback(async (content: MessageContent) => {
        try {
            setState({
                isPosting: true,
                currentStep: 'uploading',
                error: null,
                progress: 10,
            });

            // Step 1: 上傳到 IPFS
            console.log('🚀 開始上傳到 IPFS...');
            const cid = await uploadToIPFS(content);
            console.log('✅ IPFS 上傳成功:', cid);

            setState(prev => ({
                ...prev,
                currentStep: 'confirming',
                progress: 50,
            }));

            // Step 2: 呼叫智能合約
            console.log('⛓️ 開始呼叫智能合約...');
            const txHash = await postMessage({
                functionName: 'postMessage',
                args: [cid],
            });

            console.log('📦 交易已提交:', txHash);
            
            // 設置成功狀態
            setState({
                isPosting: false,
                currentStep: 'success',
                error: null,
                progress: 100,
            });

            onSuccess?.();

            // 重置狀態
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    currentStep: 'idle',
                    progress: 0,
                }));
            }, 3000);

            console.log('✅ 智能合約呼叫成功');

        } catch (error: any) {
            console.error('❌ 發布留言失敗:', error);

            setState({
                isPosting: false,
                currentStep: 'error',
                error: error.message || '發布留言時發生未知錯誤',
                progress: 0,
            });
        }
    }, [uploadToIPFS, postMessage]);

    const reset = useCallback(() => {
        setState({
            isPosting: false,
            currentStep: 'idle',
            error: null,
            progress: 0,
        });
    }, []);

    return {
        state,
        postMessage: postMessageToBlockchain,
        reset,
    };
};