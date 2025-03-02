import CryptoJS from "crypto-js";

export const generateEncryption = ({plaintext = "", signature = process.env.ENCRYPTION_SIGNATURE} = {}) => {
    const enctyption = CryptoJS.AES.encrypt(plaintext, signature).toString();
    return enctyption;
}

export const generateDecryption = ({cipherText = "", signature = process.env.ENCRYPTION_SIGNATURE} = {}) => {
    const decryption = CryptoJS.AES.decrypt(cipherText, signature).toString(CryptoJS.enc.Utf8);
    return decryption;
}