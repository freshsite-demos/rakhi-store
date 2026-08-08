import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  stock: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  stock,
  onIncrease,
  onDecrease,
  onRemove,
  size = 'md',
}) => {
  const isSm = size === 'sm';

  const handleDecreaseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDecrease();
  };

  const handleIncreaseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onIncrease();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  return (
    <div
      className={`inline-flex items-center justify-between bg-zinc-950 text-white rounded-xl shadow-lg border border-zinc-900 font-extrabold select-none ${
        isSm ? 'px-2.5 py-1.5 gap-2.5 text-xs' : 'px-3.5 py-2.5 gap-4.5 text-sm'
      }`}
    >
      <button
        onClick={handleDecreaseClick}
        className="hover:text-amber-400 transition-colors active:scale-90"
        aria-label="Decrease quantity"
      >
        <Minus className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </button>

      <span className="w-5 text-center text-amber-400 font-black">{quantity}</span>

      {quantity >= stock ? (
        <span
          className="opacity-20 cursor-not-allowed"
          title="Maximum stock reached"
          aria-disabled="true"
        >
          <Plus className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </span>
      ) : (
        <button
          onClick={handleIncreaseClick}
          className="hover:text-amber-400 transition-colors active:scale-90"
          aria-label="Increase quantity"
        >
          <Plus className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </button>
      )}

      {onRemove && (
        <button
          onClick={handleRemoveClick}
          className="ml-1 text-rose-400 hover:text-rose-300 transition-colors border-l border-zinc-800 pl-2 active:scale-90"
          aria-label="Remove item"
        >
          <Trash2 className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </button>
      )}
    </div>
  );
};
export default QuantitySelector;
