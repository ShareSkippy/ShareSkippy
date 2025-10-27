import { useState, useEffect, useCallback } from 'react';

export const useAvailabilityDraft = (initialFormData, draftKey = 'availabilityDraft') => {
  const [formData, setFormData] = useState(initialFormData);
  const [hasDraft, setHasDraft] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Save to sessionStorage with error handling
  const saveToSessionStorage = useCallback((data) => {
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({
        ...data,
        timestamp: Date.now(),
        version: '2.0'
      }));
      // eslint-disable-next-line no-console
      console.log(`💾 Availability draft saved to sessionStorage (${draftKey})`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`❌ Failed to save availability draft to sessionStorage (${draftKey}):`, error);
      // Handle quota exceeded by clearing old data
      if (error.name === 'QuotaExceededError') {
        try {
          sessionStorage.clear();
          sessionStorage.setItem(draftKey, JSON.stringify({
            ...data,
            timestamp: Date.now(),
            version: '2.0'
          }));
          // eslint-disable-next-line no-console
          console.log(`💾 Availability draft saved after clearing storage (${draftKey})`);
        } catch (retryError) {
          // eslint-disable-next-line no-console
          console.error(`❌ Failed to save availability draft even after clearing storage (${draftKey}):`, retryError);
        }
      }
    }
  }, [draftKey]);

  // Load from sessionStorage with error handling
  const loadFromSessionStorage = useCallback(() => {
    try {
      const draft = sessionStorage.getItem(draftKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        // eslint-disable-next-line no-console
        console.log(`📂 Availability draft loaded from sessionStorage (${draftKey})`);
        setHasDraft(true);
        return parsed;
      }
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`❌ Failed to load availability draft from sessionStorage (${draftKey}):`, error);
      // Clear corrupted data
      try {
        sessionStorage.removeItem(draftKey);
      } catch (clearError) {
        // eslint-disable-next-line no-console
        console.warn(`❌ Failed to clear corrupted availability draft (${draftKey}):`, clearError);
      }
      return null;
    }
  }, [draftKey]);

  // Clear draft from sessionStorage
  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(draftKey);
      setHasDraft(false);
      // eslint-disable-next-line no-console
      console.log(`🗑️ Availability draft cleared from sessionStorage (${draftKey})`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`❌ Failed to clear availability draft (${draftKey}):`, error);
    }
  }, [draftKey]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === draftKey && e.newValue && !isSyncing) {
        try {
          const newDraft = JSON.parse(e.newValue);
          // Strip metadata fields before setting form data
          const { timestamp, version, ...formData } = newDraft;
          setIsSyncing(true);
          setFormData(formData);
          setHasDraft(true);
          // eslint-disable-next-line no-console
          console.log(`🔄 Availability draft synchronized from another tab (${draftKey})`);
          // Reset sync flag after a brief delay
          setTimeout(() => setIsSyncing(false), 100);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`❌ Failed to sync availability draft from storage event (${draftKey}):`, error);
          setIsSyncing(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [draftKey, isSyncing]);

  // Update form data and auto-save
  const updateFormData = useCallback((updater) => {
    setFormData(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      // Only save if we're not currently syncing from another tab
      if (!isSyncing) {
        saveToSessionStorage(updated);
      }
      return updated;
    });
  }, [saveToSessionStorage, isSyncing]);

  return {
    formData,
    setFormData: updateFormData,
    loadDraft: loadFromSessionStorage,
    clearDraft,
    hasDraft,
    draftSource: hasDraft ? 'session' : null
  };
};
