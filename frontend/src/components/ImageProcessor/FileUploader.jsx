import React from 'react';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const FileUploader = ({ activeTab, fileInputRef, onFileChange, label, id }) => {
  const currentLabel = label || (activeTab === 'encrypt' ? 'Upload Image to Encrypt' : 
                               activeTab === 'stego_encode' ? 'Upload Secret Image' :
                               activeTab === 'stego_decode' ? 'Upload Stego Image' :
                               'Upload Encrypted Image');
  
  return (
    <motion.div 
      className="group relative flex flex-col items-center justify-center border-2 border-dashed border-muted hover:border-primary transition-colors hover:bg-accent/50 cursor-pointer rounded-xl p-8 mb-4 bg-card"
      onClick={() => document.getElementById(id || 'file-input').click()}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="rounded-full bg-primary/10 p-3 mb-3 group-hover:bg-primary/20 transition-colors">
        <Upload className="text-primary" size={24} />
      </div>
      <h3 className="text-md font-semibold mb-1 text-foreground">
        {currentLabel}
      </h3>
      <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Drag and drop or click to browse</p>
      <input 
        id={id || 'file-input'}
        type="file" 
        hidden 
        ref={fileInputRef} 
        onChange={onFileChange} 
        accept="image/*"
      />
    </motion.div>
  );
};

export default FileUploader;
