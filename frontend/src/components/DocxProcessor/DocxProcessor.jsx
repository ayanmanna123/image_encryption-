import React, { useState, useRef, useEffect } from 'react';
import DocxTabSwitcher from './DocxTabSwitcher';
import FileUploader from '../ImageProcessor/FileUploader';
import DocxPreview from './DocxPreview';
import KeyInput from '../ImageProcessor/KeyInput';
import ActionArea from '../ImageProcessor/ActionArea';
import { encryptDecryptFile } from '../../utils/cryptoUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, FileText } from 'lucide-react';

const DocxProcessor = () => {
  const [activeTab, setActiveTab] = useState('encrypt');
  const [file, setFile] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [resultBlob, setResultBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
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
      // Small delay to allow UI to show processing state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const blob = await encryptDecryptFile(file, secretKey);
      
      setResultBlob(blob);
      setIsProcessing(false);
      setStatus('success');
    } catch (error) {
      console.error('Docx processing failed:', error);
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
    
    let filename = activeTab === 'encrypt' ? 'encrypted_document.bin' : 'decrypted_document.docx';
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setSecretKey('');
    setResultBlob(null);
    setStatus(null);
    setErrorMessage('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-card/80 backdrop-blur-md border-muted/20 animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 flex items-center justify-center gap-3">
          <FileText className="text-primary" size={28} />
          Docx Cipher
        </CardTitle>
        <CardDescription>
          Securely encrypt and decrypt Microsoft Word documents using XOR binary protection.
        </CardDescription>
        <div className="mt-6">
          <DocxTabSwitcher 
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
                id="docx-file-input"
                activeTab={activeTab} 
                fileInputRef={fileInputRef} 
                onFileChange={handleFileChange}
                accept=".docx,.bin,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                label={activeTab === 'encrypt' ? "Upload DOCX to Encrypt" : "Upload Encrypted DOCX (.bin)"}
              />
            ) : (
              <DocxPreview 
                title={activeTab === 'encrypt' ? "Input Document" : "Encrypted File"}
                file={file}
                onReset={() => { setFile(null); }} 
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

export default DocxProcessor;
