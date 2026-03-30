import React from 'react';
import { Button } from "@/components/ui/button";

const VideoPreview = ({ previewUrl, onReset, title, file }) => {
  return (
    <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full flex justify-between items-center px-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title || 'Video Preview'}</span>
        <Button variant="ghost" onClick={onReset} size="xs" className="h-6 text-xs hover:text-destructive">
          Change
        </Button>
      </div>
      <div className="relative group w-full aspect-video">
        {file && file.type.startsWith('video/') ? (
          <video 
            src={previewUrl} 
            controls
            className="w-full h-full object-contain rounded-xl border-2 border-muted shadow-md bg-muted/20"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-muted/10 text-muted-foreground">
            <p className="text-sm">Encrypted Video File</p>
            <p className="text-xs">{file?.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;
