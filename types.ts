export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface GeneratedImage {
  url: string;
  prompt: string;
  size: ImageSize;
}

export interface MusicTheoryData {
  name: string;
  type: 'scale' | 'chord' | 'interval' | 'melody';
  notes: string[]; // e.g., ["C", "D", "E"]
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}
