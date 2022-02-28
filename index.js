const { ethers } = require("ethers");

const express = require("express");
const app = express();

let port = process.env.PORT || 3000;

app.get("/getAddress", (req, res) => {
  // 0x44DD1abdA1bC003e073c5CA21BdCAB4EA91D9531
  //   galaxy celery fabric roof poem team hurt flavor wrap proud index choose
  let mnemonic = req.query.mnemonic;
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);

  res.send(wallet.address);
});

app.get("/createWallet", (req, res) => {
  let wallet = ethers.Wallet.createRandom();
  let response = {
    address: wallet.address,
    mnemonic: wallet.mnemonic.phrase,
    privateKey: wallet.privateKey,
  };
  res.send(response);
});

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// http://localhost:3000/sendTransaction/?mnemonic=toilet skate together scheme shaft answer elder fence wasp reflect dawn paper&network=eth/ropsten&recipient=0x44DD1abdA1bC003e073c5CA21BdCAB4EA91D9531&amount=0.0001
// send transaction
// app.get("/sendTransaction", async (req, res) => {
//   // https://speedy-nodes-nyc.moralis.io/47ef2509ed164f0635b5048e/eth/ropsten
//   //
//   const connection = new ethers.providers.JsonRpcProvider(`https://speedy-nodes-nyc.moralis.io/47ef2509ed164f0635b5048e/${req.query.network}`);
//   const gasPrice = connection.getGasPrice();
//   const wallet = ethers.Wallet.fromMnemonic(req.query.mnemonic);

//   const signer = wallet.connect(connection);
//   const recipient = req.query.recipient;
//   const tx = {
//     from: wallet.address,
//     to: recipient,
//     value: ethers.utils.parseEther(req.query.amount),
//     gasPrice: gasPrice,
//     gasLimit: ethers.utils.hexlify(100000),
//     nonce: connection.getTransactionCount(wallet.address, "latest"),
//   };
//   const transaction = await signer.sendTransaction(tx);
//   console.log(transaction);
//   const receipt = await transaction.wait();
//   console.log(receipt);
//   res.send(receipt);
// });

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
server.timeout = 120000;
