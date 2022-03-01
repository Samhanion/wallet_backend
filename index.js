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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// http://localhost:3000/sendTransaction/?mnemonic=toilet skate together scheme shaft answer elder fence wasp reflect dawn paper&network=eth/rinkeby&recipient=0x44DD1abdA1bC003e073c5CA21BdCAB4EA91D9531&amount=1&contractAddress=0x814f11f6bd1a717b21849da13553d457056ddc9c
// send transaction
app.get("/sendTransaction", async (req, res) => {
  // https://speedy-nodes-nyc.moralis.io/47ef2509ed164f0635b5048e/eth/ropsten
  //
  const connection = new ethers.providers.JsonRpcProvider(`https://speedy-nodes-nyc.moralis.io/47ef2509ed164f0635b5048e/${req.query.network}`);
  const gasPrice = connection.getGasPrice();
  const wallet = ethers.Wallet.fromMnemonic(req.query.mnemonic);

  const signer = wallet.connect(connection);
  const recipient = req.query.recipient;
  // const tx = {
  //   from: wallet.address,
  //   to: recipient,
  //   value: ethers.utils.parseEther(req.query.amount),
  //   gasPrice: gasPrice,
  //   gasLimit: ethers.utils.hexlify(100000),
  //   nonce: connection.getTransactionCount(wallet.address, "latest"),
  // };
  // You can also use an ENS name for the contract address
  // const daiAddress = "dai.tokens.ethers.eth";

  // Connect to the contract
  // dai contract address
  // var contractAddress = "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa";
  // test contract address ( we created it for testing.. )
  // var contractAddress = "0x814f11f6bd1a717b21849da13553d457056ddc9c";
  var contractAddress = req.query.contractAddress;
  var contractAbiFragment = [
    {
      name: "transfer",
      type: "function",
      inputs: [
        {
          name: "_to",
          type: "address",
        },
        {
          type: "uint256",
          name: "_tokens",
        },
      ],
      constant: false,
      outputs: [],
      payable: false,
    },
  ];
  var contract = new ethers.Contract(contractAddress, contractAbiFragment, signer);

  // How many tokens?
  var numberOfDecimals = 18;
  var numberOfTokens = ethers.utils.parseUnits(req.query.amount, numberOfDecimals);

  // Send tokens
  contract.transfer(recipient, numberOfTokens).then(function (tx) {
    console.log(tx);
    res.send(tx);
  });
  // const transaction = await signer.sendTransaction(tx);
  // console.log(transaction);
  // res.send(transaction);
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
