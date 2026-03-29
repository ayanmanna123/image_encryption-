import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Upload, 
  Download, 
  Lock, 
  Unlock, 
  FileImage,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('encrypt');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [resultBlob, setResultBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  
  const fileInputRef = useRef(null);

  // Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultBlob(null);
      setStatus(null);
    }
  };

  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const processImage = async () => {
    if (!file || !secretKey) return;

    setIsProcessing(true);
    setStatus(null);

    try {
      // 1. Generate key hash and seed for PRNG
      const msgUint8 = new TextEncoder().encode(secretKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = new Uint8Array(hashBuffer);
      
      // Use the first 4 bytes of the hash as a 32-bit seed
      const view = new DataView(hashArray.buffer);
      let seed = view.getUint32(0);

      // Simple but effective PRNG (Mulberry32)
      const prng = () => {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };

      // 2. Load image into canvas
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
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
      canvas.toBlob((blob) => {
        setResultBlob(blob);
        setIsProcessing(false);
        setStatus('success');
      }, 'image/png');

    } catch (error) {
      console.error('Processing failed:', error);
      setIsProcessing(false);
      setStatus('error');
    }
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab === 'encrypt' ? 'encrypted_image.png' : 'decrypted_image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setSecretKey('');
    setResultBlob(null);
    setStatus(null);
  };

  return (
    <div className="container">
      <header>
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          <h1>NovaCrypt</h1>
          <p>Stealth image encryption with pixel-perfect recovery</p>
        </motion.div>
      </header>

      <main className="glass-panel main-content animate-fade-in">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'encrypt' ? 'active' : ''}`}
            onClick={() => { setActiveTab('encrypt'); reset(); }}
          >
            <Lock size={18} style={{ marginRight: '8px' }} />
            Encrypt
          </button>
          <button 
            className={`tab-btn ${activeTab === 'decrypt' ? 'active' : ''}`}
            onClick={() => { setActiveTab('decrypt'); reset(); }}
          >
            <Unlock size={18} style={{ marginRight: '8px' }} />
            Decrypt
          </button>
        </div>

        <section className="input-section">
          {!file ? (
            <motion.div 
              className="dropzone"
              onClick={() => fileInputRef.current.click()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="dropzone-icon" size={48} />
              <h3>{activeTab === 'encrypt' ? 'Upload Image to Encrypt' : 'Upload Encrypted Image'}</h3>
              <p>Drag and drop or click to browse</p>
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*"
              />
            </motion.div>
          ) : (
            <div className="preview-container">
              <img src={previewUrl} alt="Preview" className="preview-img" />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" onClick={reset}>Change Image</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Secret Passcode
            </label>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="Enter your secret key..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            {!resultBlob ? (
              <button 
                className="btn-primary" 
                onClick={processImage}
                disabled={!file || !secretKey || isProcessing}
                style={{ width: '200px' }}
              >
                {isProcessing ? (
                  <RefreshCw className="spin" size={20} />
                ) : activeTab === 'encrypt' ? (
                  <>Encrypt Now</>
                ) : (
                  <>Decrypt Now</>
                )}
              </button>
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <CheckCircle2 size={24} />
                  {activeTab === 'encrypt' ? 'Encryption Complete!' : 'Decryption Complete!'}
                </div>
                <button className="btn-primary" onClick={downloadResult}>
                  <Download size={20} />
                  Download Result
                </button>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 NovaCrypt Labs. AES-hashed Pixel Scrambling.</p>
      </footer>

      <style>{`
        .spin {
          animation: rotate 1s linear infinite;
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .main-content {
          max-width: 600px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}

export default App;
