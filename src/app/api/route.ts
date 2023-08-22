import crypto from 'crypto';
import { NextResponse } from 'next/server';

interface Wallet {
  address: string;
  privateKey: string;
}

interface Auth {
  access_token: string;
}

function encryptPrivateKey(privateKey: string, password: string): { salt: string; iv: string; ciphertext: string } {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(privateKey), cipher.final()]);
  return {
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    ciphertext: encrypted.toString('base64'),
  };
}

async function uploadBackup(wallet: Wallet, password: string, auth: Auth) {
  const boundary = "b0uNd4ry";
  const fileMetadata = {
    name: `qubit-backup-${wallet.address}`,
    mimeType: "application/json",
  };

  const fileData = {
    publicKey: wallet.address,
    privateKey: encryptPrivateKey(wallet.privateKey, password),
  };

  const multipartBody =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(fileMetadata) +
    `\r\n--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(fileData) +
    `\r\n--${boundary}--`;

  try {
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body: multipartBody,
    });

    const data = await res.json();
    console.log(data, "data");
    return data;
  } catch (e) {
    console.error(e);
    return e;
  }
}


export const POST = async (request: Request) => {
  const { wallet, password, auth } = await request.json()

  const data = await uploadBackup(wallet, password, auth);

  return NextResponse.json({ data })
};
