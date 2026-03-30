import React from 'react';
import { Button } from "@/components/ui/button";

const ImagePreview = ({ previewUrl, onReset }) => {
  return (
    <div className="flex flex-col items-center gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative group">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="max-h-80 w-full object-contain rounded-xl border shadow-xl bg-muted/20"
        />
      </div>
      <Button variant="secondary" onClick={onReset} size="sm">
        Change Image
      </Button>
    </div>
  );
};

export default ImagePreview;
