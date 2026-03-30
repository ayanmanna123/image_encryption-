import React, { useState, useRef, useEffect } from 'react';
import TabSwitcher from './TabSwitcher';
import FileUploader from './FileUploader';
import ImagePreview from './ImagePreview';
import KeyInput from './KeyInput';
import ActionArea from './ActionArea';
import { encryptDecryptImage, hideImageInImage, extractImageFromImage } from '../../utils/cryptoUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ImageProcessor = () => {
  const [activeTab, setActiveTab] = useState('encrypt');
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [resultBlob, setResultBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [previewUrl, coverPreviewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultBlob(null);
      setStatus(null);
    }
  };

  const handleCoverFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setCoverFile(selectedFile);
      setCoverPreviewUrl(URL.createObjectURL(selectedFile));
      setResultBlob(null);
      setStatus(null);
    }
  };

  const handleProcess = async () => {
    if (!file || !secretKey) return;
    if (activeTab === 'stego_encode' && !coverFile) return;

    setIsProcessing(true);
    setStatus(null);
    setErrorMessage('');

    try {
      let blob;
      if (activeTab === 'encrypt' || activeTab === 'decrypt') {
        blob = await encryptDecryptImage(file, secretKey);
      } else if (activeTab === 'stego_encode') {
        blob = await hideImageInImage(file, coverFile, secretKey);
      } else if (activeTab === 'stego_decode') {
        blob = await extractImageFromImage(file, secretKey);
      }
      
      setResultBlob(blob);
      setIsProcessing(false);
      setStatus('success');
    } catch (error) {
      console.error('Processing failed:', error);
      setIsProcessing(false);
      setStatus('error');
      setErrorMessage(error.message || 'Processing failed. Please check your key and files.');
    }
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    
    let filename = 'result.png';
    if (activeTab === 'encrypt') filename = 'encrypted_image.png';
    else if (activeTab === 'decrypt') filename = 'decrypted_image.png';
    else if (activeTab === 'stego_encode') filename = 'stego_image.png';
    else if (activeTab === 'stego_decode') filename = 'extracted_secret.png';
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setCoverFile(null);
    setPreviewUrl(null);
    setCoverPreviewUrl(null);
    setSecretKey('');
    setResultBlob(null);
    setStatus(null);
    setErrorMessage('');
  };

  const isStegoMode = activeTab === 'stego_encode';

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-card/80 backdrop-blur-md border-muted/20 animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
          Advanced Image Encryption
        </CardTitle>
        <CardDescription>
          Secure your images with XOR encryption or hide them inside other images.
        </CardDescription>
        <div className="mt-6">
          <TabSwitcher 
            activeTab={activeTab} 
            onTabChange={(tab) => { setActiveTab(tab); reset(); }} 
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="input-section grid gap-4">
          <div className={`grid ${isStegoMode ? 'sm:grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {/* Main File Uploader */}
            {!file ? (
              <FileUploader 
                id="main-file-input"
                activeTab={activeTab} 
                fileInputRef={fileInputRef} 
                onFileChange={handleFileChange} 
              />
            ) : (
              <ImagePreview 
                title={isStegoMode ? "Secret Image" : (activeTab === 'stego_decode' ? "Stego Image" : "Input Image")}
                previewUrl={previewUrl} 
                onReset={() => { setFile(null); setPreviewUrl(null); }} 
              />
            )}

            {/* Cover File Uploader (only for stego_encode) */}
            {isStegoMode && (
              !coverFile ? (
                <FileUploader 
                  id="cover-file-input"
                  activeTab={activeTab} 
                  label="Upload Cover Image"
                  fileInputRef={coverInputRef} 
                  onFileChange={handleCoverFileChange} 
                />
              ) : (
                <ImagePreview 
                  title="Cover Image"
                  previewUrl={coverPreviewUrl} 
                  onReset={() => { setCoverFile(null); setCoverPreviewUrl(null); }} 
                />
              )
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
            canProcess={!!file && !!secretKey && (!isStegoMode || !!coverFile)}
            onProcess={handleProcess}
            onDownload={downloadResult}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageProcessor;
