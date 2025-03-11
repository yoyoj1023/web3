# 07_UpgradableCounter_Initializable Project

一、關於可升級合約：Initializable 
```
1.在可升級合約中，不能使用傳統的 constructor，因為建構子的程式碼只會在部署時執行一次
2.又在代理合約（Proxy）模式中，邏輯合約的建構子永遠不會被執行
因此需要 Initializable 的 initializer 來替代建構子，initializer 修飾器會確保建構函式只被執行一次
```

二、可升級合約的部屬

```javascript
  const counterV1 = await upgrades.deployProxy(CounterV1, [], {
    initializer: "initialize",
  });
```
```
deployProxy參數意義，實際上會部屬三個合約，依序為：
1.Implementation 合約（實際邏輯）
2.Proxy 合約（代理合約）
3.ProxyAdmin 合約（管理合約） 

initializer: "initialize" 代表指定 initialize() 作為代替的建構子
```

三、Solidity 語法說明：

```
1.在函數宣告添加 virtual 關鍵字，代表可被子合約覆寫
2.子合約覆寫父合約的函式時，需加上 override 關鍵字
3.virtual與override可以同時出現使用 
```