import React, { useState, useEffect } from 'react';
import { getAllKeys, addKey, deleteKey, setDefaultEncryptKey, setDefaultDecryptKey, getFromStorage, getSafeZone, setSafeZone } from '../utils/storage';

const OptionsApp = () => {
  const [isSafeZone, setIsSafeZone] = useState(false);
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');
  const [defaultEncryptId, setDefaultEncryptId] = useState(null);
  const [defaultDecryptId, setDefaultDecryptId] = useState(null);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allKeys = await getAllKeys();
    setKeys(allKeys);
    
    const encId = await getFromStorage('default_encrypt_id');
    setDefaultEncryptId(encId || (allKeys.length > 0 ? allKeys[0].id : null));

    const decId = await getFromStorage('default_decrypt_id');
    setDefaultDecryptId(decId || (allKeys.length > 0 ? allKeys[0].id : null));

    const safeZone = await getSafeZone();
    setIsSafeZone(safeZone);
  };

  const handleAddKey = async (e) => {
    e.preventDefault();
    if (!newKeySecret) return;
    await addKey(newKeyName, newKeySecret);
    setNewKeyName('');
    setNewKeySecret('');
    loadData();
  };

  const handleDeleteKey = async (id) => {
    if (confirm('Delete this key?')) {
      await deleteKey(id);
      loadData();
    }
  };

  const handleSetDefaultEncrypt = async (id) => {
    await setDefaultEncryptKey(id);
    setDefaultEncryptId(id);
  };

  const handleSetDefaultDecrypt = async (id) => {
    await setDefaultDecryptKey(id);
    setDefaultDecryptId(id);
  };

  const toggleSafeZone = async () => {
    const newStatus = !isSafeZone;
    await setSafeZone(newStatus);
    setIsSafeZone(newStatus);
  };

  return (
    <div className="options-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h1 style={{ fontSize: '32px', margin: 0 }}>Secure Text Extension - Settings</h1>
            <p style={{ fontSize: '16px', opacity: 0.8, margin: '4px 0 0 0' }}>Manage your encryption keys and security settings</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <button 
                className={`btn-primary`} 
                onClick={toggleSafeZone}
                style={{ 
                    padding: '12px 24px', 
                    backgroundColor: isSafeZone ? '#6b7280' : '#10b981',
                    width: 'auto'
                }}
            >
                {isSafeZone ? '🛡️ Safe Zone: ON' : '🛡️ Safe Zone: OFF'}
            </button>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {isSafeZone ? 'UI is currently hidden on all sites' : 'UI is active on all sites'}
            </span>
        </div>
      </header>

      <section style={{ marginBottom: '40px' }}>
        <h2>Key Management</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
             <div className="add-key-section">
                <h3>Add New Key</h3>
                <form className="add-form" onSubmit={handleAddKey}>
                    <input 
                        type="text" 
                        placeholder="Key Name (e.g. My Personal Key)" 
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        style={{ padding: '12px' }}
                    />
                    <input 
                        type="password" 
                        placeholder="Secret Passphrase (Keep this secret!)" 
                        value={newKeySecret}
                        onChange={(e) => setNewKeySecret(e.target.value)}
                        required
                        style={{ padding: '12px' }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '12px' }}>Save Key</button>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>
                        Note: For best security, use a unique and long passphrase.
                    </p>
                </form>
             </div>

             <div className="key-list-section">
                <h3>Saved Keys</h3>
                <div className="key-list">
                    {keys.length === 0 ? (
                        <p>No keys saved. Create one to get started.</p>
                    ) : (
                        keys.map(key => (
                            <div key={key.id} className={`key-item ${defaultEncryptId === key.id || defaultDecryptId === key.id ? 'is-default' : ''}`} style={{ marginBottom: '12px' }}>
                                <div className="key-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <span className="key-name" style={{ fontSize: '18px' }}>{key.name}</span>
                                        {defaultEncryptId === key.id && (
                                            <span style={{ 
                                                fontSize: '11px', 
                                                backgroundColor: '#e0e7ff', 
                                                color: '#4338ca', 
                                                padding: '4px 10px', 
                                                borderRadius: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                ENC DEFAULT
                                            </span>
                                        )}
                                        {defaultDecryptId === key.id && (
                                            <span style={{ 
                                                fontSize: '11px', 
                                                backgroundColor: '#d1fae5', 
                                                color: '#047857', 
                                                padding: '4px 10px', 
                                                borderRadius: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                DEC DEFAULT
                                            </span>
                                        )}
                                    </div>
                                    <span className="key-id" style={{ fontSize: '11px', opacity: 0.6 }}>ID: {key.id}</span>
                                    <span className="key-date">Added: {new Date(key.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="key-actions" style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => handleSetDefaultEncrypt(key.id)} 
                                        className={defaultEncryptId === key.id ? 'btn-active' : ''}
                                        title="Set Default Encryption"
                                        style={{ backgroundColor: defaultEncryptId === key.id ? '#4338ca' : '#f3f4f6', color: defaultEncryptId === key.id ? 'white' : 'black' }}
                                    >
                                        🔒 Enc
                                    </button>
                                    <button 
                                        onClick={() => handleSetDefaultDecrypt(key.id)} 
                                        className={defaultDecryptId === key.id ? 'btn-active' : ''}
                                        title="Set Default Decryption"
                                        style={{ backgroundColor: defaultDecryptId === key.id ? '#059669' : '#f3f4f6', color: defaultDecryptId === key.id ? 'white' : 'black' }}
                                    >
                                        🔓 Dec
                                    </button>
                                    <button onClick={() => handleDeleteKey(key.id)} className="btn-delete" style={{ color: 'red' }}>🗑 Delete</button>
                                </div>
                            </div>
                        ))
                    ) }
                </div>
             </div>
        </div>
      </section>

      <section style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
          <h2>How it Works</h2>
          <div style={{ lineHeight: '1.6', color: '#4b5563' }}>
              <p><strong>Encryption:</strong> When you type in any input field, a small "Encrypt" button will appear. Choosing a key will encrypt the text using AES-GCM 256-bit encryption. The encrypted text will include a prefix <code>ENC::</code> followed by encoded data bits.</p>
              <p><strong>Decryption:</strong> The extension automatically scans for <code>ENC::</code> patterns on the page and shows a "Decrypt" button nearby. You can also select any text manually and click "Decrypt Selected".</p>
              <p><strong>Security:</strong> All keys are stored locally on your device. For extra security, you can use a secondary "Security Code" when encrypting/decrypting each message; this code is never stored.</p>
          </div>
      </section>
    </div>
  );
};

export default OptionsApp;
