import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer({ sender, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  
  const setValue = (setter) => (evt) => setter(evt.target.value);
  
  async function transfer(evt) {
    evt.preventDefault();
    const message = JSON.stringify({
      sender: sender,
      amount: parseInt(sendAmount),
      recipient,
    });
    const messageHash = keccak256(utf8ToBytes(message));
  const signedMessage = secp.secp256k1.sign(messageHash, privateKey);

  const signature = JSON.stringify({
    ...signedMessage,
    r: BigInt(signedMessage.r).toString(),
    s: BigInt(signedMessage.s).toString(),
    recovery: signedMessage.recovery,
  });


    try {
      
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature,
        sender: sender,
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Private Key
        <input
          placeholder="Type the private key of the sender"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
