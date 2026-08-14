import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '../context/ThemeContext';
import { PersonaProvider } from '../context/PersonaContext';
import { AuthProvider } from '../context/AuthContext';
import { IslandProvider } from '../context/IslandContext';

/**
 * Unified application providers wrapper
 * Ensures clean decoupling and zero provider-nesting clutter in App.jsx
 */
export default function AppProviders({ children }) {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <PersonaProvider>
          <AuthProvider>
            <IslandProvider>
              {children}
            </IslandProvider>
          </AuthProvider>
        </PersonaProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
