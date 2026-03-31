import React, { useState, useEffect, useRef } from 'react';
import { encryptText, decryptText } from '../utils/crypto';
import { getDefaultKey, getAllKeys, getSafeZone } from '../utils/storage';

const ContentApp = () => {
    const [isSafeZone, setIsSafeZone] = useState(false);
    const [defaultKey, setDefaultKey] = useState(null);
    const [targetElement, setTargetElement] = useState(null);
    const [showEncrypt, setShowEncrypt] = useState(false);
    const [decryptTargets, setDecryptTargets] = useState([]);
    const [selectedText, setSelectedText] = useState(null);
    const [selectionPoint, setSelectionPoint] = useState(null);
    
    // UI State
    const [showKeyPicker, setShowKeyPicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState(null); // 'encrypt' or 'decrypt'
    const [keys, setKeys] = useState([]);
    const [securityCode, setSecurityCode] = useState('');
    
    const debounceTimer = useRef(null);
    const activeTimeouts = useRef({});

    useEffect(() => {
        // Initial data sync
        getSafeZone().then(setIsSafeZone);
        getDefaultKey().then(setDefaultKey);

        // Listen for storage changes (Safe Zone or other settings)
        const handleStorageChange = (changes) => {
            if (changes.safe_zone) {
                setIsSafeZone(changes.safe_zone.newValue);
            }
            if (changes.default_key_id || changes.secret_keys) {
                getDefaultKey().then(setDefaultKey);
            }
        };
        chrome.storage.onChanged.addListener(handleStorageChange);

        const handleInput = (e) => {
            if (isSafeZone) return;
            const el = e.target;
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
                if (debounceTimer.current) clearTimeout(debounceTimer.current);
                
                debounceTimer.current = setTimeout(() => {
                    const value = el.isContentEditable ? el.innerText : el.value;
                    if (value && value.trim().length > 0 && !value.startsWith('ENC::')) {
                        setTargetElement(el);
                        setShowEncrypt(true);
                    } else {
                        setShowEncrypt(false);
                    }
                }, 1000);
            }
        };

        const handleFocus = (e) => {
            if (isSafeZone) return;
            const el = e.target;
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
                const value = el.isContentEditable ? el.innerText : el.value;
                if (value && value.trim().length > 0 && !value.startsWith('ENC::')) {
                    setTargetElement(el);
                    setShowEncrypt(true);
                }
            }
        };

        const handleBlur = (e) => {
            // Delay to allow clicking the button
            setTimeout(() => {
                // If focus is still in the input, don't hide
                if (document.activeElement !== targetElement) {
                    // setShowEncrypt(false); // Maybe don't hide immediately
                }
            }, 200);
        };

        const handleMouseUp = () => {
            if (isSafeZone) return;
            const selection = window.getSelection();
            const text = selection.toString().trim();
            if (text && text.length > 5) {
                setSelectedText(text);
                const rect = selection.getRangeAt(0).getBoundingClientRect();
                setSelectionPoint({ x: rect.right, y: rect.bottom });
            } else {
                setSelectedText(null);
            }
        };

        document.addEventListener('input', handleInput, true);
        document.addEventListener('focusin', handleFocus, true);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Scan for encrypted patterns
        const scanForDecryption = () => {
             const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
             let node;
             const newTargets = [];
             while (node = walker.nextNode()) {
                 const text = node.textContent;
                 if (text.includes('ENC::')) {
                     const rect = node.parentElement.getBoundingClientRect();
                     if (rect.width > 0 && rect.height > 0) {
                        newTargets.push({
                            id: Math.random().toString(36),
                            text: text.trim(),
                            node: node,
                            rect: rect
                        });
                     }
                 }
             }
             setDecryptTargets(newTargets);
        };

        const scanInterval = setInterval(() => {
            if (!isSafeZone) scanForDecryption();
        }, 2000);

        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
            document.removeEventListener('input', handleInput, true);
            document.removeEventListener('focusin', handleFocus, true);
            document.removeEventListener('mouseup', handleMouseUp);
            clearInterval(scanInterval);
            // Clear any pending timeouts
            Object.values(activeTimeouts.current).forEach(clearTimeout);
        };
    }, [isSafeZone]);

    const updateInputElement = (el, newText) => {
        el.focus();
        
        if (el.isContentEditable) {
            // Standard way to update contenteditable for React/Frameworks
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(el);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('insertText', false, newText);
        } else {
            // Standard way for input/textarea
            el.select();
            document.execCommand('insertText', false, newText);
        }

        // Final sync for edge cases
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const handleEncryptClick = async (key) => {
        if (!targetElement) return;
        const text = targetElement.isContentEditable ? targetElement.innerText : targetElement.value;
        try {
            const encryptionKey = key || defaultKey;
            if (!encryptionKey) {
                openKeyPicker('encrypt');
                return;
            }
            const encrypted = await encryptText(text, encryptionKey.secret, securityCode);
            updateInputElement(targetElement, encrypted);
            setShowEncrypt(false);
            setShowKeyPicker(false);
        } catch (err) {
            console.error('Encryption error:', err);
            alert('Encryption failed: ' + err.message);
        }
    };

    const handleDecryptClick = async (key, targetText, targetNode = null) => {
        try {
            const decryptionKey = key || defaultKey;
            if (!decryptionKey) {
                openKeyPicker('decrypt', { text: targetText, node: targetNode });
                return;
            }
            const decrypted = await decryptText(targetText, decryptionKey.secret, securityCode);
            if (targetNode) {
                // Store original encrypted text for re-encryption
                const originalEncrypted = targetNode.textContent;
                targetNode.textContent = decrypted;

                // Auto re-encrypt after 5 seconds
                const timeoutId = setTimeout(() => {
                    targetNode.textContent = originalEncrypted;
                    delete activeTimeouts.current[timeoutId];
                }, 5000);
                activeTimeouts.current[timeoutId] = timeoutId;

            } else {
                alert('Decrypted Message (Reverts in 5s):\n\n' + decrypted);
            }
            setShowKeyPicker(false);
        } catch (err) {
            console.error('Decryption error:', err);
            // If it failed with the default key, the secret might be wrong
            if (!key && defaultKey) {
                alert('Decryption failed with your default key. This message might be encrypted with a different key.');
            } else {
                alert('Decryption failed: ' + err.message);
            }
        }
    };

    const openKeyPicker = async (type, extraData = null) => {
        const allKeys = await getAllKeys();
        setKeys(allKeys);
        setPickerTarget({ type, extraData });
        setShowKeyPicker(true);
    };

    if (isSafeZone) return null;

    return (
        <>
            {showEncrypt && targetElement && (
                <FloatingButton 
                    target={targetElement} 
                    onClick={() => handleEncryptClick()} // Call without key to use default
                    onContextMenu={(e) => { e.preventDefault(); openKeyPicker('encrypt'); }} // Right-click to override
                    label="Encrypt"
                    color="#4f46e5"
                />
            )}

            {decryptTargets.map(t => (
                <FloatingButton 
                    key={t.id}
                    target={t.node.parentElement}
                    onClick={() => handleDecryptClick(null, t.text, t.node)} // Call without key to use default
                    onContextMenu={(e) => { e.preventDefault(); openKeyPicker('decrypt', t); }} // Right-click to override
                    label="Decrypt"
                    color="#059669"
                    offsetY={-30}
                    offsetX={-60}
                />
            ))}

            {selectedText && selectionPoint && (
                 <button
                    style={{
                        position: 'fixed',
                        top: selectionPoint.y + 5,
                        left: selectionPoint.x - 50,
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        zIndex: 2147483647
                    }}
                    onClick={() => handleDecryptClick(null, selectedText)} // Call without key to use default
                 >
                    Decrypt Selected
                 </button>
            )}

            {showKeyPicker && (
                <KeyPicker 
                    keys={keys}
                    onSelect={(key) => {
                        if (pickerTarget.type === 'encrypt') {
                            handleEncryptClick(key);
                        } else {
                            handleDecryptClick(key, pickerTarget.extraData.text, pickerTarget.extraData.node);
                        }
                    }}
                    onClose={() => setShowKeyPicker(false)}
                    securityCode={securityCode}
                    setSecurityCode={setSecurityCode}
                />
            )}
        </>
    );
};

