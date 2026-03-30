import React, { useState } from 'react';
import { RefreshCw, Copy, Check, Hash, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from 'framer-motion';

const TextActionArea = ({ 
  activeTab, 
  isProcessing, 
  result, 
  canProcess, 
  onProcess 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab === 'encrypt' ? 'encrypted_message.txt' : 'decrypted_message.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 pt-4 border-t border-muted/10">
      <div className="flex gap-3">
        <Button 
          className="flex-1 h-12 font-bold shadow-md hover:shadow-lg active:scale-95 transition-all outline-none ring-0 focus-visible:ring-1" 
          onClick={onProcess}
          disabled={!canProcess || isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2 text-foreground">
              <RefreshCw className="spin" size={18} />
              Processing...
            </div>
          ) : activeTab === 'encrypt' ? (
            <>Encrypt Message</>
          ) : (
            <>Decrypt Cipher</>
          )}
        </Button>

        {result && (
          <Button 
            variant="outline" 
            className="w-24 h-12 text-xs font-semibold" 
            onClick={() => onProcess(true)}
          >
            Clear
          </Button>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Hash size={16} />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {activeTab === 'encrypt' ? 'Encryption Result' : 'Decryption Result'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={downloadResult}
                    className="h-8 gap-2 text-xs font-semibold hover:bg-emerald-500/10 text-foreground"
                  >
                    <Download size={14} />
                    Download
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="h-8 gap-2 text-xs font-semibold hover:bg-emerald-500/10 text-foreground"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              <div className="relative group">
                <Textarea 
                  readOnly
                  className="min-h-[140px] bg-emerald-500/5 border-emerald-500/20 font-mono text-base text-foreground focus-visible:ring-0 resize-none cursor-default leading-relaxed p-4"
                  value={result}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TextActionArea;
