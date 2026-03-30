import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageProcessor from './components/ImageProcessor/ImageProcessor';
import TextProcessor from './components/TextProcessor/TextProcessor';
import VideoProcessor from './components/VideoProcessor/VideoProcessor';
import DocxProcessor from './components/DocxProcessor/DocxProcessor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileImage, Type, Video, FileText } from 'lucide-react';
import Ballpit from '@/components/ui/Ballpit';
import { useTheme } from './components/ThemeProvider';

function App() {
  const { theme } = useTheme();

  // Theme-aware colors for Ballpit
  const darkColors = [0x6366f1, 0x8b5cf6, 0x06b6d4]; // indigo, violet, cyan (glowing)
  const lightColors = [0x3b82f6, 0x4f46e5, 0x64748b]; // blue, indigo, slate (muted)
  const ballColors = theme === 'dark' ? darkColors : lightColors;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-700 overflow-x-hidden">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <Header />
        
        <Tabs defaultValue="image" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 h-11 bg-muted/30 p-1 backdrop-blur-sm border border-muted/20 shadow-sm">
              <TabsTrigger value="image" className="flex items-center gap-2 font-semibold transition-all data-[state=active]:shadow-md">
                <FileImage size={16} />
                Image
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2 font-semibold transition-all data-[state=active]:shadow-md">
                <Type size={16} />
                Text
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2 font-semibold transition-all data-[state=active]:shadow-md">
                <Video size={16} />
                Video
              </TabsTrigger>
              <TabsTrigger value="docx" className="flex items-center gap-2 font-semibold transition-all data-[state=active]:shadow-md">
                <FileText size={16} />
                Docx
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="image" className="mt-0 focus-visible:outline-none focus:outline-none">
            <ImageProcessor />
          </TabsContent>
          
          <TabsContent value="text" className="mt-0 focus-visible:outline-none focus:outline-none">
            <TextProcessor />
          </TabsContent>

          <TabsContent value="video" className="mt-0 focus-visible:outline-none focus:outline-none">
            <VideoProcessor />
          </TabsContent>

          <TabsContent value="docx" className="mt-0 focus-visible:outline-none focus:outline-none">
            <DocxProcessor />
          </TabsContent>
        </Tabs>


        <Footer />
      </div>

      {/* Interactive Ballpit Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <Ballpit
          count={100}
          gravity={0.01}
          friction={0.9975}
          wallBounce={0.95}
          followCursor={false}
          colors={ballColors}
        />
      </div>
    </div>
  );
}

export default App;
