/**
 * AES-GCM encryption/decryption utilities using Web Crypto API.
 */

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // Standard for GCM
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

/**
 * Derives a crypto key from a simple string and salt.
 */
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        passwordKey,
        { name: ALGORITHM, length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts cleartext using a password and optional security code.
 * Format: ENC::[salt_base64]:[iv_base64]:[ciphertext_base64]
 */
export async function encryptText(text, password, securityCode = '') {
    const combinedPassword = password + securityCode;
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    const key = await deriveKey(combinedPassword, salt);
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(text);

    const ciphertext = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv: iv },
        key,
        encodedText
    );

    const saltB64 = btoa(String.fromCharCode(...salt));
    const ivB64 = btoa(String.fromCharCode(...iv));
    const ciphertextB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

    return `ENC::${saltB64}:${ivB64}:${ciphertextB64}`;
}

/**
 * Decrypts ciphertext using a password and optional security code.
 */
export async function decryptText(encryptedString, password, securityCode = '') {
    const cleanString = encryptedString.replace('ENC::', '');
    const parts = cleanString.split(':');
    if (parts.length < 3) {
        throw new Error('Invalid format: Encrypted string is malformed');
    }

    // Parts: [salt, iv, ciphertext]
    const salt = new Uint8Array(atob(parts[0]).split('').map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(atob(parts[1]).split('').map(c => c.charCodeAt(0)));
    const ciphertext = new Uint8Array(atob(parts[2]).split('').map(c => c.charCodeAt(0)));

    const combinedPassword = password + securityCode;
    const key = await deriveKey(combinedPassword, salt);

    try {
        const decrypted = await crypto.subtle.decrypt(
            { name: ALGORITHM, iv: iv },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (err) {
        throw new Error('Decryption failed. Incorrect key or security code.');
    }
}

// Emoji Steganography Mapping
const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const EMOJI_MAP = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", 
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", 
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", 
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😖", "😫", 
    "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", 
    "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", 
    "🤫", "🤥", "😶", "😐", "💠"
];

/**
 * Converts Base64 string to an Emoji string.
 */
export function toEmoji(base64) {
    return base64.split('').map(char => {
        const index = B64_CHARS.indexOf(char);
        return index !== -1 ? EMOJI_MAP[index] : char;
    }).join('');
}

/**
 * Converts an Emoji string back to Base64.
 */
export function fromEmoji(emojiString) {
    // Emojis vary in length (some are surrogate pairs), so we use Array.from or spread
    const emojis = Array.from(emojiString);
    return emojis.map(emoji => {
        const index = EMOJI_MAP.indexOf(emoji);
        return index !== -1 ? B64_CHARS[index] : emoji;
    }).join('');
}
