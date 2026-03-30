import React from 'react';
import ReactDOM from 'react-dom/client';
import ContentApp from './ContentApp';

const ROOT_ID = 'secure-text-encryption-root';

function init() {
    let rootElement = document.getElementById(ROOT_ID);
    if (!rootElement) {
        rootElement = document.createElement('div');
        rootElement.id = ROOT_ID;
        // Shadow DOM is better to isolate styles
        const shadow = rootElement.attachShadow({ mode: 'open' });
        
        // Add a style tag for the shadow root
        const style = document.createElement('style');
        style.textContent = `
            :host {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2147483647;
                pointer-events: none;
            }
            * {
                box-sizing: border-box;
                pointer-events: auto;
            }
        `;
        shadow.appendChild(style);
        
        const contentDiv = document.createElement('div');
        contentDiv.id = 'shadow-root-container';
        shadow.appendChild(contentDiv);
        
        document.body.appendChild(rootElement);
        
        const root = ReactDOM.createRoot(contentDiv);
        root.render(<ContentApp />);
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
