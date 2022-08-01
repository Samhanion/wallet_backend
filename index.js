const { ethers } = require("ethers");
const axios = require("axios");
// const passport = require("passport");
const express = require("express");
// const session = require("express-session");
const { TwitterApi } = require("twitter-api-v2");
const jimp = require("jimp");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const Web3 = require("web3");

const app = express();

var bodyParser = require("body-parser");
var cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Decentrelon API",
      version: "1.0.0",
    },
  },
  apis: ["index.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let port = process.env.PORT || 3001;

// TODO : make sure all responses have the correct statstus code

/**
 * @swagger
 * /status:
 *  get:
 *   description: Checks whether the server is running or not
 *   responses:
 *    '200':
 *     description: Successfully retrieved address
 */
app.get("/status", (req, res) => {
  return res.status(200).send({ status: "Up and running" });
});

app.get("/twitter", async (req, res) => {
  try {
    const client = new TwitterApi({
      appKey: "Yi4jGDCyAmdbskxkPSfo7HUhL",
      appSecret: "sLOZNPU4nvFn10PLMiDE802RRa85D5mQCz3QFbyin5hCDtpOVr",
      // accessToken: "1502747448120430601-F56GryQb02UVewXDunYBtjSRIBev5N",
      // accessSecret: "c7c2lfERKBvriXpj4Ql5AMZP7qlEXUCU8dufyU0p9WqpX",
      accessToken: req.query.accessToken,
      accessSecret: req.query.accessSecret,
    });
    const client_rw = client.readWrite;

    const tweetImg = await jimp.read("./walter_claim_tweet.jpg");
    const profileImg = await jimp.read(req.query.profileImg);
    // const mask = await jimp.read("./rounded_borders.jpg");

    // profileImg.mask(mask, 0, 0).write("masked.png", console.log);

    profileImg.resize(900, 900);
    // profileImg.circle({ x: 0, y: 0 });
    profileImg.circle();

    let nameFont = await jimp.loadFont(jimp.FONT_SANS_128_BLACK);
    tweetImg.print(nameFont, 1330, 1980, `@${req.query.username}`);
    let potentialFont = await jimp.loadFont(jimp.FONT_SANS_128_WHITE);
    tweetImg.print(potentialFont, 1430, 2260, `${req.query.potential}`);
    let tokenFont = await jimp.loadFont(jimp.FONT_SANS_128_BLACK);
    tweetImg.print(tokenFont, 1150, 2490, `+ Walter Tokens`);
    tweetImg.composite(profileImg, 1170, 960);

    // tweetImg.resize(400, 400);
    tweetImg.write("claim.jpg");

    setTimeout(async () => {
      const mediaIds = await Promise.all([
        // file path
        client.v1.uploadMedia("./claim.jpg"),
        // from a buffer, for example obtained with an image modifier package
        // client.v1.uploadMedia(Buffer.from(rotatedImage), { type: "png" }),
      ]);
      console.log(mediaIds);
      // let tweet = await client_rw.v1.tweet(req.query.tweet);
      // let tweet = await client_rw.v1.tweet("Test Tweet 20");
      let tweetText = req.query.tweet;
      let tweet = await client_rw.v1.tweet(tweetText, { media_ids: mediaIds });

      let user = await client_rw.v2.me();
      console.log("user", user);
      console.log("tweet", tweet);

      console.log(tweet.id_str);
      // let tweetId = tweet.id.toString();

      return res.send(tweet);
    }, 1000);
  } catch (error) {
    return res.send(error);
  }
});
app.post("/metrics", async (req, res) => {
  const client = new TwitterApi({
    appKey: "Yi4jGDCyAmdbskxkPSfo7HUhL",
    appSecret: "sLOZNPU4nvFn10PLMiDE802RRa85D5mQCz3QFbyin5hCDtpOVr",
    // accessToken: "1502747448120430601-F56GryQb02UVewXDunYBtjSRIBev5N",
    // accessSecret: "c7c2lfERKBvriXpj4Ql5AMZP7qlEXUCU8dufyU0p9WqpX",
    accessToken: req.body.accessToken,
    accessSecret: req.body.accessSecret,
  });
  console.log("body.....", req.body);
  const client_rw = client.readWrite;

  try {
    const tweetData = await client_rw.v1.singleTweet(req.body.tweetId);
    return res.send(tweetData);
  } catch (error) {
    return res.send(error);
  }
});
//
// app.get("/auth", passport.authenticate("twitter"));

// app.get("/auth/callback", passport.authenticate("twitter", { failureRedirect: "/login" }), function (req, res) {
//   // Successful authentication, redirect home.
//   res.redirect("/");
// });
// app.get("/auth/callback", passport.authenticate("twitter"), (req, res) => {
//   console.log(req.user);
//   res.send(req.user);
// });

// login route
// app.get("/login", (req, res) => {
//   res.send("login");
// });

// // home route
// app.get("/", (req, res) => {
//   res.send("home");
// });
// air droping
app.get("/airdrop", async (req, res) => {
  try {
    let twitterName = req.query.name;
    let twitterId = await axios({
      url: `https://api.twitter.com/2/users/by/username/${twitterName}`,
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer AAAAAAAAAAAAAAAAAAAAAMnFaQEAAAAA96vmdQ7QkVlw4CjRNHtIa5kshwQ%3DzREAjqbqtd3zr3IqjNlyCAoRjNt4hLEI2ZexzIMSPHvUsZ8JHL",
      },
    });
    console.log(twitterId.data.data);
    twitterId = twitterId.data.data.id;

    let followers = await axios({
      url: `https://api.twitter.com/2/users/${twitterId}?user.fields=public_metrics`,
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer AAAAAAAAAAAAAAAAAAAAAMnFaQEAAAAA96vmdQ7QkVlw4CjRNHtIa5kshwQ%3DzREAjqbqtd3zr3IqjNlyCAoRjNt4hLEI2ZexzIMSPHvUsZ8JHL",
      },
    });
    followers = followers.data.data.public_metrics.followers_count;
    console.log(followers);

    // getting the date exactly one month prior to now
    let date = new Date();
    date.setMonth(date.getMonth() - 1);
    let dateUTC = date.toISOString();
    // let date = new Date();
    // date.setHours(date.getHours() - 24);
    // let dateUTC = date.toISOString();

    let url = `https://api.twitter.com/2/users/${twitterId}/tweets?tweet.fields=public_metrics&start_time=${dateUTC}&max_results=100`;
    let tweetsIds = [];
    let tweets = [];
    let likeCount = 0;
    let qouteCount = 0;
    let replyCount = 0;

    // let result = await axios({
    //   url: url,
    //   method: "GET",
    //   headers: {
    //     Accept: "application/json",
    //     Authorization: "Bearer AAAAAAAAAAAAAAAAAAAAAMnFaQEAAAAA96vmdQ7QkVlw4CjRNHtIa5kshwQ%3DzREAjqbqtd3zr3IqjNlyCAoRjNt4hLEI2ZexzIMSPHvUsZ8JHL",
    //   },
    // });
    // console.log(result.data);

    for (; 1 < 2; ) {
      //  getting all tweets from the last month till now
      let result = await axios({
        url: url,
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer AAAAAAAAAAAAAAAAAAAAAMnFaQEAAAAA96vmdQ7QkVlw4CjRNHtIa5kshwQ%3DzREAjqbqtd3zr3IqjNlyCAoRjNt4hLEI2ZexzIMSPHvUsZ8JHL",
        },
      });
      // console.log(result.data.data);
      if (result.data.data) {
        for (let i = 0; i < result.data.data.length; i++) {
          tweetsIds.push(result.data.data[i].id);
          tweets.push(result.data.data[i]);
          likeCount += result.data.data[i].public_metrics.like_count;
          qouteCount += result.data.data[i].public_metrics.quote_count;
          replyCount += result.data.data[i].public_metrics.reply_count;
        }
      }
      // console.log(tweetsIds);
      if (result.data.meta.next_token == undefined) {
        break;
      } else {
        let pagination_token = result.data.meta.next_token;
        // console.log(pagination_token);
        if (!url.includes("pagination_token")) url += `&pagination_token=${pagination_token}`;
        else url = url.split("&pagination_token=")[0] + `&pagination_token=${pagination_token}`;
      }
      // console.log(result.data.meta);
    }
    console.log(tweetsIds.length);
    console.log(tweets);
    console.log("likeCount ", likeCount);
    console.log("qouteCount ", qouteCount);
    console.log("replyCount ", replyCount);
    let airdrop = {
      followers: followers,
      likeCount: likeCount,
      qouteCount: qouteCount,
      replyCount: replyCount,
    };
    return res.send(airdrop);
  } catch (error) {
    return res.send(error);
  }
});
/**
 * @swagger
 * /address:
 *  post:
 *   description: Get wallet address of the user
 *   parameters:
 *   - name: Mnemonic
 *     description: Mnemonic of the user in Json format
 *     example: {mnemonic : "galaxy celery fabric room poem team hurt flavor wrap proud index choose"}
 *     in: body
 *     required: true
 *   responses:
 *    '200':
 *     description: Successfully retrieved address
 */
