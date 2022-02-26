const { ethers } = require("ethers");
var fs = require("fs");

const expres = require("express");
const app = expres();

let port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  // 0x44DD1abdA1bC003e073c5CA21BdCAB4EA91D9531
  //   galaxy celery fabric roof poem team hurt flavor wrap proud index choose
  //   console.log(req.query.mnemonic);
  let mnemonic = req.query.mnemonic;
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  console.log(wallet.address);

  res.send(wallet.address);
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
