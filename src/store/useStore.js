import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Theme & Preferences ────────────────────────
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        document.documentElement.setAttribute('data-theme', next);
      },
      cursorStyle: 'magic', // 'magic' or 'system'
      toggleCursor: () => {
        set({ cursorStyle: get().cursorStyle === 'magic' ? 'system' : 'magic' });
      },


      // ── Auth ───────────────────────────────────────
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null, designs: [] }),

      // ── Designs ────────────────────────────────────
      designs: [],
      addDesign: (d) => set((s) => ({ designs: [d, ...s.designs] })),
      updateDesign: (id, data) =>
        set((s) => ({ designs: s.designs.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
      removeDesign: (id) => set((s) => ({ designs: s.designs.filter((d) => d.id !== id) })),

      // ── Active canvas design ─────────────────────
      activeDesign: null,
      setActiveDesign: (d) => set({ activeDesign: d }),

      // ── Notifications ─────────────────────────────
      notifications: [],
      addNotif: (msg, type = 'info') => {
        const id = Date.now();
        set((s) => ({ notifications: [{ id, msg, type }, ...s.notifications.slice(0, 9)] }));
        setTimeout(() => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })), 4000);
      },
    }),
    {
      name: 'designx-store',
      partialize: (s) => ({ theme: s.theme, cursorStyle: s.cursorStyle, user: s.user, token: s.token, designs: s.designs }),
    }
  )
);
