import { Buffer } from "buffer";
import { KyberCoreStub } from "./core";
import { MLKEM } from "./mlkem";
import { KYBER512_PARAMS } from "./params";

function testMlKem() {
  const core = new KyberCoreStub(KYBER512_PARAMS);
  const mlkem = new MLKEM({ core });

  // Generate a fresh keypair
  // user 1
  const user1 = mlkem.keygen(); // ek is public that needs to be available

  //   console.log("Public Key (hex):", Buffer.from(ek).toString("hex"));
  //   console.log("Secret Key (hex):", Buffer.from(dk).toString("hex"));

  // Derive a deterministic keypair from a seed
  const seed = Buffer.from("0123456789abcdef0123456789abcdef", "hex");
  // user 2
  const derived = mlkem.deriveKeypair(seed);

  // console.log(
  //   "Derived Public Key (hex):",
  //   Buffer.from(derived.ek).toString("hex")
  // );
  // console.log(
  //   "Derived Secret Key (hex):",
  //   Buffer.from(derived.dk).toString("hex")
  // );

  const dd = mlkem.encaps(user1.ek); // ciphertext, shared secret
  // console.log("Ciphertext (hex):", bytesToString(dd.ct));
  // console.log("Shared secret (hex):", bytesToString(dd.ss));

  const ss = mlkem.decaps(derived.dk, dd.ct);
  const ss1 = mlkem.decaps(user1.dk, dd.ct);
  console.log(
    "Recovered shared secret (hex):",
    Buffer.from(ss).toString("hex")
  );

  // Verify that shared secrets match
  console.log(
    "Shared secrets match: ",
    Buffer.from(ss).equals(Buffer.from(ss1))
  );
}

testMlKem();
