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

export const encryptDecryptImage = async (file, secretKey) => {
  // 1. Generate key hash and seed for PRNG
  const msgUint8 = new TextEncoder().encode(secretKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = new Uint8Array(hashBuffer);
  
  // Use the first 4 bytes of the hash as a 32-bit seed
  const view = new DataView(hashArray.buffer);
  const seed = view.getUint32(0);

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
  const msgUint8 = new TextEncoder().encode(secretKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = new Uint8Array(hashBuffer);
  const view = new DataView(hashArray.buffer);
  const seed = view.getUint32(0);
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
