import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import TabSwitcher from '../ImageProcessor/TabSwitcher';
import KeyInput from '../ImageProcessor/KeyInput';
import TextInputArea from './TextInputArea';
import TextActionArea from './TextActionArea';
import { encryptDecryptText } from '../../utils/cryptoUtils';

const TextProcessor = () => {
  const [activeTab, setActiveTab] = useState('encrypt');
  const [message, setMessage] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setMessage('');
    setSecretKey('');
    setResult('');
    setError(null);
  };

  const handleProcess = async (isResetting = false) => {
    if (isResetting === true) {
      reset();
      return;
    }
    if (!message || !secretKey) return;

    setIsProcessing(true);
    setError(null);

    try {
      const output = await encryptDecryptText(message, secretKey, activeTab === 'decrypt');
      setResult(output);
      setIsProcessing(false);
    } catch (err) {
      console.error('Text processing failed:', err);
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-2xl bg-card/80 backdrop-blur-md border-muted/20 animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="pb-4">
        <TabSwitcher 
          activeTab={activeTab} 
          onTabChange={(tab) => { setActiveTab(tab); reset(); }} 
        />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="input-section">
          <TextInputArea 
            value={message} 
            onChange={setMessage} 
            activeTab={activeTab} 
          />

          <KeyInput 
            secretKey={secretKey} 
            onKeyChange={setSecretKey} 
          />

          {error && (
            <div className="p-3 mb-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in slide-in-from-top-1">
              Error: {error}
            </div>
          )}

          <TextActionArea 
            activeTab={activeTab}
            isProcessing={isProcessing}
            result={result}
            canProcess={!!message && !!secretKey}
            onProcess={handleProcess}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TextProcessor;
