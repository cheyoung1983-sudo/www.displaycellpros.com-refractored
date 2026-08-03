import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

export default function Store() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  useEffect(() => {
    axios.get(`${API}/api/products`).then((r) => setProducts(r.data)).catch(() => {});
  }, []);
  const add = (id) => setCart((c) => (c.includes(id) ? c : [...c, id]));
  return (
    <section id="store" data-testid="store-section" className="relative py-28 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
          <div>
            <div className="font-mono text-xs tracking-[0.3em] text-[color:var(--magenta)] mb-3">// 03 — SUPPLY DEPOT</div>
            <h2 className="text-4xl md:text-5xl font-black neon-text">FIELD-GRADE GEAR</h2>
          </div>
          <div data-testid="cart-indicator" className="glass px-5 py-3 clip-tag flex items-center gap-3 font-mono text-xs tracking-widest">
            <ShoppingCart size={16} className="text-[color:var(--cyan)]" />
            <span className="text-white">{cart.length} IN CART</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <motion.div key={p.id} data-testid={`product-card-${p.id}`}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass clip-tag overflow-hidden group">
              <div className="relative h-44 overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
                <span className="absolute top-3 left-3 font-mono text-[9px] tracking-widest px-2 py-1 bg-void/70 text-[color:var(--cyan)] border border-cyan-neon/30">{p.category}</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-sm mb-1">{p.name}</h3>
                <p className="text-slate-500 text-xs mb-4 min-h-[32px]">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-[color:var(--cyan)]">${p.price}</span>
                  <button data-testid={`add-to-cart-${p.id}`} onClick={() => add(p.id)}
                    className={`btn-neon px-4 py-2 clip-tag font-mono text-[10px] tracking-widest font-bold flex items-center gap-1 ${cart.includes(p.id) ? "bg-lime-neon text-void" : "bg-[color:var(--cyan)] text-void hover:bg-[color:var(--magenta)]"}`}>
                    {cart.includes(p.id) ? <><Check size={12} /> ADDED</> : "ADD"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
