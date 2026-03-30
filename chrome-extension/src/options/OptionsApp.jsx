import React, { useState, useEffect } from 'react';
import { getAllKeys, addKey, deleteKey, setDefaultKey, getFromStorage } from '../utils/storage';

const OptionsApp = () => {
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');
  const [defaultKeyId, setDefaultKeyId] = useState(null);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allKeys = await getAllKeys();
    setKeys(allKeys);
    const defId = await getFromStorage('default_key_id');
    setDefaultKeyId(defId || (allKeys.length > 0 ? allKeys[0].id : null));
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

  const handleSetDefault = async (id) => {
    await setDefaultKey(id);
    setDefaultKeyId(id);
  };

  return (
    <div className="options-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px' }}>Secure Text Extension - Settings</h1>
        <p style={{ fontSize: '16px', opacity: 0.8 }}>Manage your encryption keys and security settings</p>
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
                            <div key={key.id} className={`key-item ${defaultKeyId === key.id ? 'is-default' : ''}`} style={{ marginBottom: '12px' }}>
                                <div className="key-info">
                                    <span className="key-name" style={{ fontSize: '16px' }}>{key.name}</span>
                                    <span className="key-id" style={{ fontSize: '11px', opacity: 0.6 }}>ID: {key.id}</span>
                                    <span className="key-date">Added: {new Date(key.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="key-actions">
                                    {defaultKeyId !== key.id && (
                                        <button onClick={() => handleSetDefault(key.id)} title="Set as default">★ Make Default</button>
                                    )}
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
