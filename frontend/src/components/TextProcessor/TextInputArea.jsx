import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TextInputArea = ({ value, onChange, activeTab }) => {
  return (
    <div className="space-y-2 mb-6 animate-in fade-in duration-500">
      <Label htmlFor="message-input" className="text-sm font-medium text-muted-foreground">
        {activeTab === 'encrypt' ? 'Source Text' : 'Encrypted Cipher'}
      </Label>
      <Textarea 
        id="message-input"
        placeholder={activeTab === 'encrypt' ? "Enter plain text here..." : "Paste encrypted Base64 message here..."}
        className="min-h-[150px] bg-card border-muted/20 focus-visible:ring-1 transition-all resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default TextInputArea;
