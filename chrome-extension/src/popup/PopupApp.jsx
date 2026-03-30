import React, { useState, useEffect } from 'react';
import { getAllKeys, addKey, deleteKey, setDefaultKey, getFromStorage } from '../utils/storage';

const PopupApp = () => {
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');
  const [defaultKeyId, setDefaultKeyId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

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
    setShowAdd(false);
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
    <div className="container">
      <header>
        <h1>Secure Text</h1>
        <p>Manage your encryption keys</p>
      </header>

      <div className="actions">
        <button 
          className={`btn-primary ${showAdd ? 'btn-danger' : ''}`} 
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? 'Cancel' : '+ Add New Key'}
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
            <div key={key.id} className={`key-item ${defaultKeyId === key.id ? 'is-default' : ''}`}>
              <div className="key-info">
                <span className="key-name">{key.name}</span>
                <span className="key-date">{new Date(key.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="key-actions">
                {defaultKeyId !== key.id && (
                  <button onClick={() => handleSetDefault(key.id)} title="Set as default">★</button>
                )}
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
