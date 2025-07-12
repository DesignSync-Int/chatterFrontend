import { create } from 'zustand';

export type Route = 'login' | 'home' | 'chat' | 'profile';

type PageState = {
  currentPage: Route;
  setCurrentPage: (page: Route) => void;
};

const usePageStore = create<PageState>(set => ({
  currentPage: 'login',
  setCurrentPage: (page: Route) => set({ currentPage: page }),
}));

export default usePageStore;
