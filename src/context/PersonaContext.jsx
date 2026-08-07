import React, { createContext, useContext, useState, useEffect } from 'react';

const PersonaContext = createContext();

export function usePersona() {
  return useContext(PersonaContext);
}

export function PersonaProvider({ children }) {
  // 'general', 'developer', 'recruiter', 'founder', 'student'
  const [persona, setPersonaState] = useState(() => {
    return localStorage.getItem('visitor_persona') || 'general';
  });

  const [hasChosenPersona, setHasChosenPersona] = useState(() => {
    return localStorage.getItem('visitor_persona_chosen') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('visitor_persona', persona);
  }, [persona]);

  const setPersonaAndCommit = (newPersona) => {
    setPersonaState(newPersona);
    setHasChosenPersona(true);
    localStorage.setItem('visitor_persona', newPersona);
    localStorage.setItem('visitor_persona_chosen', 'true');
  };

  const resetPersonaChoice = () => {
    setHasChosenPersona(false);
    localStorage.removeItem('visitor_persona_chosen');
  };

  // Derived layout order based on persona - return sections as-is to preserve sidebar layout
  const getSectionOrder = (sections) => {
    return sections; // general order preserved for all roles
  };

  return (
    <PersonaContext.Provider value={{
      persona,
      setPersona: setPersonaAndCommit,
      hasChosenPersona,
      resetPersonaChoice,
      getSectionOrder
    }}>
      {children}
    </PersonaContext.Provider>
  );
}
