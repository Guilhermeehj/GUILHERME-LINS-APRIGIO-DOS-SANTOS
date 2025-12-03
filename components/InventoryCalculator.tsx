import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Save } from 'lucide-react';
import { InventoryItem } from '../types';

export const InventoryCalculator: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemQty || !newItemPrice) return;

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: Number(newItemQty),
      price: Number(newItemPrice)
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemQty('');
    setNewItemPrice('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="h-full flex items-center justify-center p-4 bg-slate-900">
      <div className="bg-red-700 rounded-[30px] p-6 shadow-[0_20px_50px_rgba(220,38,38,0.3)] w-full max-w-3xl border-4 border-red-800 relative overflow-hidden">
        {/* Decorative gloss */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-3">
             <div className="bg-red-900 p-3 rounded-xl shadow-inner border border-red-800">
                <Calculator className="text-red-200 w-6 h-6" />
             </div>
             <div>
                 <h2 className="text-2xl font-bold text-white tracking-tight" style={{textShadow: "0 2px 4px rgba(0,0,0,0.3)"}}>
                   RedCalc Stock
                 </h2>
                 <p className="text-red-200 text-xs font-medium opacity-80">INVENTORY MASTER 3000</p>
             </div>
          </div>
          <div className="text-right bg-red-950/50 px-4 py-2 rounded-lg border border-red-900/50">
             <div className="text-red-300 text-xs uppercase font-bold">Total Value</div>
             <div className="text-3xl font-mono text-white font-bold">${totalValue.toFixed(2)}</div>
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={addItem} className="bg-red-800/50 p-4 rounded-xl mb-4 border border-red-600/30 flex gap-2 shadow-inner">
           <input 
             type="text" 
             value={newItemName}
             onChange={e => setNewItemName(e.target.value)}
             placeholder="Item Name" 
             className="flex-[2] bg-red-900/60 border border-red-700 rounded-lg px-4 py-2 text-white placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-400"
           />
           <input 
             type="number" 
             value={newItemQty}
             onChange={e => setNewItemQty(e.target.value)}
             placeholder="Qty" 
             className="flex-1 bg-red-900/60 border border-red-700 rounded-lg px-4 py-2 text-white placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-400"
           />
           <input 
             type="number" 
             value={newItemPrice}
             onChange={e => setNewItemPrice(e.target.value)}
             placeholder="Price" 
             className="flex-1 bg-red-900/60 border border-red-700 rounded-lg px-4 py-2 text-white placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-400"
           />
           <button type="submit" className="bg-white text-red-700 hover:bg-red-50 font-bold p-2 rounded-lg transition-colors shadow-lg">
             <Plus className="w-6 h-6" />
           </button>
        </form>

        {/* List */}
        <div className="bg-white rounded-xl h-[300px] overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] flex flex-col">
            <div className="grid grid-cols-12 gap-2 bg-slate-100 p-3 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-thin">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                        <Save className="w-12 h-12 mb-2" />
                        <p>No items in stock</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 hover:bg-slate-100 transition-colors">
                            <div className="col-span-5 font-semibold text-slate-900 truncate">{item.name}</div>
                            <div className="col-span-2 text-right font-mono text-sm">{item.quantity}</div>
                            <div className="col-span-2 text-right font-mono text-sm">${item.price}</div>
                            <div className="col-span-2 text-right font-mono font-bold text-red-600">${(item.quantity * item.price).toFixed(2)}</div>
                            <div className="col-span-1 text-right">
                                <button onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="bg-slate-100 p-3 border-t border-slate-200 flex justify-between text-sm text-slate-600">
                <span>Total Items: <strong>{totalItems}</strong></span>
                <span>Entries: <strong>{items.length}</strong></span>
            </div>
        </div>
      </div>
    </div>
  );
};
