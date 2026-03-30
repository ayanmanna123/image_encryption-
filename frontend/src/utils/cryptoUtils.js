export const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const generatePRNG = (seed) => {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

const getSeedFromKey = async (secretKey) => {
  const msgUint8 = new TextEncoder().encode(secretKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = new Uint8Array(hashBuffer);
  const view = new DataView(hashArray.buffer);
  return view.getUint32(0);
};

export const encryptDecryptImage = async (file, secretKey) => {
  // 1. Generate key hash and seed for PRNG
  const seed = await getSeedFromKey(secretKey);

  const prng = generatePRNG(seed);

  // 2. Load image into canvas
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;

  // 3. XOR pixel data (RGB channels) using PRNG
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      // Generate a random byte (0-255) from the PRNG
      const randomByte = Math.floor(prng() * 256);
      data[i + j] ^= randomByte;
    }
    // Keep alpha channel full for visibility
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  
  // 4. Export as PNG (Lossless)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
};

export const encryptDecryptText = async (text, secretKey, isDecrypting = false) => {
  // 1. Generate key hash and seed for PRNG
  const seed = await getSeedFromKey(secretKey);
  const prng = generatePRNG(seed);

  let inputData;
  if (isDecrypting) {
    // Decode base64
    try {
      const decodedString = atob(text);
      inputData = new Uint8Array(decodedString.length);
      for (let i = 0; i < decodedString.length; i++) {
        inputData[i] = decodedString.charCodeAt(i);
      }
    } catch (e) {
      throw new Error('Invalid encrypted text format (Base64 expected).');
    }
  } else {
    inputData = new TextEncoder().encode(text);
  }

  const resultArray = new Uint8Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    const randomByte = Math.floor(prng() * 256);
    resultArray[i] = inputData[i] ^ randomByte;
  }

  if (isDecrypting) {
    return new TextDecoder().decode(resultArray);
  } else {
    // Return base64
    return btoa(String.fromCharCode(...resultArray));
  }
};

/**
 * Advanced Steganography: Hides an encrypted image inside another image.
 * Uses 4 bits LSB for storage capacity.
 */
export const hideImageInImage = async (secretFile, coverFile, secretKey) => {
  // 1. Setup PRNG for encryption
  const seed = await getSeedFromKey(secretKey);
  const prng = generatePRNG(seed);

  // 2. Load images
  const secretImg = await loadImage(secretFile);
  const coverImg = await loadImage(coverFile);

  const secretCanvas = document.createElement('canvas');
  secretCanvas.width = secretImg.width;
  secretCanvas.height = secretImg.height;
  const sCtx = secretCanvas.getContext('2d');
  sCtx.drawImage(secretImg, 0, 0);
  const sData = sCtx.getImageData(0, 0, secretImg.width, secretImg.height).data;

  const coverCanvas = document.createElement('canvas');
  coverCanvas.width = coverImg.width;
  coverCanvas.height = coverImg.height;
  const cCtx = coverCanvas.getContext('2d');
  cCtx.drawImage(coverImg, 0, 0);
  const cImageData = cCtx.getImageData(0, 0, coverImg.width, coverImg.height);
  const cData = cImageData.data;

  // Capacity check: 4 bits/channel, 3 channels = 12 bits per cover pixel.
  // We need 24 bits (RGB) per secret pixel.
  // So we need 2 cover pixels per secret pixel.
  // Plus metadata (32 bits for width, 32 bits for height) = 64 bits = ~6 pixels.
  const requiredPixels = (secretImg.width * secretImg.height * 2) + 10; 
  if (cData.length / 4 < requiredPixels) {
    throw new Error(`Cover image too small. Need at least ${Math.ceil(requiredPixels / coverImg.width)} rows, but have ${coverImg.height}.`);
  }

  // 3. Prepare bits to hide (Encrypted Secret Data)
  // Store Metadata first: width (16 bit), height (16 bit) -> 32 bits total
  const bitStream = [];
  const addValueToStream = (val, bits) => {
    for (let i = bits - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  };

  addValueToStream(secretImg.width, 16);
  addValueToStream(secretImg.height, 16);

  for (let i = 0; i < sData.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      const encryptedByte = sData[i + j] ^ Math.floor(prng() * 256);
      addValueToStream(encryptedByte, 8);
    }
  }

  // 4. Hide bits in cover 4-bit LSB
  let bitIdx = 0;
  for (let i = 0; i < cData.length && bitIdx < bitStream.length; i += 4) {
    for (let j = 0; j < 3; j++) { // R, G, B
      if (bitIdx >= bitStream.length) break;
      
      // Clear 4 LSBs
      cData[i + j] &= 0xF0;
      
      // Pack 4 bits
      let nibble = 0;
      for (let b = 0; b < 4; b++) {
        if (bitIdx < bitStream.length) {
          nibble |= (bitStream[bitIdx++] << (3 - b));
        }
      }
      cData[i + j] |= nibble;
    }
  }

  cCtx.putImageData(cImageData, 0, 0);

  return new Promise((resolve) => {
    coverCanvas.toBlob((blob) => resolve(blob), 'image/png');
  });
};

/**
 * Extracts a hidden image from a stego image using a secret key.
 */
export const extractImageFromImage = async (stegoFile, secretKey) => {
  const seed = await getSeedFromKey(secretKey);
  const prng = generatePRNG(seed);

  const img = await loadImage(stegoFile);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;

  // 1. Extract bit stream
  const bitStream = [];
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      const nibble = data[i + j] & 0x0F;
      for (let b = 3; b >= 0; b--) {
        bitStream.push((nibble >> b) & 1);
      }
    }
  }

  // 2. Read Metadata
  const readValueFromStream = (start, bits) => {
    let val = 0;
    for (let i = 0; i < bits; i++) {
      val = (val << 1) | bitStream[start + i];
    }
    return val;
  };

  const width = readValueFromStream(0, 16);
  const height = readValueFromStream(16, 16);

  if (width <= 0 || height <= 0 || width > 10000 || height > 10000) {
    throw new Error("Failed to extract valid image metadata. Wrong key or no hidden image.");
  }

  // 3. Reconstruct pixels
  const secretCanvas = document.createElement('canvas');
  secretCanvas.width = width;
  secretCanvas.height = height;
  const sCtx = secretCanvas.getContext('2d');
  const sImageData = sCtx.createImageData(width, height);
  const sData = sImageData.data;

  let streamIdx = 32;
  for (let i = 0; i < sData.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      if (streamIdx + 8 > bitStream.length) break;
      const encryptedByte = readValueFromStream(streamIdx, 8);
      streamIdx += 8;
      sData[i + j] = encryptedByte ^ Math.floor(prng() * 256);
    }
    sData[i + 3] = 255; // Alpha
  }

  sCtx.putImageData(sImageData, 0, 0);

  return new Promise((resolve) => {
    secretCanvas.toBlob((blob) => resolve(blob), 'image/png');
  });
};

/**
 * Generic File Encryption/Decryption: Works for any file type (video, zip, etc.)
 * by XORing the entire ArrayBuffer.
 */
export const encryptDecryptFile = async (file, secretKey) => {
  const seed = await getSeedFromKey(secretKey);
  const prng = generatePRNG(seed);

  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const randomByte = Math.floor(prng() * 256);
    result[i] = data[i] ^ randomByte;
  }

  return new Blob([result], { type: file.type });
};
