import React, { useState, useRef, useEffect } from 'react';
import TabSwitcher from './TabSwitcher';
import FileUploader from './FileUploader';
import ImagePreview from './ImagePreview';
import KeyInput from './KeyInput';
import ActionArea from './ActionArea';
import { encryptDecryptImage } from '../../utils/cryptoUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ImageProcessor = () => {
  const [activeTab, setActiveTab] = useState('encrypt');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [resultBlob, setResultBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  
  const fileInputRef = useRef(null);

  // Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultBlob(null);
      setStatus(null);
    }
  };

  const handleProcess = async () => {
    if (!file || !secretKey) return;

    setIsProcessing(true);
    setStatus(null);

    try {
      const blob = await encryptDecryptImage(file, secretKey);
      setResultBlob(blob);
      setIsProcessing(false);
      setStatus('success');
    } catch (error) {
      console.error('Processing failed:', error);
      setIsProcessing(false);
      setStatus('error');
    }
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab === 'encrypt' ? 'encrypted_image.png' : 'decrypted_image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setSecretKey('');
    setResultBlob(null);
    setStatus(null);
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-2xl bg-card/80 backdrop-blur-md border-muted/20 animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="pb-4">
        <TabSwitcher 
          activeTab={activeTab} 
          onTabChange={(tab) => { setActiveTab(tab); reset(); }} 
        />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="input-section">
          {!file ? (
            <FileUploader 
              activeTab={activeTab} 
              fileInputRef={fileInputRef} 
              onFileChange={handleFileChange} 
            />
          ) : (
            <ImagePreview 
              previewUrl={previewUrl} 
              onReset={reset} 
            />
          )}

          <KeyInput 
            secretKey={secretKey} 
            onKeyChange={setSecretKey} 
          />

          <ActionArea 
            activeTab={activeTab}
            isProcessing={isProcessing}
            resultBlob={resultBlob}
            canProcess={!!file && !!secretKey}
            onProcess={handleProcess}
            onDownload={downloadResult}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageProcessor;
