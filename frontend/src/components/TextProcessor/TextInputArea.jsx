import React, { useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

const TextInputArea = ({ value, onChange, activeTab }) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange(event.target.result);
    };
    reader.readAsText(file);
    
    // Reset input value so the same file can be uploaded again if needed
    e.target.value = '';
  };

  return (
    <div className="space-y-3 mb-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-1">
        <Label htmlFor="message-input" className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <FileText size={14} className="text-primary/70" />
          {activeTab === 'encrypt' ? 'Source Text' : 'Encrypted Cipher'}
        </Label>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,text/plain"
            className="hidden"
          />
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            className="h-8 gap-2 text-xs font-semibold hover:bg-primary/10 text-primary transition-colors border border-primary/20"
          >
            <Upload size={14} />
            Upload .txt
          </Button>
        </div>
      </div>
      
      <div className="relative group">
        <Textarea 
          id="message-input"
          placeholder={activeTab === 'encrypt' ? "Enter plain text here or upload a file..." : "Paste encrypted Base64 message here or upload a file..."}
          className="min-h-[160px] bg-card/50 border-muted/20 focus-visible:ring-1 focus-visible:ring-primary/30 transition-all resize-none leading-relaxed"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
      </div>
    </div>
  );
};

export default TextInputArea;
