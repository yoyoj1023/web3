import { Alchemy, Network } from 'alchemy-sdk';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import './App.css';

// 組件
import Home from './components/Home';
import BlockDetails from './components/BlockDetails';
import TransactionDetails from './components/TransactionDetails';
import Address from './components/Address';
import SearchBar from './components/SearchBar';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY || 'ITQvRYFiUTS6lxnjJ2Gl3Cz7-BDgWUDP', // 使用環境變數或默認值
  network: Network.ETH_MAINNET,
};


// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>
            <Link to="/" className="header-link">以太坊區塊瀏覽器</Link>
          </h1>
          <SearchBar />
        </header>
        
        <main className="App-main">
          <Switch>
            <Route exact path="/">
              <Home alchemy={alchemy} />
            </Route>
            <Route path="/block/:blockNumber">
              <BlockDetails alchemy={alchemy} />
            </Route>
            <Route path="/tx/:txHash">
              <TransactionDetails alchemy={alchemy} />
            </Route>
            <Route path="/address/:address">
              <Address alchemy={alchemy} />
            </Route>
          </Switch>
        </main>
        
        <footer className="App-footer">
          <p>以太坊區塊瀏覽器 - AU課程專案</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
