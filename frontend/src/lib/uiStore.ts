import { create } from 'zustand';

interface EditorialUiState {
  savedSlugs: string[];
  toggleSaved: (slug: string) => void;
  isSearchOpen: boolean;
  setSearchOpen: (isOpen: boolean) => void;
}

export const useEditorialUiStore = create<EditorialUiState>((set) => ({
  savedSlugs: [],
  toggleSaved: (slug) =>
    set((state) => ({
      savedSlugs: state.savedSlugs.includes(slug)
        ? state.savedSlugs.filter((item) => item !== slug)
        : [...state.savedSlugs, slug],
    })),
  isSearchOpen: false,
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
}));
