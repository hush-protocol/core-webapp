import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as vetkd from "ic-vetkd-utils";
import { toHexString } from "@dfinity/candid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function shortenAddress(address: string, length: number = 4): string {
  if (address.length <= length * 2 + 2) {
    return address; // No need to shorten if the address is already short
  }

  const start = address.substring(0, length + 2); // Include '0x'
  const end = address.substring(address.length - length);

  return `${start}...${end}`;
}


export const hex_decode = (hexString:string) => {
  const matches = hexString.match(/.{1,2}/g);
  if (matches) {
    console.log(matches,"matchseee")
    return Uint8Array.from(matches.map((byte) => parseInt(byte, 16)));
  }
  console.log("SJkflsdlfjkd")
  return new Uint8Array(0);
};
export const hex_encode = (bytes:Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');


export function stringToUint8Array(str:string) {
  // Encode string to UTF-8
  const utf8Encoder = new TextEncoder();
  const bytes = utf8Encoder.encode(str);
  
  // Create Uint8Array from the UTF-8 encoded bytes
  const uint8Array = new Uint8Array(bytes);
  
  return uint8Array;
}