import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TabSwitcher = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8">
      <Tabs defaultValue={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="encrypt" className="flex items-center gap-2">
            <Lock size={16} />
            Encrypt
          </TabsTrigger>
          <TabsTrigger value="decrypt" className="flex items-center gap-2">
            <Unlock size={16} />
            Decrypt
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TabSwitcher;
