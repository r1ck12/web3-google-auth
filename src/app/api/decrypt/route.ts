import { NextResponse } from 'next/server';
import crypto from 'crypto';

interface DecryptionRequest {
  encryptedData: {
    salt: string;
    iv: string;
    ciphertext: string;
  };
  password: string;
}

function decryptPrivateKey(encryptedData: DecryptionRequest['encryptedData'], password: string): string {
  const { salt, iv, ciphertext } = encryptedData;

  try {
    const passwordBuffer = Buffer.from(password, 'utf-8');

    const saltBuffer = Buffer.from(salt, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');

    const derivedKey = crypto.pbkdf2Sync(passwordBuffer, saltBuffer, 100000, 32, 'sha256');

    const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, ivBuffer);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64')),
      decipher.final()
    ]);

    return decrypted.toString('utf-8');
  } catch (error) {
    console.error("Error during decryption:", error);
    throw new Error("Decryption failed");
  }
}


export const POST = async (request: Request) => {
  try {
    const { encryptedData, password }: DecryptionRequest = await request.json();

    const decryptedPrivateKey = decryptPrivateKey(encryptedData, password.toString());

    if (!encryptedData || !encryptedData.salt || !encryptedData.iv || !encryptedData.ciphertext || !password) {
      console.log("Invalid request:", { encryptedData, password });
      return NextResponse.json({ error: 'Invalid input' });
    }

    return NextResponse.json({ privateKey: decryptedPrivateKey });
  } catch (error) {
    return NextResponse.json({ error: 'Decryption failed', details: error })
  }
}
