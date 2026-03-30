import React from 'react';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const FileUploader = ({ activeTab, fileInputRef, onFileChange }) => {
  return (
    <motion.div 
      className="group relative flex flex-col items-center justify-center border-2 border-dashed border-muted hover:border-primary transition-colors hover:bg-accent/50 cursor-pointer rounded-xl p-10 mb-6 bg-card"
      onClick={() => fileInputRef.current.click()}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
        <Upload className="text-primary" size={32} />
      </div>
      <h3 className="text-lg font-semibold mb-1 text-foreground">
        {activeTab === 'encrypt' ? 'Upload Image to Encrypt' : 'Upload Encrypted Image'}
      </h3>
      <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
      <input 
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
