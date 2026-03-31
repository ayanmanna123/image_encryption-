import React, { useState, useEffect } from 'react';
import { getAllKeys, addKey, deleteKey, setDefaultEncryptKey, setDefaultDecryptKey, getFromStorage, getSafeZone, setSafeZone } from '../utils/storage';

const PopupApp = () => {
  const [isSafeZone, setIsSafeZone] = useState(false);
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');
  const [defaultEncryptId, setDefaultEncryptId] = useState(null);
  const [defaultDecryptId, setDefaultDecryptId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

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
    setShowAdd(false);
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
    <div className="container">
      <header>
        <h1>Secure Text</h1>
        <p>Manage your encryption keys</p>
      </header>

      <div className="actions" style={{ display: 'flex', gap: '8px' }}>
        <button 
          className={`btn-primary ${showAdd ? 'btn-danger' : ''}`} 
          onClick={() => setShowAdd(!showAdd)}
          style={{ flex: 2 }}
        >
          {showAdd ? 'Cancel' : '+ Add Key'}
        </button>
        <button 
          className={`btn-primary ${isSafeZone ? 'active' : ''}`} 
          onClick={toggleSafeZone}
          style={{ 
            flex: 1, 
            backgroundColor: isSafeZone ? '#6b7280' : '#10b981',
            fontSize: '12px'
          }}
        >
          {isSafeZone ? '🛡️ Safe ON' : '🛡️ Safe OFF'}
        </button>
      </div>

      {showAdd && (
        <form className="add-form" onSubmit={handleAddKey}>
          <input 
            type="text" 
            placeholder="Key Name (e.g. Work)" 
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Secret Key (Strong passphrase)" 
            value={newKeySecret}
            onChange={(e) => setNewKeySecret(e.target.value)}
            required
          />
          <button type="submit" className="btn-submit">Save Key</button>
        </form>
      )}

      <div className="key-list">
        {keys.length === 0 ? (
          <div className="empty-state">
            <p>No keys added yet.</p>
          </div>
        ) : (
          keys.map(key => (
            <div key={key.id} className={`key-item ${defaultEncryptId === key.id || defaultDecryptId === key.id ? 'is-default' : ''}`}>
              <div className="key-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  <span className="key-name">{key.name}</span>
                  {defaultEncryptId === key.id && (
                    <span style={{ 
                      fontSize: '8px', 
                      backgroundColor: '#e0e7ff', 
                      color: '#4338ca', 
                      padding: '1px 4px', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      ENC
                    </span>
                  )}
                  {defaultDecryptId === key.id && (
                    <span style={{ 
                      fontSize: '8px', 
                      backgroundColor: '#d1fae5', 
                      color: '#047857', 
                      padding: '1px 4px', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      DEC
                    </span>
                  )}
                </div>
                <span className="key-date">{new Date(key.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="key-actions" style={{ gap: '4px' }}>
                <button 
                  onClick={() => handleSetDefaultEncrypt(key.id)} 
                  title="Set Default Encryption"
                  style={{ opacity: defaultEncryptId === key.id ? 1 : 0.3 }}
                >
                  🔒
                </button>
                <button 
                  onClick={() => handleSetDefaultDecrypt(key.id)} 
                  title="Set Default Decryption"
                  style={{ opacity: defaultDecryptId === key.id ? 1 : 0.3 }}
                >
                  🔓
                </button>
                <button onClick={() => handleDeleteKey(key.id)} className="btn-delete" title="Delete key">🗑</button>
              </div>
            </div>
          ))
        )}
      </div>

      <footer>
        <button onClick={() => chrome.runtime.openOptionsPage()}>Settings</button>
      </footer>
    </div>
  );
};

export default PopupApp;
