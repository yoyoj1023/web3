import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { utils } from 'ethers';

const BlockDetails = ({ alchemy }) => {
  const { blockNumber } = useParams();
  const [blockData, setBlockData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 格式化 ETH 值 (從 Wei 轉換為 ETH)
  const formatEther = (wei) => {
    if (!wei) return '0 ETH';
    return `${parseFloat(utils.formatEther(wei)).toFixed(4)} ETH`;
  };

  // 格式化地址：縮短顯示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 格式化時間戳為可讀格式
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // 格式化區塊大小，轉換為 KB
  const formatSize = (size) => {
    return `${(size / 1024).toFixed(2)} KB`;
  };

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 獲取區塊詳情
        const block = await alchemy.core.getBlockWithTransactions(parseInt(blockNumber));
        setBlockData(block);
        setTransactions(block.transactions);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching block data:', err);
        setError('獲取區塊數據時發生錯誤。請稍後再試。');
        setLoading(false);
      }
    };

    fetchBlockData();
  }, [alchemy, blockNumber]);

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

  if (!blockData) {
    return <div className="error-message">找不到指定的區塊數據</div>;
  }

  return (
    <div className="detail-container">
      <h2>區塊 #{blockNumber} 詳情</h2>

      <div className="detail-card">
        <div className="detail-header">概覽</div>
        <div className="detail-row">
          <span className="detail-label">區塊高度：</span>
          <span className="detail-value">{blockData.number}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">時間戳：</span>
          <span className="detail-value">
            {formatTimestamp(blockData.timestamp)} ({formatDistanceToNow(new Date(blockData.timestamp * 1000))} 前)
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">交易數量：</span>
          <span className="detail-value">{blockData.transactions.length}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">礦工：</span>
          <span className="detail-value">
            <Link to={`/address/${blockData.miner}`} className="address-link">
              {blockData.miner}
            </Link>
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">區塊哈希：</span>
          <span className="detail-value hash-value">{blockData.hash}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">父區塊哈希：</span>
          <span className="detail-value hash-value">{blockData.parentHash}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Nonce：</span>
          <span className="detail-value">{blockData.nonce}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">難度：</span>
          <span className="detail-value">{parseInt(blockData.difficulty.toString()).toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">總難度：</span>
          <span className="detail-value">{parseInt(blockData._difficulty.toString()).toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Gas 限制：</span>
          <span className="detail-value">{parseInt(blockData.gasLimit.toString()).toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Gas 已使用：</span>
          <span className="detail-value">{parseInt(blockData.gasUsed.toString()).toLocaleString()} ({((parseInt(blockData.gasUsed) / parseInt(blockData.gasLimit)) * 100).toFixed(2)}%)</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">礦工數據：</span>
          <span className="detail-value hash-value">{blockData.extraData}</span>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-header">交易列表 ({blockData.transactions.length})</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>交易哈希</th>
                <th>發送方</th>
                <th>接收方</th>
                <th>值</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.hash}>
                  <td>
                    <Link to={`/tx/${tx.hash}`} className="tx-link">
                      {formatAddress(tx.hash)}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/address/${tx.from}`} className="address-link">
                      {formatAddress(tx.from)}
                    </Link>
                  </td>
                  <td>
                    {tx.to ? (
                      <Link to={`/address/${tx.to}`} className="address-link">
                        {formatAddress(tx.to)}
                      </Link>
                    ) : (
                      '合約創建'
                    )}
                  </td>
                  <td>{formatEther(tx.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlockDetails; 