const { ethers } = require("ethers");
const axios = require("axios");
// const passport = require("passport");
const express = require("express");
// const session = require("express-session");
const { TwitterApi } = require("twitter-api-v2");
const jimp = require("jimp");
const app = express();

// const TwitterStrategy = require("passport-twitter");
// const key = require("./keys.js");

// app.use(session({ secret: "SECRET" })); // session secret
// app.use(session({ secret: "keyboard cat", key: "sid", cookie: { secure: false } })); // session secret

// app.use(passport.initialize());
// app.use(passport.session()); // persistent login sessions

// passport.use(
//   new TwitterStrategy(
//     {
//       consumerKey: key.consumerKey,
//       consumerSecret: key.consumerSecret,
//       // callbackURL: "http://localhost:3000/auth/callback",
//       callbackURL: "https://wallet-backend-api.herokuapp.com/auth/callback",
//     },
//     function (token, tokenSecret, profile, cb) {
//       console.log("callback funtion fired!");
//       console.log(profile);
//       return cb(null, profile);
//     },
//     // function (token, tokenSecret, profile, cb) {
//     //   User.findOrCreate({ twitterId: profile.id }, function (err, user) {
//     //     return cb(err, user);
//     //   });
//     // },
//   ),
// );
// passport.serializeUser(function (user, cb) {
//   cb(null, user);
// });

// deserialize
// passport.deserializeUser(function (obj, cb) {
//   cb(null, obj);
// });

let port = process.env.PORT || 3000;

// http://localhost:3000/twitter/?accessToken=1502747448120430601-F56GryQb02UVewXDunYBtjSRIBev5N&accessSecret=c7c2lfERKBvriXpj4Ql5AMZP7qlEXUCU8dufyU0p9WqpX&tweet=Test%20Tweet
app.get("/twitter", async (req, res) => {
  const client = new TwitterApi({
    appKey: "Yi4jGDCyAmdbskxkPSfo7HUhL",
    appSecret: "sLOZNPU4nvFn10PLMiDE802RRa85D5mQCz3QFbyin5hCDtpOVr",
    accessToken: "1502747448120430601-F56GryQb02UVewXDunYBtjSRIBev5N",
    accessSecret: "c7c2lfERKBvriXpj4Ql5AMZP7qlEXUCU8dufyU0p9WqpX",
    // accessToken: req.query.accessToken,
    // accessSecret: req.query.accessSecret,
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

    res.send(tweet.id_str);
  }, 1000);
});

app.get("/metrics", async (req, res) => {
  const client = new TwitterApi({
    appKey: "Yi4jGDCyAmdbskxkPSfo7HUhL",
    appSecret: "sLOZNPU4nvFn10PLMiDE802RRa85D5mQCz3QFbyin5hCDtpOVr",
    // accessToken: "1502747448120430601-F56GryQb02UVewXDunYBtjSRIBev5N",
    // accessSecret: "c7c2lfERKBvriXpj4Ql5AMZP7qlEXUCU8dufyU0p9WqpX",
    accessToken: req.query.accessToken,
    accessSecret: req.query.accessSecret,
  });
  const client_rw = client.readWrite;

  const tweetData = await client_rw.v1.singleTweet(req.query.tweetId);
  console.log("tweetData..", tweetData);
  res.send(tweetData);
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
//
// air droping
app.get("/airdrop", async (req, res) => {
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
  res.send(airdrop);

  // getting likes for each tweet
  // let likes = 0;
  // console.log("we're getting your likes please be patient..");
  // for (let i = 0; i < tweetsIds.length; i++) {
  //   let result = await axios({
  //     url: `https://api.twitter.com/2/tweets/${tweetsIds[i]}/?tweet.fields=public_metrics`,
  //     method: "GET",
  //     headers: {
  //       Accept: "application/json",
  //       Authorization: "Bearer AAAAAAAAAAAAAAAAAAAAAMnFaQEAAAAA96vmdQ7QkVlw4CjRNHtIa5kshwQ%3DzREAjqbqtd3zr3IqjNlyCAoRjNt4hLEI2ZexzIMSPHvUsZ8JHL",
  //     },
  //   });
  //   console.log(result.data.data.public_metrics.like_count);
  //   likes += result.data.data.public_metrics.like_count;
  // }
  // console.log(likes);

  // res.send(followers.toString());
});

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
app.get("/sendAirdrop", async (req, res) => {
  // https://speedy-nodes-nyc.moralis.io/47ef2509ed164f0635b5048e/eth/ropsten
  const connection = new ethers.providers.JsonRpcProvider(`https://speedy-nodes-nyc.moralis.io/47ef2509ed164f0635b5048e/polygon/mumbai`);
  const gasPrice = connection.getGasPrice();

  // let privateKey = "0xfE9c0fE0D6b9101BB03D98F4daa0e1326CDEFc6A";
  // let privateKey = "0xfc237f4bf6e3e840549a9bbec4c60d362acd68d628f862d638b29ea9d4c021ff";
  let privateKey = "7c5a0c2e789ee03af4cc342586af897b56780207bcff695152a2bf3e4422f90d";
  let wallet = new ethers.Wallet(privateKey);

  console.log(wallet.address);
  console.log(wallet.privateKey);

  const signer = wallet.connect(connection);
  const recipient = req.query.recipient;

  var contractAddress = "0x96f6bfE284061d3233B69683E593db260B375016";
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
    res.send(tx);
  });
});
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
