import React from 'react';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <header className="text-center mb-12 pt-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-2 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-sm">
          NovaCrypt
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl font-medium">
          Stealth image encryption with pixel-perfect recovery
        </p>
      </motion.div>
    </header>
  );
};

export default Header;
