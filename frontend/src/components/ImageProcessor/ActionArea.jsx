import React from 'react';
import { RefreshCw, CheckCircle2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ActionArea = ({ 
  activeTab, 
  isProcessing, 
  resultBlob, 
  canProcess, 
  onProcess, 
  onDownload 
}) => {
  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      {!resultBlob ? (
        <Button 
          className="w-full h-12 text-md font-bold transition-all shadow-md hover:shadow-lg active:scale-95" 
          onClick={onProcess}
          disabled={!canProcess || isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="animate-spin" size={20} />
              Processing...
            </div>
          ) : activeTab === 'encrypt' ? (
            <>Encrypt Now</>
          ) : activeTab === 'stego_encode' ? (
            <>Hide Image</>
          ) : activeTab === 'stego_decode' ? (
            <>Extract Image</>
          ) : (
            <>Decrypt Now</>
          )}
        </Button>
      ) : (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full space-y-4"
        >
          <Alert variant="default" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 !text-emerald-500" />
            <AlertTitle className="font-bold">
              {activeTab === 'encrypt' ? 'Encryption Complete!' : 
               activeTab === 'stego_encode' ? 'Image Hidden Successfully!' :
               activeTab === 'stego_decode' ? 'Image Extracted!' :
               'Decryption Complete!'}
            </AlertTitle>
            <AlertDescription className="text-sm">
              Your result is ready for download.
            </AlertDescription>
          </Alert>
          
          <Button 
            className="w-full h-12 text-md font-bold flex items-center justify-center gap-2 transition-all shadow-md" 
            onClick={onDownload}
          >
            <Download size={20} />
            Download Result
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ActionArea;
