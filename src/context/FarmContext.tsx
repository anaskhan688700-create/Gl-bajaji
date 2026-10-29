import React, { createContext, useContext, useState, useEffect } from 'react';
import { Farm } from '../types';
import { useAuth } from './AuthContext';

interface FarmContextType {
  farms: Farm[];
  selectedFarm: Farm | null;
  setSelectedFarmId: (id: string) => void;
  createFarm: (farmData: Partial<Farm>) => Promise<Farm | null>;
  updateFarm: (id: string, updates: Partial<Farm>) => Promise<boolean>;
  deleteFarm: (id: string) => Promise<boolean>;
  refreshFarms: () => Promise<void>;
  isLoading: boolean;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-01');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFarms = async () => {
    try {
      const res = await fetch('/api/v1/farms', {
        headers: { 'x-user-id': user?.id || 'usr-farmer-01' },
      });
      const data = await res.json();
      if (data.success && data.farms) {
        setFarms(data.farms);
        if (!data.farms.some((f: Farm) => f.id === selectedFarmId) && data.farms.length > 0) {
          setSelectedFarmId(data.farms[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch farms:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [user]);

  const selectedFarm = farms.find(f => f.id === selectedFarmId) || farms[0] || null;

  const createFarm = async (farmData: Partial<Farm>): Promise<Farm | null> => {
    try {
      const res = await fetch('/api/v1/farms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'usr-farmer-01',
        },
        body: JSON.stringify(farmData),
      });
      const data = await res.json();
      if (data.success && data.farm) {
        setFarms(prev => [...prev, data.farm]);
        setSelectedFarmId(data.farm.id);
        return data.farm;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const updateFarm = async (id: string, updates: Partial<Farm>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/farms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.farm) {
        setFarms(prev => prev.map(f => (f.id === id ? data.farm : f)));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const deleteFarm = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/farms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFarms(prev => prev.filter(f => f.id !== id));
        if (selectedFarmId === id) {
          const remaining = farms.filter(f => f.id !== id);
          if (remaining.length > 0) setSelectedFarmId(remaining[0].id);
        }
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <FarmContext.Provider
      value={{
        farms,
        selectedFarm,
        setSelectedFarmId,
        createFarm,
        updateFarm,
        deleteFarm,
        refreshFarms: fetchFarms,
        isLoading,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarms = () => {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarms must be used within a FarmProvider');
  return context;
};

