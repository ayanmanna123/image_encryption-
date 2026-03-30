import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageProcessor from './components/ImageProcessor/ImageProcessor';
import TextProcessor from './components/TextProcessor/TextProcessor';
import VideoProcessor from './components/VideoProcessor/VideoProcessor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileImage, Type, Video } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-700 overflow-x-hidden">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <Header />
        
        <Tabs defaultValue="image" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-11 bg-muted/30 p-1 backdrop-blur-sm border border-muted/20 shadow-sm">
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
        </Tabs>

        <Footer />
      </div>

      {/* Background Decorative Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none -z-10" />
    </div>
  );
}

export default App;
