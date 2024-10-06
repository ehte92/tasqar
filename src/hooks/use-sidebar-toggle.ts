import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarToggleState {
  isOpen: boolean;
  toggle: () => void;
}

export const useSidebarToggle = create<SidebarToggleState>()(
  persist(
    (set) => ({
      isOpen: true,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'sidebar-toggle',
    }
  )
);
