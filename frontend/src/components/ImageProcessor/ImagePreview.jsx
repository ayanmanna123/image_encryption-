import React from 'react';
import { Button } from "@/components/ui/button";

const ImagePreview = ({ previewUrl, onReset, title }) => {
  return (
    <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full flex justify-between items-center px-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title || 'Preview'}</span>
        <Button variant="ghost" onClick={onReset} size="xs" className="h-6 text-xs hover:text-destructive">
          Change
        </Button>
      </div>
      <div className="relative group w-full">
        <img 
          src={previewUrl} 
          alt={title || "Preview"} 
          className="max-h-48 w-full object-contain rounded-xl border-2 border-muted shadow-md bg-muted/20"
        />
      </div>
    </div>
  );
};

export default ImagePreview;
