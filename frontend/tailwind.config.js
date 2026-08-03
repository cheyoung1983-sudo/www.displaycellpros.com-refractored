/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        void: "#05060a",
        panel: "#0a0d16",
        cyan: { neon: "#00e5ff" },
        magenta: { neon: "#ff2bd6" },
        lime: { neon: "#a6ff00" },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        mono: ["'Share Tech Mono'", "monospace"],
        body: ["'Rajdhani'", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(0,229,255,0.35)",
        magenta: "0 0 24px rgba(255,43,214,0.35)",
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        scanline: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100%)" } },
        flicker: { "0%,100%": { opacity: 1 }, "45%": { opacity: 0.85 }, "50%": { opacity: 0.4 }, "55%": { opacity: 0.9 } },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        scanline: "scanline 6s linear infinite",
        flicker: "flicker 4s infinite",
      },
    },
  },
  plugins: [],
};
