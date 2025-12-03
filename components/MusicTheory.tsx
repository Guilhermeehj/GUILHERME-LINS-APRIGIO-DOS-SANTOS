import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Music, Search, Loader2 } from 'lucide-react';
import { getMusicTheoryAnalysis } from '../services/gemini';
import { MusicTheoryData } from '../types';

export const MusicTheory: React.FC = () => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<MusicTheoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const drawKeyboard = (activeNotes: string[]) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 200;
    const whiteKeyWidth = width / 14; // 2 octaves approx
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = height * 0.6;

    // Define 2 octaves of keys
    const keys = [];
    let x = 0;
    
    // Generate 2 octaves of keys (C3 to B4)
    for (let octave = 3; octave <= 4; octave++) {
      NOTES.forEach((note) => {
        const isBlack = note.includes('#');
        // Normalize active note check (ignore octave for simple matching if not provided)
        // Check if the base note is in the activeNotes list
        const isActive = activeNotes.some(n => {
           // Basic normalization: Remove octaves from input 'n' if present, or match exact
           const cleanN = n.replace(/[0-9]/g, '');
           return cleanN === note;
        });

        keys.push({ note, isBlack, x: 0, isActive, octave });
      });
    }

    // Assign X positions
    let whiteX = 0;
    keys.forEach(key => {
        if (!key.isBlack) {
            key.x = whiteX;
            whiteX += whiteKeyWidth;
        } else {
            // Black keys are positioned relative to previous white key
            // C# is between C and D. C is at whiteX - whiteKeyWidth. 
            // So C# center is at (whiteX - whiteKeyWidth) + whiteKeyWidth = whiteX.
            // Actually simpler: visual placement logic
            const lastWhiteX = whiteX - whiteKeyWidth;
            key.x = lastWhiteX + (whiteKeyWidth * 0.7); 
        }
    });

    // Draw White Keys
    svg.append("g")
       .selectAll("rect")
       .data(keys.filter(k => !k.isBlack))
       .enter()
       .append("rect")
       .attr("x", d => d.x)
       .attr("y", 0)
       .attr("width", whiteKeyWidth)
       .attr("height", height)
       .attr("fill", d => d.isActive ? "#6366f1" : "white") // Indigo if active
       .attr("stroke", "#334155")
       .attr("rx", 4)
       .attr("ry", 4);

    // Draw Black Keys
    svg.append("g")
       .selectAll("rect")
       .data(keys.filter(k => k.isBlack))
       .enter()
       .append("rect")
       .attr("x", d => d.x)
       .attr("y", 0)
       .attr("width", blackKeyWidth)
       .attr("height", blackKeyHeight)
       .attr("fill", d => d.isActive ? "#818cf8" : "#1e293b") // Lighter indigo if active
       .attr("stroke", "#0f172a")
       .attr("rx", 2)
       .attr("ry", 2);
    
    // Labels
    svg.append("g")
       .selectAll("text")
       .data(keys.filter(k => !k.isBlack)) // Label white keys
       .enter()
       .append("text")
       .text(d => d.note)
       .attr("x", d => d.x + whiteKeyWidth / 2)
       .attr("y", height - 20)
       .attr("text-anchor", "middle")
       .attr("fill", d => d.isActive ? "white" : "#64748b")
       .style("font-size", "12px");
  };

  useEffect(() => {
    if (data) {
      drawKeyboard(data.notes);
    } else {
      drawKeyboard([]); // Draw empty keyboard initially
    }
  }, [data]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const result = await getMusicTheoryAnalysis(query);
      setData(result);
    } catch (e) {
      console.error(e);
      alert("Could not analyze music request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                    AI Music Theory
                </h2>
                <p className="text-slate-400">Visualize scales, chords, and intervals instantly.</p>
            </div>

            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto w-full">
                <input 
                    type="text" 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="e.g., C Major Scale, D Minor 7, Tritone from C"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 pl-12 pr-4 py-4 rounded-full shadow-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <button 
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-full transition-colors"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Music className="w-5 h-5" />}
                </button>
            </form>

            <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
                {data && (
                    <div className="mb-6 text-center">
                         <h3 className="text-2xl font-bold text-white mb-1">{data.name}</h3>
                         <span className="inline-block px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                             {data.type}
                         </span>
                         <p className="text-slate-400 max-w-2xl mx-auto">{data.description}</p>
                    </div>
                )}
                
                <div className="overflow-x-auto flex justify-center pb-2">
                    <svg 
                        ref={svgRef} 
                        viewBox="0 0 800 200" 
                        className="w-full max-w-[800px] h-auto select-none"
                    />
                </div>
            </div>
        </div>
    </div>
  );
};