app.post("/address", (req, res) => {
  try {
    // the one that has some binance balance
    // 0x44DD1abdA1bC003e073c5CA21BdCAB4EA91D9531
    // galaxy celery fabric roof poem team hurt flavor wrap proud index choose
    if (!ethers.utils.isValidMnemonic(req.body.mnemonic)) return res.send("Invalid Mnemonic");
    let mnemonic = req.body.mnemonic;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    return res.send(wallet.address);
  } catch (error) {
    return res.send(error);
  }
});
/**
 * @swagger
 * /create-wallet:
 *  get:
 *   description: create a new wallet for new users
 *   responses:
 *    '200':
 *     description: Successfully retrieved address
 */
app.get("/create-wallet", (req, res) => {
  let wallet = ethers.Wallet.createRandom();
  let response = {
    address: wallet.address,
    mnemonic: wallet.mnemonic.phrase,
    privateKey: wallet.privateKey,
  };
  return res.send(response);
});

// FIXME : swagger sending the wrong data, make sure that it works
/**
 * @swagger
 * /send-transaction:
 *  post:
 *   description: send tokens to another user
 *   parameters:
 *   - name: network
 *     description: Network that you're sending across. Accepted values include ( "etheruem" , "polygon" , "mumbai" , "binance" )
 *     example:  "etheruem"
 *     in: body
 *     required: true
 *     type: string
 *   - name: mnenomic
 *     description: mnemonic of the user who's sending the tokens
 *     example:  "galaxy celery fabric roof poem team hurt flavor wrap proud index big"
 *     in: body
 *     required: true
 *     type: string
 *   - name: recipient
 *     description: address of the user who's receiving the tokens
 *     example:  "0x44DD1abdA1bC003e073c5CA21BdCAB4EA91D9531"
 *     in: body
 *     required: true
 *     type: string
 *   - name: contractAddress
 *     description: address of the token contract
 *     example:  "0x814f11f6bd1a717b21849da13553d457056ddc9c"
 *     in: body
 *     required: true
 *     type: string
 *   - name: amount
 *     description: amount of tokens to be sent
 *     example:  "1"
 *     in: body
 *     required: true
 *     type: string
 *   responses:
 *    '200':
 *     description: Successfully retrieved address
 */
