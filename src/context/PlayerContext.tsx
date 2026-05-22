import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../utils/supabase';

export interface PlayerProfile {
  id: string;
  global_id: number;
  username: string;
  birth_month: number;
  birth_day: number;
  birth_year: number;
  player_level: number;
  gold_balance: number;
  combat_class: string | null;
  constellation_title: string | null;
  zodiac_title: string | null;
  created_at: string;
}

interface PlayerContextValue {
  player: PlayerProfile | null;
  setPlayer: (p: PlayerProfile) => void;
  patchPlayer: (fields: Partial<PlayerProfile>) => void;
  signOut: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);

  function patchPlayer(fields: Partial<PlayerProfile>) {
    setPlayer(prev => prev ? { ...prev, ...fields } : prev);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setPlayer(null);
  }

  return (
    <PlayerContext.Provider value={{ player, setPlayer, patchPlayer, signOut }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
