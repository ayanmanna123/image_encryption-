import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, FileCode, CheckCircle2 } from 'lucide-react';

const DocxPreview = ({ onReset, title, file }) => {
  const isDocx = file && (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  const isBin = file && (file.name.endsWith('.bin') || file.type === 'application/octet-stream');

  return (
    <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full flex justify-between items-center px-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title || 'Document Preview'}</span>
        <Button variant="ghost" onClick={onReset} size="sm" className="h-7 text-xs hover:text-destructive hover:bg-destructive/10 transition-colors">
          Change File
        </Button>
      </div>
      
      <div className="relative group w-full p-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-300">
        <div className="relative mb-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-card p-4 rounded-full shadow-lg border border-muted/20">
            {isDocx ? (
              <FileText size={42} className="text-primary" />
            ) : (
              <FileCode size={42} className="text-purple-500" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-card shadow-sm">
            <CheckCircle2 size={14} className="text-white" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h4 className="text-sm font-semibold text-foreground truncate max-w-[240px]">
            {file?.name || 'document_file.docx'}
          </h4>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            {((file?.size || 0) / 1024).toFixed(2)} KB • {isDocx ? 'Microsoft Word' : 'Encrypted Binary'}
          </p>
        </div>
        
        <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
      </div>
    </div>
  );
};

export default DocxPreview;
