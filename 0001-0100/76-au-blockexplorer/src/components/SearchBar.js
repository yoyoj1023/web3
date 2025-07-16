import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();

  const handleSearch = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!searchTerm.trim()) {
      setErrorMessage('請輸入搜尋內容');
      return;
    }

    const cleanedTerm = searchTerm.trim();

    // 搜尋邏輯
    // 1. 區塊號碼 (純數字)
    if (/^\d+$/.test(cleanedTerm)) {
      history.push(`/block/${cleanedTerm}`);
      return;
    }

    // 2. 交易哈希 (0x 開頭的 66 字元)
    if (/^0x([A-Fa-f0-9]{64})$/.test(cleanedTerm)) {
      history.push(`/tx/${cleanedTerm}`);
      return;
    }

    // 3. 以太坊地址 (0x 開頭的 42 字元)
    if (/^0x([A-Fa-f0-9]{40})$/.test(cleanedTerm)) {
      history.push(`/address/${cleanedTerm}`);
      return;
    }

    // 搜尋項不符合任何格式
    setErrorMessage('無效的搜尋項。請輸入有效的區塊號碼、交易哈希或以太坊地址。');
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          className="search-input"
          placeholder="搜尋區塊號碼、交易哈希或地址"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="search-button">
          搜尋
        </button>
      </form>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default SearchBar; 