import React from 'react';
import { MessageSquare } from 'lucide-react';
import { checkIsServiceOnline } from '../utils/format';

interface ContactFloatProps {
  onOpen: () => void;
}

export const ContactFloat: React.FC<ContactFloatProps> = ({ onOpen }) => {
  const { isOnline } = checkIsServiceOnline();

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
      <button
        onClick={onOpen}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-forest-900 hover:bg-forest-800 text-white shadow-elevated hover:shadow-2xl transition-all active:scale-95 group border border-forest-700"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-emerald-300" />
          <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold leading-none">联系专人客服</div>
          <div className="text-[10px] text-emerald-300/80 leading-none mt-1">
            {isOnline ? '秒回消息中' : '19:00~24:00'}
          </div>
        </div>
      </button>
    </div>
  );
};
