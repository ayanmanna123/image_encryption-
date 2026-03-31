// Chrome Extension Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('Secure Text Encryption Extension installed.');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'IMPROVE_TEXT') {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const model = 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Correct the grammar and improve the sentence flow of the following text, while keeping its original meaning and tone. Only return the improved text, no headers or explanations:\n\n${request.text}`
                    }]
                }]
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
                sendResponse({ success: true, text: data.candidates[0].content.parts[0].text.trim() });
            } else {
                console.error('Gemini API Error:', data);
                sendResponse({ success: false, error: 'Failed to improve text. Please check your API key or model availability.' });
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
            sendResponse({ success: false, error: err.message });
        });

        return true; // Keep message channel open for async response
    }
});
