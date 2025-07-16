import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { utils } from 'ethers';

const Address = ({ alchemy }) => {
  const { address } = useParams();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 格式化 ETH 值 (從 Wei 轉換為 ETH)
  const formatEther = (wei) => {
    if (!wei) return '0 ETH';
    return `${parseFloat(utils.formatEther(wei)).toFixed(6)} ETH`;
  };

  // 格式化地址：縮短顯示
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 格式化代幣數量
  const formatTokenBalance = (balance, decimals) => {
    if (!balance) return '0';
    return parseFloat(utils.formatUnits(balance, decimals)).toFixed(4);
  };

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 獲取地址餘額
        const ethBalance = await alchemy.core.getBalance(address);
        setBalance(ethBalance);

        // 嘗試獲取地址交易
        try {
          // 無法直接獲取全部交易，只試用 Alchemy 的資產 API 獲取代幣餘額
          const tokens = await alchemy.core.getTokenBalances(address);
          
          // 獲取每個代幣的元數據
          const tokenMetadataPromises = [];
          for (let i = 0; i < tokens.tokenBalances.length; i++) {
            const tokenData = tokens.tokenBalances[i];
            if (tokenData.tokenBalance !== '0') {
              const metadata = alchemy.core.getTokenMetadata(tokenData.contractAddress);
              tokenMetadataPromises.push(metadata);
            }
          }

          // 等待所有元數據獲取
          const tokenMetadata = await Promise.all(tokenMetadataPromises);
          
          // 整合代幣列表
          const formattedTokens = [];
          let j = 0;
          for (let i = 0; i < tokens.tokenBalances.length; i++) {
            const tokenData = tokens.tokenBalances[i];
            if (tokenData.tokenBalance !== '0') {
              formattedTokens.push({
                ...tokenMetadata[j],
                balance: tokenData.tokenBalance,
                contractAddress: tokenData.contractAddress
              });
              j++;
            }
          }
          
          setTokenBalances(formattedTokens);
        } catch (err) {
          console.error('Error fetching token balances:', err);
          // 代幣餘額獲取失敗不應導致整體清單
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching address data:', err);
        setError('獲取地址數據時發生錯誤。請稍後再試。');
        setLoading(false);
      }
    };

    fetchAddressData();
  }, [alchemy, address]);

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
    <div className="detail-container">
      <h2>地址詳情</h2>

      <div className="detail-card">
        <div className="detail-header">概覽</div>
        <div className="detail-row">
          <span className="detail-label">地址：</span>
          <span className="detail-value hash-value">{address}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">ETH 餘額：</span>
          <span className="detail-value">{formatEther(balance)}</span>
        </div>
      </div>

      {tokenBalances.length > 0 && (
        <div className="detail-card">
          <div className="detail-header">ERC-20 代幣 ({tokenBalances.length})</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>代幣</th>
                  <th>餘額</th>
                  <th>合約地址</th>
                </tr>
              </thead>
              <tbody>
                {tokenBalances.map((token) => (
                  <tr key={token.contractAddress}>
                    <td>
                      <div className="token-info">
                        {token.logo && (
                          <img
                            src={token.logo}
                            alt={token.name}
                            className="token-logo"
                            width="20"
                            height="20"
                          />
                        )}
                        <span>
                          {token.name || 'Unknown Token'} ({token.symbol || '?'})
                        </span>
                      </div>
                    </td>
                    <td>
                      {formatTokenBalance(token.balance, token.decimals)}
                    </td>
                    <td>
                      <Link to={`/address/${token.contractAddress}`} className="address-link">
                        {formatAddress(token.contractAddress)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="detail-note">
        <p>注意事項：</p>
        <ul>
          <li>由於以太坊網絡 API 的限制，無法在瀏覽器中顯示全部交易歷史。</li>
          <li>如需查看完整的交易歷史，請使用如 Etherscan 之類的完整區塊瀏覽器。</li>
        </ul>
      </div>
    </div>
  );
};

export default Address; 