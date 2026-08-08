import React from 'react';
import type { Product } from '../types';
import ProductCard from './ProductCard';
import { Sparkles } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, idx) => (
          <div
            key={idx}
            className="border border-zinc-100 rounded-2xl p-4 flex flex-col gap-4 animate-pulse h-full bg-zinc-50/50"
          >
            <div className="aspect-square w-full rounded-xl bg-zinc-200" />
            <div className="flex-grow flex flex-col gap-2">
              <div className="h-4 w-1/3 bg-zinc-200 rounded" />
              <div className="h-5 w-3/4 bg-zinc-200 rounded" />
              <div className="h-3 w-5/6 bg-zinc-200 rounded mt-1" />
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100">
              <div className="h-6 w-1/3 bg-zinc-200 rounded" />
              <div className="h-9 w-20 bg-zinc-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300">
          <Sparkles className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-extrabold text-zinc-900 text-base">No Rakhis found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs">
            Try adjusting your search filters or clearing the search query.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};
export default ProductGrid;
