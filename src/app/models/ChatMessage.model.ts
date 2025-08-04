export interface RawChatMessage {
  id: number;
  content: string;
  timestamp: number[]; // [year, month, day, hour, min, sec]
  sender: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  receiver: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface ChatMessage {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}