const FloatingButton = ({ target, onClick, onContextMenu, label, color, offsetX = 0, offsetY = 0 }) => {
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const updatePos = () => {
            const rect = target.getBoundingClientRect();
            setPos({
                top: rect.bottom + window.scrollY + offsetY,
                left: rect.right + window.scrollX + offsetX - 60
            });
        };
        updatePos();
        window.addEventListener('scroll', updatePos);
        window.addEventListener('resize', updatePos);
        return () => {
            window.removeEventListener('scroll', updatePos);
            window.removeEventListener('resize', updatePos);
        };
    }, [target]);

    return (
        <button
            style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                backgroundColor: color,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                zIndex: 2147483647
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            onClick={onClick}
            onContextMenu={onContextMenu}
            title={onContextMenu ? "Click to use default key, Right-click to choose key" : ""}
        >
            {label}
        </button>
    );
};

const KeyPicker = ({ keys, onSelect, onClose, securityCode, setSecurityCode }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            zIndex: 2147483647,
            width: '320px',
            color: '#111827',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Choose Key</h3>
                <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Security Code (Optional)</label>
                <input 
                    type="password"
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    placeholder="Enter secondary code..."
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                    }}
                />
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {keys.length === 0 ? (
                    <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>No keys found. Add keys in extension popup.</p>
                ) : (
                    keys.map(key => (
                        <button
                            key={key.id}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '10px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                marginBottom: '8px',
                                backgroundColor: '#fcfcfc',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fcfcfc'}
                            onClick={() => onSelect(key)}
                        >
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{key.name}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>ID: {key.id.slice(0, 8)}...</div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default ContentApp;
