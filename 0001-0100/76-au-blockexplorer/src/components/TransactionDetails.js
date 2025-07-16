import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { utils } from 'ethers';

const TransactionDetails = ({ alchemy }) => {
  const { txHash } = useParams();
  const [txData, setTxData] = useState(null);
  const [txReceipt, setTxReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 格式化 ETH 值 (從 Wei 轉換為 ETH)
  const formatEther = (wei) => {
    if (!wei) return '0 ETH';
    return `${parseFloat(utils.formatEther(wei)).toFixed(6)} ETH`;
  };

  // 格式化時間戳為可讀格式
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // 交易狀態
  const getTransactionStatus = (receipt) => {
    if (!receipt) return '等待中';
    return receipt.status ? '成功' : '失敗';
  };

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 獲取交易資訊
        const transaction = await alchemy.core.getTransaction(txHash);
        setTxData(transaction);

        if (transaction) {
          // 獲取交易收據
          const receipt = await alchemy.core.getTransactionReceipt(txHash);
          setTxReceipt(receipt);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction data:', err);
        setError('獲取交易數據時發生錯誤。請稍後再試。');
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [alchemy, txHash]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!txData) {
    return <div className="error-message">找不到指定的交易</div>;
  }

  return (
    <div className="detail-container">
      <h2>交易詳情</h2>

      <div className="detail-card">
        <div className="detail-header">概覽</div>
        <div className="detail-row">
          <span className="detail-label">交易哈希：</span>
          <span className="detail-value hash-value">{txData.hash}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">狀態：</span>
          <span className="detail-value">
            {getTransactionStatus(txReceipt)}
            {txReceipt && txReceipt.status ? ' ✅' : txReceipt ? ' ❌' : ' ⏳'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">區塊：</span>
          <span className="detail-value">
            {txData.blockNumber ? (
              <Link to={`/block/${txData.blockNumber}`} className="block-link">
                {txData.blockNumber}
              </Link>
            ) : (
              '等待中'
            )}
          </span>
        </div>
        {txReceipt && txReceipt.timestamp && (
          <div className="detail-row">
            <span className="detail-label">時間戳：</span>
            <span className="detail-value">
              {formatTimestamp(txReceipt.timestamp)}
              {txReceipt.timestamp && ` (${formatDistanceToNow(new Date(txReceipt.timestamp * 1000))} 前)`}
            </span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">從：</span>
          <span className="detail-value">
            <Link to={`/address/${txData.from}`} className="address-link">
              {txData.from}
            </Link>
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">至：</span>
          <span className="detail-value">
            {txData.to ? (
              <Link to={`/address/${txData.to}`} className="address-link">
                {txData.to}
              </Link>
            ) : (
              '合約創建'
            )}
          </span>
        </div>
        {txReceipt && txReceipt.contractAddress && (
          <div className="detail-row">
            <span className="detail-label">創建的合約：</span>
            <span className="detail-value">
              <Link to={`/address/${txReceipt.contractAddress}`} className="address-link">
                {txReceipt.contractAddress}
              </Link>
            </span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">值：</span>
          <span className="detail-value">{formatEther(txData.value)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">交易費用：</span>
          <span className="detail-value">
            {txReceipt
              ? formatEther(txData.gasPrice.mul(txReceipt.gasUsed))
              : '計算中...'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Gas 價格：</span>
          <span className="detail-value">
            {parseFloat(utils.formatUnits(txData.gasPrice, 'gwei')).toFixed(2)} Gwei
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Gas 限制：</span>
          <span className="detail-value">{parseInt(txData.gasLimit.toString()).toLocaleString()}</span>
        </div>
        {txReceipt && (
          <div className="detail-row">
            <span className="detail-label">Gas 已使用：</span>
            <span className="detail-value">
              {parseInt(txReceipt.gasUsed.toString()).toLocaleString()} ({((parseInt(txReceipt.gasUsed) / parseInt(txData.gasLimit)) * 100).toFixed(2)}%)
            </span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Nonce：</span>
          <span className="detail-value">{txData.nonce}</span>
        </div>
        {txData.data && txData.data !== '0x' && (
          <div className="detail-row">
            <span className="detail-label">輸入數據：</span>
            <span className="detail-value hash-value">{txData.data}</span>
          </div>
        )}
      </div>

      {txReceipt && txReceipt.logs && txReceipt.logs.length > 0 && (
        <div className="detail-card">
          <div className="detail-header">事件日誌 ({txReceipt.logs.length})</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>索引</th>
                  <th>地址</th>
                  <th>主題</th>
                  <th>數據</th>
                </tr>
              </thead>
              <tbody>
                {txReceipt.logs.map((log, index) => (
                  <tr key={`${log.transactionHash}-${log.logIndex}`}>
                    <td>{index}</td>
                    <td>
                      <Link to={`/address/${log.address}`} className="address-link">
                        {`${log.address.slice(0, 6)}...${log.address.slice(-4)}`}
                      </Link>
                    </td>
                    <td>
                      {log.topics.length > 0 ? (
                        <span className="hash-value">{`${log.topics[0].slice(0, 10)}...`}</span>
                      ) : (
                        '無'
                      )}
                    </td>
                    <td>
                      {log.data && log.data !== '0x' ? (
                        <span className="hash-value">{`${log.data.slice(0, 10)}...`}</span>
                      ) : (
                        '無'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetails; 