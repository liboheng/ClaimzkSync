const axios = require('axios');
const randomUserAgent = require('random-useragent');
const {Wallet} = require("zksync-ethers");
const fs = require("fs");
const path = require("path");

/**
 * 读取私钥文件并返回私钥数组
 * @param {string} filePath - 私钥文件路径
 * @returns {string[]} 私钥数组
 */
const readPrivateKeys = (filePath) => {
    try {
        // 读取文件内容
        const data = fs.readFileSync(filePath, 'utf8');
        // 按行分割
        const lines = data.split('\n');
        // 去除换行符并检查私钥格式
        const privateArray = lines.map(line => {
            const privateKey = line.trim();
            if (privateKey.length === 0) {
                return null; // 跳过空行
            }
            return privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
        }).filter(Boolean); // 去除 null 值

        return privateArray;
    } catch (error) {
        console.error('Error reading private keys:', error);
        return [];
    }
};

async function getAirdropMerkleProof() {
    const filePath = path.join(__dirname, 'privateKey.txt');
    const privateArray = readPrivateKeys(filePath);
    const wallets = [];
    for (const privateKey of privateArray) {
        const wallet = new Wallet(privateKey);
        let address = wallet.address;
        let url = `https://api.zknation.io/eligibility?id=${address}`;
        let userAgent = randomUserAgent.getRandom();
        let config = {
            headers: {
                'Origin': 'https://claim.zknation.io',
                'Accept': '*/*',
                'X-Api-Key': '46001d8f026d4a5bb85b33530120cd38',
                userAgent: userAgent
            }
        };
        let response = await axios.get(url, config);
        let airData = response.data.allocations[0];
        let merkleProof = airData.merkleProof;
        let tokenAmount = airData.tokenAmount;
        let merkleIndex = airData.merkleIndex;
        wallets.push({address, privateKey, tokenAmount, merkleIndex, merkleProof});
    }
    await fs.promises.writeFile(path.join('wallets.json'), JSON.stringify(wallets, null, 2));
}

getAirdropMerkleProof()