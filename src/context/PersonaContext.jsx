import React, { createContext, useContext, useState, useEffect } from 'react';

const PersonaContext = createContext();

export function usePersona() {
  return useContext(PersonaContext);
}

export function PersonaProvider({ children }) {
  // 'general', 'developer', 'recruiter'
  const [persona, setPersona] = useState(() => {
    return localStorage.getItem('visitor_persona') || 'general';
  });

  useEffect(() => {
    localStorage.setItem('visitor_persona', persona);
  }, [persona]);

  // Derived layout order based on persona
  const getSectionOrder = (sections) => {
    if (persona === 'developer') {
      return prioritize(sections, ['projects', 'skills', 'experience']);
    }
    if (persona === 'recruiter') {
      return prioritize(sections, ['experience', 'education', 'certifications', 'projects']);
    }
    return sections; // general order
  };

  const prioritize = (arr, topKeys) => {
    const top = [];
    const rest = [];
    arr.forEach(item => {
      const key = typeof item === 'string' ? item : (item.id || item.key);
      if (topKeys.includes(key)) top.push(item);
      else rest.push(item);
    });
    
    // Sort top array to match the order in topKeys
    top.sort((a, b) => {
      const keyA = typeof a === 'string' ? a : (a.id || a.key);
      const keyB = typeof b === 'string' ? b : (b.id || b.key);
      return topKeys.indexOf(keyA) - topKeys.indexOf(keyB);
    });

    return [...top, ...rest];
  };

  return (
    <PersonaContext.Provider value={{ persona, setPersona, getSectionOrder }}>
      {children}
    </PersonaContext.Provider>
  );
}
