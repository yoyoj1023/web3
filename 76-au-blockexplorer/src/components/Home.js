import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { utils } from 'ethers';

const Home = ({ alchemy }) => {
  const [latestBlocks, setLatestBlocks] = useState([]);
  const [latestTransactions, setLatestTransactions] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 獲取最新區塊號碼
        const blockNumber = await alchemy.core.getBlockNumber();
        
        // 獲取最新的10個區塊
        const blockPromises = [];
        for (let i = 0; i < 10; i++) {
          if (blockNumber - i >= 0) {
            blockPromises.push(alchemy.core.getBlock(blockNumber - i));
          }
        }
        const blocks = await Promise.all(blockPromises);
        setLatestBlocks(blocks);

        // 獲取最新區塊的交易
        const blockWithTxs = await alchemy.core.getBlockWithTransactions(blockNumber);
        setLatestTransactions(blockWithTxs.transactions.slice(0, 10)); // 只取前 10 筆交易
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('獲取數據時發生錯誤。請稍後再試。');
        setLoading(false);
      }
    };

    fetchData();

    // 每 15 秒更新一次數據
    const intervalId = setInterval(fetchData, 15000);
    
    // 清理定時器
    return () => clearInterval(intervalId);
  }, [alchemy]);

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

  return (
    <div>
      <div className="home-section">
        <h2>最新區塊</h2>
        <div className="block-list">
          {latestBlocks.map((block, index) => (
            <div key={`block-${block.number}`} className="block-item">
              <div>
                <strong>區塊號碼:</strong>{' '}
                <Link to={`/block/${block.number}`} className="block-link">
                  {block.number}
                </Link>
              </div>
              <div>
                <strong>時間戳:</strong> {formatDistanceToNow(new Date(block.timestamp * 1000))} 前
              </div>
              <div>
                <strong>交易數:</strong> {block.transactions.length}
              </div>
              <div>
                <strong>挖礦者:</strong>{' '}
                <Link to={`/address/${block.miner}`} className="address-link">
                  {formatAddress(block.miner)}
                </Link>
              </div>
              <div>
                <strong>氣體費用:</strong> {parseInt(block.gasUsed.toString()).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="home-section">
        <h2>最新交易</h2>
        <div className="tx-list">
          {latestTransactions.map((tx) => (
            <div key={tx.hash} className="tx-item">
              <div>
                <strong>交易哈希:</strong>{' '}
                <Link to={`/tx/${tx.hash}`} className="tx-link">
                  {formatAddress(tx.hash)}
                </Link>
              </div>
              <div>
                <strong>從:</strong>{' '}
                {tx.from ? (
                  <Link to={`/address/${tx.from}`} className="address-link">
                    {formatAddress(tx.from)}
                  </Link>
                ) : 'N/A'}
              </div>
              <div>
                <strong>至:</strong>{' '}
                {tx.to ? (
                  <Link to={`/address/${tx.to}`} className="address-link">
                    {formatAddress(tx.to)}
                  </Link>
                ) : '合約創建'}
              </div>
              <div>
                <strong>值:</strong> {formatEther(tx.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 