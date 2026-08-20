import React, { useCallback } from 'react';
import useRealtimeData from './useRealtimeData';
import { useIsland } from '../context/IslandContext';
import { Lock } from 'lucide-react';
import haptic from '../lib/haptics';

export const MODULE_DEFINITIONS = {
  experience: {
    id: 'experience',
    flag: 'feature_experience',
    label: 'Experience & Timeline',
    shortLabel: 'Experience',
    description: 'Career history, roles & achievements.',
    color: '#6366F1',
  },
  certifications: {
    id: 'certifications',
    flag: 'feature_certifications',
    label: 'Certifications & Awards',
    shortLabel: 'Certifications',
    description: 'Credentials, badges & recognitions.',
    color: '#10B981',
  },
  updates: {
    id: 'updates',
    flag: 'feature_updates',
    label: 'Updates Feed',
    shortLabel: 'Updates',
    description: 'Live activity & project updates stream.',
    color: '#8B5CF6',
  },
};

export function useModuleStatus() {
  const { data: dbSettings } = useRealtimeData('site_settings', {
    single: true,
    filter: { column: 'id', value: 1 },
  });

  const island = useIsland();
  const triggerIsland = island?.triggerIsland;

  const isModuleEnabled = useCallback(
    (moduleId) => {
      const def = MODULE_DEFINITIONS[moduleId];
      if (!def) return true;
      const flagKey = def.flag;
      // Default is enabled unless explicitly false in settings
      return dbSettings?.[flagKey] !== false;
    },
    [dbSettings]
  );

  const notifyModuleDisabled = useCallback(
    (moduleNameOrId) => {
      const def = MODULE_DEFINITIONS[moduleNameOrId];
      const moduleLabel = def?.label || moduleNameOrId || 'Section';

      try {
        haptic.warning();
      } catch (_) {}

      // Trigger Dynamic Island at top center
      if (typeof triggerIsland === 'function') {
        triggerIsland({
          title: 'Disabled by Admin',
          subtitle: `${moduleLabel} is currently disabled`,
          icon: React.createElement(Lock, { size: 15, color: '#EF4444' }),
          color: '#EF4444',
          duration: 3500,
        });
      }

      // Also dispatch custom event for listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('pcms_module_disabled_alert', {
            detail: {
              moduleId: def?.id || moduleNameOrId,
              moduleLabel,
              message: `${moduleLabel} is currently disabled by the administrator.`,
            },
          })
        );
      }
    },
    [triggerIsland]
  );

  return {
    dbSettings,
    isModuleEnabled,
    notifyModuleDisabled,
    modules: MODULE_DEFINITIONS,
  };
}

export default useModuleStatus;
