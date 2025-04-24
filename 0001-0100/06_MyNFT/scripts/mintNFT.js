const { ethers } = require("hardhat");

async function main() {
    try {
        // 獲取合約工廠
        const MyNFT = await ethers.getContractFactory("MyNFT");
        
        // 獲取已部署的合約實例
        const nft = await MyNFT.attach("YOUR_DEPLOYED_CONTRACT_ADDRESS"); // 請替換為實際部署的合約地址
        
        console.log("NFT 合約地址:", nft.address);

        // 鑄造新的 NFT
        const tokenURI = "https://your-nft-metadata-uri.json"; // 替換為你的 NFT metadata URI
        console.log("開始鑄造 NFT...");
        
        const tx = await nft.mint(tokenURI);
        await tx.wait();
        
        // 獲取目前的 token 數量
        const tokenCount = await nft.tokenCount();
        console.log("鑄造成功! 當前 Token ID:", tokenCount.toString());
        
        // 獲取最新鑄造的 NFT 的 URI
        const mintedTokenURI = await nft.tokenURI(tokenCount);
        console.log("Token URI:", mintedTokenURI);

    } catch (error) {
        console.error("執行失敗:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });