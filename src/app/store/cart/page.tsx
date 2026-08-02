import React from 'react';
import { getCart } from "@/lib/cart-actions";
import { CartLineItem } from "./cart-line-item";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, ExternalLink } from "lucide-react";

export default async function CartPage() {
  const cart = await getCart();

  if (!cart || cart.lines.nodes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-in fade-in duration-300">
        <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-800 backdrop-blur-sm">
          <ShoppingBag size={48} className="mx-auto text-slate-600 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Your Cart is Empty</h1>
          <p className="text-slate-400 mb-8">It looks like you haven't added anything to your cart yet.</p>
          <Link
            href="/store"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-semibold"
          >
            <ArrowLeft size={18} className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <ShoppingBag className="mr-3 text-blue-400" />
          Shopping Cart
        </h1>
        <Link
          href="/store"
          className="text-slate-400 hover:text-white transition-colors flex items-center text-sm"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Store
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="bg-slate-800/30 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quantity</th>
                  <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {cart.lines.nodes.map((line) => (
                  <CartLineItem key={line.id} line={line} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-4">Order Summary</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>${parseFloat(cart.cost.subtotalAmount.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-xs uppercase font-bold text-slate-500">Calculated at checkout</span>
              </div>
              <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                <span className="text-white font-bold">Total</span>
                <span className="text-2xl font-bold text-blue-400">
                  ${parseFloat(cart.cost.totalAmount.amount).toFixed(2)}
                </span>
              </div>
            </div>

            <a
              href={cart.checkoutUrl}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center group shadow-lg shadow-blue-900/20"
            >
              Checkout Now
              <ExternalLink size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </a>

            <p className="mt-4 text-center text-xs text-slate-500">
              Secure Checkout via Shopify
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
