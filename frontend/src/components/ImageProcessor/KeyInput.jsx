import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const KeyInput = ({ secretKey, onKeyChange }) => {
  return (
    <div className="space-y-2 mb-8">
      <Label htmlFor="secret-key" className="text-sm font-medium text-muted-foreground">
        Secret Passcode
      </Label>
      <Input 
        id="secret-key"
        type="password" 
        placeholder="Enter your secret key..."
        value={secretKey}
        onChange={(e) => onKeyChange(e.target.value)}
        className="h-12 bg-card hover:bg-accent/50 focus-visible:ring-1 transition-colors"
      />
      <p className="text-xs text-muted-foreground italic">
        Make sure to remember this key! It's needed for decryption.
      </p>
    </div>
  );
};

export default KeyInput;
