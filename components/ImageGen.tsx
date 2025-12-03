import React, { useState } from 'react';
import { Image as ImageIcon, Download, Loader2, Key } from 'lucide-react';
import { generateProImage } from '../services/gemini';
import { GeneratedImage, ImageSize } from '../types';

export const ImageGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if API key needs to be selected for Pro Image features
  const checkAndPromptForKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
         try {
           await window.aistudio.openSelectKey();
           return await window.aistudio.hasSelectedApiKey();
         } catch (e) {
           console.error("Key selection failed or cancelled", e);
           return false;
         }
      }
      return true;
    }
    // If not in an environment with window.aistudio, assume process.env.API_KEY is sufficient
    return true;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      const isKeyReady = await checkAndPromptForKey();
      if (!isKeyReady) {
        setError("An API key selection is required to use the Pro Image model.");
        setIsLoading(false);
        return;
      }

      const imageUrl = await generateProImage(prompt, size);
      setResult({
        url: imageUrl,
        prompt,
        size
      });
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found")) {
         setError("API Key issue detected. Please try selecting your key again.");
         // Optional: Reset key selection state if possible, but here we just guide user
      } else {
         setError("Failed to generate image. " + (err.message || "Unknown error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openKeySelection = async () => {
      if (window.aistudio?.openSelectKey) {
          await window.aistudio.openSelectKey();
      }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-6">
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <ImageIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold text-white">Pro Image Studio</h2>
              </div>
              {window.aistudio && (
                  <button 
                    onClick={openKeySelection}
                    className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Key size={12} /> Manage Key
                  </button>
              )}
           </div>
          
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic city with flying cars, neon lights, 4k render..."
                className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`py-2 px-4 rounded-lg font-medium transition-all ${
                    size === s 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 text-red-200 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating High-Res Asset...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="flex-[1.5] bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden relative min-h-[400px]">
        {result ? (
          <div className="relative w-full h-full flex items-center justify-center group">
             <img 
               src={result.url} 
               alt={result.prompt} 
               className="max-w-full max-h-full object-contain shadow-2xl"
             />
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <a 
                  href={result.url} 
                  download={`gemini-${Date.now()}.png`}
                  className="pointer-events-auto bg-white text-slate-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"
                >
                  <Download className="w-5 h-5" /> Download {result.size}
                </a>
             </div>
          </div>
        ) : (
          <div className="text-center text-slate-600">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Ready to create</p>
            <p className="text-sm">Select a size and enter a prompt to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};