app.post("/send-transaction", async (req, res) => {
  try {
    if (!req.body.mnemonic || !req.body.network || !req.body.recipient || !req.body.amount || !req.body.contractAddress) {
      return res.send("Missing parameters");
    } else {
      if (!ethers.utils.isValidMnemonic(req.body.mnemonic))
        return res.send("Invalid mnemonic. Please make sure you don't have an extra space or typo in your mnemonic");
      const network = req.body.network;
      const mnemonic = req.body.mnemonic;
      const recipient = req.body.recipient;
      const contractAddress = req.body.contractAddress;
      const amount = req.body.amount;

      let url;
      if (network == "etheruem") url = "https://eth-mainnet.g.alchemy.com/v2/BP8Dcnr48bv53KlJHCu7nvI3lPkqAUfK";
      else if (network == "polygon") url = "https://polygon-mainnet.g.alchemy.com/v2/GcrjPFNV5bUAOW3kfPKUVfjtQ_IEzdxm";
      else if (network == "mumbai") url = "https://polygon-mumbai.g.alchemy.com/v2/ZrDBV9VTrRh6TKZBnHQPILHZbHlPqwTk";
      else if (network == "binance") url = "https://black-silent-flower.bsc.discover.quiknode.pro/04d34bf1d786c2f9008b084285d59bccb42b5e76/";
      else return res.send("Invalid network. Accepted values include ( 'etheruem' , 'polygon' , 'mumbai' , 'binance' )");

      // TODO : check if recipient address is valid
      // web3.utils.isAddress(recipient)

      const connection = new ethers.providers.JsonRpcProvider(url);
      // const gasPrice = connection.getGasPrice();
      const wallet = ethers.Wallet.fromMnemonic(mnemonic);

      const signer = wallet.connect(connection);
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
      var numberOfTokens = ethers.utils.parseUnits(amount, numberOfDecimals);

      // Send tokens
      contract.transfer(recipient, numberOfTokens).then(function (tx) {
        console.log(tx);
        return res.send(tx);
      });
    }
  } catch (error) {
    return res.send(error);
  }

  // const transaction = await signer.sendTransaction(tx);
  // console.log(transaction);
  // res.send(transaction);
});

