/**
 * Chrome Storage helpers for managing secret keys and settings.
 */

const STORAGE_KEYS = {
    SECRET_KEYS: 'secret_keys',
    DEFAULT_KEY_ID: 'default_key_id',
    SETTINGS: 'settings',
    SAFE_ZONE: 'safe_zone',
};

/**
 * Gets data from chrome.storage.local.
 */
export async function getFromStorage(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
            resolve(result[key]);
        });
    });
}

/**
 * Sets data in chrome.storage.local.
 */
export async function setInStorage(key, value) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => {
            resolve();
        });
    });
}

/**
 * Retrieves all saved keys.
 */
export async function getAllKeys() {
    return (await getFromStorage(STORAGE_KEYS.SECRET_KEYS)) || [];
}

/**
 * Adds a new secret key.
 */
export async function addKey(name, secret) {
    const keys = await getAllKeys();
    const newKey = {
        id: crypto.randomUUID(),
        name: name || `Key ${keys.length + 1}`,
        secret: secret,
        createdAt: new Date().toISOString(),
    };
    keys.push(newKey);
    await setInStorage(STORAGE_KEYS.SECRET_KEYS, keys);
    return newKey;
}

/**
 * Deletes a key by ID.
 */
export async function deleteKey(id) {
    const keys = await getAllKeys();
    const updatedKeys = keys.filter(k => k.id !== id);
    await setInStorage(STORAGE_KEYS.SECRET_KEYS, updatedKeys);
}

/**
 * Gets the default key or first available key.
 */
export async function getDefaultKey() {
    const keys = await getAllKeys();
    if (keys.length === 0) return null;
    
    const defaultId = await getFromStorage(STORAGE_KEYS.DEFAULT_KEY_ID);
    return keys.find(k => k.id === defaultId) || keys[0];
}

/**
 * Sets the default key by ID.
 */
export async function setDefaultKey(id) {
    await setInStorage(STORAGE_KEYS.DEFAULT_KEY_ID, id);
}

/**
 * Gets the Safe Zone status.
 */
export async function getSafeZone() {
    return (await getFromStorage(STORAGE_KEYS.SAFE_ZONE)) || false;
}

/**
 * Sets the Safe Zone status.
 */
export async function setSafeZone(status) {
    await setInStorage(STORAGE_KEYS.SAFE_ZONE, status);
}
