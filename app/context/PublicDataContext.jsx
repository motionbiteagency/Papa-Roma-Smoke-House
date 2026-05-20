'use client';
// PublicDataContext — provides pre-fetched public site data (config, menus,
// testimonials) to all client components. Populated by the server in layout.js.

import { createContext, useContext } from 'react';

const PublicDataContext = createContext(null);

export function PublicDataProvider({ children, config, menuData, testimonials }) {
  return (
    <PublicDataContext.Provider value={{ config, menuData, testimonials }}>
      {children}
    </PublicDataContext.Provider>
  );
}

export function usePublicData() {
  const ctx = useContext(PublicDataContext);
  // Graceful fallback so components don't crash if context isn't mounted yet
  if (!ctx) return { config: {}, menuData: { menuTypes: [] }, testimonials: { testimonials: [] } };
  return ctx;
}
