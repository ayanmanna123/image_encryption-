import React, { useState, useEffect } from 'react';
import { getAllKeys, addKey, deleteKey, setDefaultEncryptKey, setDefaultDecryptKey, getFromStorage, getSafeZone, setSafeZone, getOutputFormat, setOutputFormat } from '../utils/storage';

const PopupApp = () => {
  const [isSafeZone, setIsSafeZone] = useState(false);
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');
  const [defaultEncryptId, setDefaultEncryptId] = useState(null);
  const [defaultDecryptId, setDefaultDecryptId] = useState(null);
  const [outputFormat, setOutputFormatState] = useState('text');
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

    const format = await getOutputFormat();
    setOutputFormatState(format);

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
    const newVal = !isSafeZone;
    await setSafeZone(newVal);
    setIsSafeZone(newVal);
  };

  const toggleOutputFormat = async () => {
    let newVal;
    if (outputFormat === 'text') {
      newVal = 'emoji';
    } else if (outputFormat === 'emoji') {
      newVal = 'natural';
    } else {
      newVal = 'text';
    }
    await setOutputFormat(newVal);
    setOutputFormatState(newVal);
  };

  const getFormatLabel = () => {
    if (outputFormat === 'text') return '🔠 Text';
    if (outputFormat === 'emoji') return '😃 Emoji';
    if (outputFormat === 'natural') return '📝 Natural';
    return '🔠 Text';
  };

  const getFormatColor = () => {
    if (outputFormat === 'text') return '#6366f1';
    if (outputFormat === 'emoji') return '#8b5cf6';
    if (outputFormat === 'natural') return '#10b981';
    return '#6366f1';
  };

  return (
    <div className="container">
      <header>
        <h1>Secure Text</h1>
        <p>Manage your encryption keys</p>
      </header>

      <div className="actions" style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <button 
          className={`btn-primary ${showAdd ? 'btn-danger' : ''}`} 
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? 'Cancel' : '+ Add Key'}
        </button>

        <div className="safe-zone-toggle" style={{ marginBottom: '12px' }}>
          <label className="switch-label">
            <span>Safe Zone (Incognito)</span>
            <button 
              className={`btn-toggle ${isSafeZone ? 'active' : ''}`}
              onClick={toggleSafeZone}
              style={{ backgroundColor: isSafeZone ? '#6b7280' : '#10b981' }}
            >
              {isSafeZone ? 'ON' : 'OFF'}
            </button>
          </label>
        </div>

        <div className="output-format-toggle" style={{ marginBottom: '12px' }}>
          <label className="switch-label">
            <span>Output Mode</span>
            <button 
              className="btn-toggle"
              onClick={toggleOutputFormat}
              style={{ backgroundColor: getFormatColor(), color: 'white' }}
            >
              {getFormatLabel()}
            </button>
          </label>
        </div>
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
