const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  //Private Key: 8fe6277f1f1cef512008640b87a6995b5f04ae6d8fba2e915093512393397503
  "de66cbd824026006bbd92f0832dee42d7204f5fde851fe708575123223da0f34": 100,

  //Private Key: ed26eec182cfbde7c3b68e5c9837b10c2ad9478fc09d2bb25e5505b46a43e653
  "2df7d0f50a5f2207591e8e76c5c748a2dfe5676046a8908231260cfa92b96329": 50,

  //Private Key: f22caab436d4d44bf44152d7025ad0d777362779100c29ca394a326fa34fa970
  "78a386bc402b208d7880a5e4e2e73d22efba4ca7adab1edc07b285e60afa9106": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {

  const { signature, sender, recipient, amount } = req.body;
  
  const message = JSON.stringify({
    sender,
    amount,
    recipient,
  });
  const msgHash = keccak256(utf8ToBytes(message));

  let signedMessage = JSON.parse(signature);
  signedMessage.r = BigInt(signedMessage.r)
  signedMessage.s = BigInt(signedMessage.s)
  const signatureForRecovery = new secp.secp256k1.Signature(signedMessage.r, signedMessage.s, signedMessage.recovery);
  const derivedSender = toHex(keccak256(signatureForRecovery.recoverPublicKey(msgHash).toRawBytes()));

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if(derivedSender != sender) {
      res.status(400).send({ message: "The sender is different from the signed message" });
    }
    else if (balances[derivedSender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[derivedSender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[derivedSender] });
    }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
