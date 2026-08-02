import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/shopify-types';
import { AddToCartButton } from '@/app/store/add-to-cart-button';
import Link from 'next/link';

interface StoreViewProps {
  products: Product[];
  cartCount?: number;
}

export function StoreView({ products, cartCount = 0 }: StoreViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Logistics & Supply</h1>
          <p className="text-slate-400 mt-2">Premium Gear & Certified Pre-Owned Devices</p>
        </div>
        <Link
          href="/store/cart"
          className="flex items-center text-slate-400 bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 transition-colors"
        >
          <ShoppingCart size={18} className="mr-2 text-blue-400" />
          <span className="text-sm font-semibold">Cart ({cartCount})</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => {
          const firstVariant = product.variants.nodes[0];
          return (
            <div key={product.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden group flex flex-col">
              <div className="h-48 overflow-hidden relative">
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
                    No Image
                  </div>
                )}
                {product.availableForSale === false && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white font-bold px-3 py-1 bg-red-600 rounded text-xs uppercase tracking-wider">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-white mb-2 leading-tight line-clamp-2">{product.title}</h3>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-400">
                    ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                  </span>
                  {firstVariant && (
                    <AddToCartButton
                      variantId={firstVariant.id}
                      availableForSale={product.availableForSale}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