/**
 * @swagger
 * /swap:
 *  post:
 *   description: swap one token for another. MAKE SURE TO CALL THE /QUOTE ENDPOINT IN THE FRONT END FIRST BEFORE CALLING THIS ENDPOINT
 *   parameters:
 *   - name: network
 *     description: Network that you're swapping across. Accepted values include ( "etheruem" , "polygon" , "mumbai" , "binance" )
 *     example:  "etheruem"
 *     in: body
 *     required: true
 *     type: string
 *   - name: mnemomic
 *     description: mnemonic of the user who's swapping the tokens
 *     example:  "galaxy celery fabric roof poem team hurt flavor wrap proud index big"
 *     in: body
 *     required: true
 *     type: string
 *   - name: tokenIn
 *     description: contract address of the token you're selling
 *     example:  "0x6b175474e89094c44da98b954eedeac495271d0f"
 *     in: body
 *     required: true
 *     type: string
 *   - name: tokenOut
 *     description: contract address of the token you're receiving
 *     example:  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
 *     in: body
 *     required: true
 *     type: string
 *   - name: amount
 *     description: amount of tokens to be swapped
 *     example:  "1"
 *     in: body
 *     required: true
 *     type: string
 *   - name: slippage
 *     description: limit of price slippage you are willing to accept in percentage, may be set with decimals. &slippage=0.5 means 0.5% slippage is acceptable. Low values increase chances that transaction will fail, high values increase chances of front running. Set values in the range from 0 to 50. if not provided , default value is 0.5
 *     example: "0.5"
 *     in: body
 *     required: false
 *     type: string
 *   responses:
 *    '200':
 *     description: Successfully retrieved address
 */
