import { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { usePlayer } from '../../context/PlayerContext';
import ProfilePanel from '../ProfilePanel';
import HubScene from './HubScene';
import PlayerCharacter from './PlayerCharacter';
import SkillHUD from './SkillHUD';
import BottomNav from './BottomNav';
import LifeWeb from './LifeWeb';

const CLASS_COLORS: Record<string, string> = {
  Warrior: '#c0392b', Mage: '#2980b9', Rogue: '#95a5a6',
  Paladin: '#f39c12', Ranger: '#27ae60', Necromancer: '#8e44ad',
  Monk: '#e67e22', Druid: '#16a085', Berserker: '#d35400',
};

function LoadingFallback() {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#030912', color: 'rgba(79,195,247,0.7)',
      fontFamily: 'system-ui', fontSize: 14, letterSpacing: '0.15em', textTransform: 'uppercase',
    }}>
      Initializing Hub…
    </div>
  );
}

export default function Lobby() {
  const { player } = usePlayer();
  const [tab, setTab] = useState('hub');
  const [attackFlash, setAttackFlash] = useState(false);
  const [attackTick, setAttackTick] = useState(0);

  const classColor = CLASS_COLORS[player?.combat_class ?? ''] ?? '#4fc3f7';

  const handleAttack = useCallback(() => {
    setAttackFlash(true);
    setAttackTick(t => t + 1);
    setTimeout(() => setAttackFlash(false), 180);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#030912' }}>

      {/* 3D Hub — always mounted so state persists */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: tab === 'hub' ? 1 : 0,
        pointerEvents: tab === 'hub' ? 'auto' : 'none',
        transition: 'opacity 0.3s',
      }}>
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            shadows
            gl={{ antialias: true, alpha: false }}
            style={{ background: '#030912' }}
          >
            <HubScene />
            <PlayerCharacter classColor={classColor} onAttack={handleAttack} />
          </Canvas>
        </Suspense>

        {/* Controls hint */}
        <div className="controls-hint">
          <span>WASD · Move</span>
          <span>SPACE · Attack</span>
          <span>1–6 · Skills</span>
        </div>

        {/* Hub title overlay */}
        <div className="hub-title-overlay">
          <span className="hub-eyebrow">You are in</span>
          <h1 className="hub-name">The Interconnected Hub</h1>
        </div>
      </div>

      {/* Life Web panel */}
      {tab === 'lifeweb' && (
        <div style={{ position: 'absolute', inset: '0 0 62px 0', overflow: 'hidden' }}>
          <LifeWeb />
        </div>
      )}

      {/* Skill HUD — visible on hub tab */}
      {tab === 'hub' && <SkillHUD attackFlash={attackFlash} />}

      {/* Profile button */}
      <ProfilePanel />

      {/* Bottom navigation */}
      <BottomNav active={tab} onChange={setTab} />

      <style>{`
        .controls-hint {
          position: absolute; bottom: 72px; left: 16px;
          display: flex; flex-direction: column; gap: 3px;
          pointer-events: none;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .controls-hint span {
          font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(79,195,247,0.4);
          background: rgba(4,12,26,0.6);
          padding: 3px 8px; border-radius: 4px;
        }

        .hub-title-overlay {
          position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
          text-align: center; pointer-events: none;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .hub-eyebrow {
          display: block; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;
          color: rgba(79,195,247,0.45); margin-bottom: 2px;
        }
        .hub-name {
          font-size: 18px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(224,244,255,0.85);
          text-shadow: 0 0 24px rgba(79,195,247,0.4);
        }
      `}</style>
    </div>
  );
}
