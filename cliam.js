const {Wallet, Provider} = require("zksync-ethers");
const fs = require("fs");
const path = require("path");
const {ethers} = require("ethers");

const filePath = path.join(__dirname, 'wallets.json');
const provider = new Provider('https://greatest-frequent-grass.zksync-mainnet.quiknode.pro/30fb80ed89893998db41c4f3722bad7c36e969e4/');

const contractAddress = '0x66Fd4FC8FA52c9bec2AbA368047A0b27e24ecfe4';
const contractABI = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_index",
                "type": "uint256"
            },
            {
                "name": "_amount",
                "type": "uint256"
            },
            {
                "name": "_merkleProof",
                "type": "bytes32[]"
            }
        ],
        "name": "claim",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];


// 读取并解析 JSON 文件
fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        return;
    }

    try {
        const arrayObject = JSON.parse(data);
        for (let arrayObjectElement of arrayObject) {
            console.log('领取钱包：', arrayObjectElement.address)
            const privateKey = arrayObjectElement.privateKey;
            let wallet = new Wallet(privateKey, provider);
            const contract = new ethers.Contract(contractAddress, contractABI, wallet);
            let _index = arrayObjectElement.merkleIndex;
            let _amount = arrayObjectElement.tokenAmount;
            let _merkleProof = arrayObjectElement.merkleProof;

            try {

                const tx = await contract.claim(_index, _amount, _merkleProof, {
                    gasLimit: 210000
                });

                console.log('Transaction sent:', tx.hash);

                // 等待交易确认
                const receipt = await tx.wait();
                console.log('Transaction confirmed:', receipt.transactionHash);
            } catch (error) {
                if (error.error && error.error.data) {
                    console.error('Detailed Error:', error.error.data);
                } else {
                    console.error('Error calling contract method:', error);
                }
            }

        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
});