app.post("/swap", async (req, res) => {
  // TODO : Make sure to hit the quote API first with the same paramters on the frontend
  try {
    if (!req.body.mnemonic || !req.body.network || !req.body.tokenIn || !req.body.amount || !req.body.tokenOut) {
      return res.send("Missing parameters");
    } else {
      if (!ethers.utils.isValidMnemonic(req.body.mnemonic))
        return res.send("Invalid mnemonic. Please make sure you don't have an extra space or typo in your mnemonic");
      const network = req.body.network;
      const mnemonic = req.body.mnemonic;
      const tokenIn = req.body.tokenIn;
      const tokenOut = req.body.tokenOut;
      const amount = Web3.utils.toWei(req.body.amount, "ether");
      const slippage = req.body.slippage || 0.5;
      // TODO : CHANGE REFERRER ADDRESS WITH THE ONE THAT IS GONNA FINALLY RECEIVE THE FEES
      const referrerAddress = "0xec6bb18E599B146E13f537e7145F721983A06e2e";
      const fee = "0.4";

      let url, networkId;
      if (network == "etheruem") (url = "https://eth-mainnet.g.alchemy.com/v2/BP8Dcnr48bv53KlJHCu7nvI3lPkqAUfK"), (networkId = 1);
      else if (network == "polygon") (url = "https://polygon-mainnet.g.alchemy.com/v2/GcrjPFNV5bUAOW3kfPKUVfjtQ_IEzdxm"), (networkId = 137);
      else if (network == "mumbai") return res.send("Swapping is not supported on testnets, please use polygon, etheruem or binance");
      else if (network == "binance")
        (url = "https://black-silent-flower.bsc.discover.quiknode.pro/04d34bf1d786c2f9008b084285d59bccb42b5e76/"), (networkId = 56);
      else return res.send("Invalid network. Please make sure your network value is one of the following: etheruem, polygon, mumbai, binance");

      const provider = new Web3.providers.HttpProvider(url);
      const web3 = new Web3(provider);
      let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
      console.log(mnemonicWallet.address);
      const PRIVATE_KEY = mnemonicWallet.privateKey; // Set private key of your wallet. Be careful! Don't share this key to anyone!
      const wallet = web3.eth.accounts.wallet.add(PRIVATE_KEY);

      // matic address
      // 0xCC42724C6683B7E57334c4E856f4c9965ED682bD

      // dai address

      console.log("tokenIn ", tokenIn);
      console.log("tokenOut ", tokenOut);
      console.log("amount ", amount);
      console.log("wallet.address ", wallet.address);

      // giving 1inch router a permission to access your tokenIn address
      const permission = await axios.get(`https://api.1inch.io/v4.0/${networkId}/approve/transaction?tokenAddress=${tokenIn}&amount=${amount}`);
      console.log("wallet allow amount adjusted: ", permission.data);
      const gasLimit = await web3.eth.estimateGas({
        ...permission.data,
        from: mnemonicWallet.address,
      });
      permission.data.gas = gasLimit;
      permission.data.from = mnemonicWallet.address;
      // get estimated gas
      console.log("permission transaction: ", permission.data);
      let tx = await web3.eth.sendTransaction(permission.data);
      if (tx.status) {
        console.log("Permission Granted! :)");
      }

      // const response = await axios.get(
      //   `https://api.1inch.exchange/v3.0/137/swap?fromTokenAddress=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&toTokenAddress=0x8f3cf7ad23cd3cadbd9735aff958023239c6a063&amount=1000000000000000000&fromAddress=${wallet.address}&slippage=0.1&disableEstimate=true`,
      // );
      const response = await axios.get(
        `https://api.1inch.io/v4.0/${networkId}/swap?fromTokenAddress=${tokenIn}&toTokenAddress=${tokenOut}&amount=${amount}&fromAddress=${wallet.address}&slippage=${slippage}&disableEstimate=true&referrerAddress=${referrerAddress}&fee=${fee}`,
      );
      if (response.data) {
        // res.send(response.data);
        let data = response.data;
        const gasLimit = await web3.eth.estimateGas({
          ...response.data.tx,
          from: mnemonicWallet.address,
        });
        //
        data.tx.gas = gasLimit;
        // get estimated gas
        console.log(data.tx);
        let tx = await web3.eth.sendTransaction(data.tx);
        if (tx.status) {
          console.log("Swap Successfull! :)");
          return res.send(tx);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.get("/sendAirdrop", async (req, res) => {
  try {
    // https://speedy-nodes-nyc.moralis.io/47ef2509ed164f0635b5048e/eth/ropsten
    const connection = new ethers.providers.JsonRpcProvider(`https://speedy-nodes-nyc.moralis.io/47ef2509ed164f0635b5048e/polygon/mumbai`);
    const gasPrice = connection.getGasPrice();

    // let privateKey = "0xfE9c0fE0D6b9101BB03D98F4daa0e1326CDEFc6A";
    let privateKey = "0xfc237f4bf6e3e840549a9bbec4c60d362acd68d628f862d638b29ea9d4c021ff";

    // let privateKey = "7c5a0c2e789ee03af4cc342586af897b56780207bcff695152a2bf3e4422f90d";

    let wallet = new ethers.Wallet(privateKey);
    // const wallet = ethers.Wallet.fromMnemonic("toilet skate together scheme shaft answer elder fence wasp reflect dawn paper");

    console.log(wallet.address);
    console.log(wallet.privateKey);

    const signer = wallet.connect(connection);
    const recipient = req.query.recipient;

    // var contractAddress = "0x96f6bfE284061d3233B69683E593db260B375016";

    // var contractAddress = "0x814F11f6bD1A717b21849da13553D457056DdC9C";

    // polygon contract address
    // var contractAddress = "0xfe4f5145f6e09952a5ba9e956ed0c25e3fa4c7f1"

    //binance contract address
    // var contractAddress = "0x0AB7A3464B3615bC41d006B38cd4f0B2F4038090";

    // mumbai contract address
    // var contractAddress = "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1";

    // walter token that I deployed myself
    var contractAddress = "0x26db60aab218e651e812cb36fb67f604015aa53b";

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

    // // How many tokens?
    var numberOfDecimals = 18;
    var numberOfTokens = ethers.utils.parseUnits(req.query.amount, numberOfDecimals);

    // // Send tokens
    contract.transfer(recipient, numberOfTokens).then(function (tx) {
      console.log(tx);
      return res.send(tx);
    });
  } catch (error) {
    return res.send(error);
  }
});
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
