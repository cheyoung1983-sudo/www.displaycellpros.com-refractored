"use client";

import React, { useTransition } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { addToCart } from "@/lib/cart-actions";

export function AddToCartButton({
  variantId,
  availableForSale,
}: {
  variantId: string;
  availableForSale: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await addToCart(variantId);
      } catch (error) {
        console.error("Failed to add to cart:", error);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={!availableForSale || isPending}
      className="bg-slate-700 hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
      title={!availableForSale ? "Sold Out" : "Add to Cart"}
    >
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <ShoppingCart size={18} />
      )}
    </button>
  );
}
