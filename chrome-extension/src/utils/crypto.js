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

    return `${saltB64}:${ivB64}:${ciphertextB64}`;
}

/**
 * Decrypts ciphertext using a password and optional security code.
 */
export async function decryptText(encryptedString, password, securityCode = '') {
    const parts = encryptedString.split(':');
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
 * Converts Base64 string back to Base64 (identity for emoji/natural decoding flow)
 */
export function fromEmoji(emojiString) {
    const emojis = Array.from(emojiString);
    return emojis.map(emoji => {
        const index = EMOJI_MAP.indexOf(emoji);
        return index !== -1 ? B64_CHARS[index] : emoji;
    }).join('');
}

// Natural Language Stealth Mapping
export const NATURAL_DICTIONARY = [
    "about", "above", "across", "act", "active", "activity", "add", "afraid", "after", "again", "age", "ago", "agree", "air", "all", "alone", "along", "already", "always", "am", "amount", "ancient", "and", "angry", "another", "answer", "any", "anyone", "anything", "anytime", "appear", "apple", "are", "area", "arm", "army", "around", "arrive", "art", "as", "ask", "at", "attack", "aunt", "autumn", "away", "baby", "back", "bad", "bag", "ball", "bank", "base", "basket", "bath", "be", "bean", "bear", "beautiful", "bed", "bedroom", "beer", "before", "begin", "bell", "below", "beside", "best", "better", "between", "big", "bird", "birth", "bit", "bite", "black", "block", "blood", "blow", "blue", "board", "boat", "body", "bone", "book", "border", "born", "borrow", "both", "bottle", "bottom", "bowl", "box", "boy", "branch", "bread", "break", "breakfast", "bridge", "bright", "bring", "brother", "brown", "brush", "build", "burn", "bus", "business", "busy", "but", "butter", "buy", "by", "cake", "call", "can", "candle", "cap", "car", "card", "care", "careful", "careless", "carry", "case", "cat", "catch", "central", "century", "certain", "chair", "chance", "change", "chase", "cheap", "cheese", "chicken", "child", "children", "chocolate", "choose", "circle", "city", "class", "clean", "clear", "clever", "clock", "close", "cloth", "cloud", "cloudy", "coat", "coffee", "coin", "cold", "collect", "color", "comb", "come", "comfort", "common", "compare", "complete", "computer", "condition", "continue", "control", "cook", "cool", "copper", "corn", "corner", "correct", "cost", "count", "country", "course", "cover", "cow", "crash", "cross", "cry", "cup", "cupboard", "cut", "dance", "danger", "dangerous", "dark", "dash", "daughter", "day", "dead", "deep", "deer", "desk", "did", "die", "different", "difficult", "dig", "dinner", "dirty", "dish", "do", "dog", "door", "dot", "double", "down", "draw", "dream", "dress", "drink", "drive", "drop", "dry", "duck", "during", "each", "eagle", "ear", "early", "earth", "east", "easy", "eat", "edge", "education", "egg", "eight", "either", "elephant", "else", "empty", "end", "enemy", "enjoy", "enough", "enter", "equal", "entrance", "escape", "even", "evening", "ever", "every", "everyone",
    "everything", "everywhere", "exact", "example", "except", "excited", "exercise", "expect", "expensive", "explain", "eye", "face", "fact", "fair", "fall", "family", "famous", "far", "farm", "fast", "fat", "father", "favorite", "fear", "feel", "fellow", "few", "field", "fight", "fill", "film", "find", "fine", "finger", "finish", "fire", "first", "fish", "five", "fix", "flag", "flat", "float", "floor", "flower", "fly", "fold", "follow", "food", "foot", "football", "for", "force", "foreign", "forest", "forget", "forgive", "fork", "form", "forward", "four", "free", "fresh", "friend", "friendly", "from", "front", "fruit", "full", "fun", "funny", "furniture", "further", "future", "game", "garden", "gate", "general", "gentle", "get", "gift", "girl", "give", "glad", "glass", "go", "goat", "gold", "good", "goodbye", "grandfather", "grandmother", "grass", "gray", "great", "green", "ground", "group", "grow", "guess", "gun", "guy", "habit", "hair", "half", "hall", "hammer", "hand", "happen", "happy", "hard", "hat", "hate", "have", "he", "head", "healthy", "hear", "heart", "heavy", "hello", "help", "here", "hide", "high", "hill", "him", "his", "hit", "hobby", "hold", "hole", "holiday", "home", "hope", "horse", "hospital", "hot", "hotel", "hour", "house", "how", "however", "huge", "human", "hundred", "hungry", "hurry", "hurt", "husband", "ice", "idea", "if", "ill", "important", "in", "increase", "inside", "instead", "into", "invent", "iron", "is", "island", "it", "its", "jacket", "jam", "job", "join", "juice", "jump", "just", "keep", "key", "kill", "kind", "king", "kitchen", "knee", "knife", "knock", "know", "lady", "lamp", "land", "large", "last", "late", "laugh", "lazy", "lead", "leaf"
];

/**
 * Converts any string (including colon-separated B64) to Natural Language sentence.
 */
export function toNatural(inputString) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(inputString);

    const words = [];
    for (let i = 0; i < bytes.length; i++) {
        const word = NATURAL_DICTIONARY[bytes[i]];
        // Fallback for safety, though TextEncoder bytes for standard strings are 0-255
        words.push(word || "💠");
    }

    // Capitalize first, add period
    if (words.length > 0) {
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }
    return words.join(' ') + '.';
}

/**
 * Converts Natural Language sentence back to the original string.
 */
export function fromNatural(sentence) {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    const bytes = [];
    
    for (const word of words) {
        const index = NATURAL_DICTIONARY.indexOf(word);
        if (index !== -1) {
            bytes.push(index);
        }
    }

    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
}

/**
 * Heuristic to detect if text is Natural Language encrypted.
 */
export function isNaturalHeuristic(text) {
    if (!text || text.length < 12) return false;
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    if (words.length < 3) return false;

    let dictMatchCount = 0;
    for (const word of words) {
        if (NATURAL_DICTIONARY.includes(word)) {
            dictMatchCount++;
        }
    }

    const ratio = dictMatchCount / words.length;
    // Stealth messages should have 100% dictionary words (aside from punctuation)
    // but we allow 80% to be safe against minor artifacts or filler word ideas
    return ratio > 0.85;
}
