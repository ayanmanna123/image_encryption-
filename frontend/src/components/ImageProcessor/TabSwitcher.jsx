import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TabSwitcher = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8">
      <Tabs defaultValue={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="encrypt" className="flex items-center gap-2 text-xs sm:text-sm">
            <Lock size={14} />
            Encrypt
          </TabsTrigger>
          <TabsTrigger value="decrypt" className="flex items-center gap-2 text-xs sm:text-sm">
            <Unlock size={14} />
            Decrypt
          </TabsTrigger>
          <TabsTrigger value="stego_encode" className="flex items-center gap-2 text-xs sm:text-sm">
            <Lock size={14} className="text-primary" />
            Hide
          </TabsTrigger>
          <TabsTrigger value="stego_decode" className="flex items-center gap-2 text-xs sm:text-sm">
            <Unlock size={14} className="text-primary" />
            Extract
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TabSwitcher;
