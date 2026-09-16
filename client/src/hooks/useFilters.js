import { useState, useEffect, useCallback } from 'react';

export function useFilters() {
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get('search') || '',
      priority: params.get('priority') || '',
      assignee: params.get('assignee') || ''
    };
  });

  const updateFilters = useCallback((newFilters) => {
    const params = new URLSearchParams(window.location.search);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
    
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setFilters({
        search: params.get('search') || '',
        priority: params.get('priority') || '',
        assignee: params.get('assignee') || ''
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return [filters, updateFilters];
}
