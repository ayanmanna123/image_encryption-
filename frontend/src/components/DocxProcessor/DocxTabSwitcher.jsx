import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DocxTabSwitcher = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/30 p-1 backdrop-blur-sm border border-muted/20 shadow-sm">
          <TabsTrigger value="encrypt" className="flex items-center gap-2 text-sm font-semibold transition-all data-[state=active]:shadow-md">
            <Lock size={16} />
            Encrypt Docx
          </TabsTrigger>
          <TabsTrigger value="decrypt" className="flex items-center gap-2 text-sm font-semibold transition-all data-[state=active]:shadow-md">
            <Unlock size={16} />
            Decrypt Docx
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default DocxTabSwitcher;
