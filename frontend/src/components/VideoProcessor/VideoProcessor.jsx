import React, { useState, useRef, useEffect } from 'react';
import VideoTabSwitcher from './VideoTabSwitcher';
import FileUploader from '../ImageProcessor/FileUploader';
import VideoPreview from './VideoPreview';
import KeyInput from '../ImageProcessor/KeyInput';
import ActionArea from '../ImageProcessor/ActionArea';
import { encryptDecryptFile } from '../../utils/cryptoUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

const VideoProcessor = () => {
  const [activeTab, setActiveTab] = useState('encrypt');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [resultBlob, setResultBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);

  // Clean up preview URLs
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
    setErrorMessage('');

    try {
      // Small delay to allow UI to show processing state for small files
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const blob = await encryptDecryptFile(file, secretKey);
      
      setResultBlob(blob);
      setIsProcessing(false);
      setStatus('success');
    } catch (error) {
      console.error('Video processing failed:', error);
      setIsProcessing(false);
      setStatus('error');
      setErrorMessage(error.message || 'Processing failed. Please check your key and file.');
    }
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    
    let filename = activeTab === 'encrypt' ? 'encrypted_video.bin' : 'decrypted_video.mp4';
    
    a.download = filename;
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
    setErrorMessage('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-card/80 backdrop-blur-md border-muted/20 animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
          Secure Video Cipher
        </CardTitle>
        <CardDescription>
          Encrypt your video files with XOR encryption for maximum privacy.
        </CardDescription>
        <div className="mt-6">
          <VideoTabSwitcher 
            activeTab={activeTab} 
            onTabChange={(tab) => { setActiveTab(tab); reset(); }} 
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="input-section grid gap-4">
          <div className="grid grid-cols-1 gap-4">
            {!file ? (
              <FileUploader 
                id="video-file-input"
                activeTab={activeTab} 
                fileInputRef={fileInputRef} 
                onFileChange={handleFileChange}
                accept="video/*,.bin"
                label={activeTab === 'encrypt' ? "Upload Video to Encrypt" : "Upload Encrypted Video (.bin)"}
              />
            ) : (
              <VideoPreview 
                title={activeTab === 'encrypt' ? "Input Video" : "Encrypted File"}
                previewUrl={previewUrl} 
                file={file}
                onReset={() => { setFile(null); setPreviewUrl(null); }} 
              />
            )}
          </div>

          <KeyInput 
            secretKey={secretKey} 
            onKeyChange={setSecretKey} 
          />

          {status === 'error' && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

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

export default VideoProcessor;
