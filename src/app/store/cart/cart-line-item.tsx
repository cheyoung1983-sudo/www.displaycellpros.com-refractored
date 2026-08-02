"use client";

import React, { useTransition } from "react";
import { Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { updateCartLine, removeFromCart } from "@/lib/cart-actions";
import type { CartLine } from "@/lib/shopify-types";

export function CartLineItem({ line }: { line: CartLine }) {
  const [isPending, startTransition] = useTransition();

  function handleUpdateQuantity(newQuantity: number) {
    startTransition(async () => {
      if (newQuantity <= 0) {
        await removeFromCart(line.id);
      } else {
        await updateCartLine(line.id, newQuantity);
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeFromCart(line.id);
    });
  }

  return (
    <tr className={`border-b border-slate-800 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      <td className="py-6 pr-4">
        <div className="flex items-center">
          {line.merchandise.image && (
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-700 bg-slate-900 mr-4">
              <img
                src={line.merchandise.image.url}
                alt={line.merchandise.image.altText || line.merchandise.product.title}
                className="h-full w-full object-cover object-center"
              />
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-white">{line.merchandise.product.title}</h3>
            {line.merchandise.title !== "Default Title" && (
              <p className="mt-1 text-xs text-slate-400">{line.merchandise.title}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-6 px-4 text-sm text-slate-300">
        ${parseFloat(line.merchandise.price.amount).toFixed(2)}
      </td>
      <td className="py-6 px-4">
        <div className="flex items-center border border-slate-700 rounded-lg w-fit">
          <button
            onClick={() => handleUpdateQuantity(line.quantity - 1)}
            disabled={isPending}
            className="p-1 hover:text-blue-400 disabled:text-slate-600 transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="px-3 text-sm text-white min-w-[30px] text-center">{line.quantity}</span>
          <button
            onClick={() => handleUpdateQuantity(line.quantity + 1)}
            disabled={isPending}
            className="p-1 hover:text-blue-400 disabled:text-slate-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </td>
      <td className="py-6 px-4 text-sm font-medium text-blue-400">
        ${parseFloat(line.cost.totalAmount.amount).toFixed(2)}
      </td>
      <td className="py-6 pl-4 text-right">
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="text-slate-500 hover:text-red-400 transition-colors"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
      </td>
    </tr>
  );
}
