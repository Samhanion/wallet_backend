const { ethers } = require("ethers");
var fs = require("fs");

const expres = require("express");
const app = expres();

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

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
