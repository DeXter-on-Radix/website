import {
  Account,
  RadixDappToolkit,
  WalletDataPersonaData,
  Persona,
  SignedChallenge,
} from "@radixdlt/radix-dapp-toolkit";
import { array, object, z } from "zod";

export type Rdt = ReturnType<typeof RadixDappToolkit>;
export type WalletData = z.infer<typeof WalletData>;
export const WalletData = object({
  accounts: array(Account),
  personaData: array(WalletDataPersonaData),
  persona: Persona.optional(),
  proofs: array(SignedChallenge),
});