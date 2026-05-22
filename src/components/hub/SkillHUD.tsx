import { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { getConstellation, getChineseZodiac } from '../../utils/astrology';

// Derive 6 skills from the player's two titles — 3 from each
function deriveSkills(conTitle: string, zodTitle: string): SkillSlot[] {
  const conWords = conTitle.split(/\s+/);
  const zodWords = zodTitle.split(/\s+/);

  const skillTemplates: SkillSlot[] = [
    { key: '1', name: conWords[0] + ' Strike',  icon: '⚡', color: '#4fc3f7', cooldown: 0, maxCooldown: 1.5 },
    { key: '2', name: conWords[conWords.length - 1] + ' Surge', icon: '✦', color: '#81d4fa', cooldown: 0, maxCooldown: 3 },
    { key: '3', name: conWords[1] ?? conWords[0] + ' Pulse', icon: '◈', color: '#29b6f6', cooldown: 0, maxCooldown: 5 },
    { key: '4', name: zodWords[zodWords.length - 1] + ' Howl', icon: '☯', color: '#ff9800', cooldown: 0, maxCooldown: 4 },
    { key: '5', name: zodWords[0] + ' Form',    icon: '◉', color: '#ef5350', cooldown: 0, maxCooldown: 8 },
    { key: '6', name: zodWords[1] ?? zodWords[0] + ' Veil', icon: '☽', color: '#ab47bc', cooldown: 0, maxCooldown: 12 },
  ];
  return skillTemplates;
}

export interface SkillSlot {
  key: string;
  name: string;
  icon: string;
  color: string;
  cooldown: number;
  maxCooldown: number;
}

interface Props {
  attackFlash: boolean;
}

export default function SkillHUD({ attackFlash }: Props) {
  const { player } = usePlayer();
  const [skills, setSkills] = useState<SkillSlot[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const cooldownsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!player?.constellation_title || !player?.zodiac_title) return;
    const derived = deriveSkills(player.constellation_title, player.zodiac_title);
    setSkills(derived);
    cooldownsRef.current = derived.map(() => 0);
  }, [player?.constellation_title, player?.zodiac_title]);

  // Cooldown tick via rAF
  useEffect(() => {
    function tick(time: number) {
      const delta = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = time;
      let changed = false;
      cooldownsRef.current = cooldownsRef.current.map((cd, i) => {
        if (cd > 0) { changed = true; return Math.max(0, cd - delta); }
        return cd;
      });
      if (changed) {
        setSkills(prev => prev.map((s, i) => ({ ...s, cooldown: cooldownsRef.current[i] ?? 0 })));
      }
      animFrameRef.current = requestAnimationFrame(tick);
    }
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Key listeners for skills 1-6
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const map: Record<string, number> = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4, Digit6: 5 };
      const idx = map[e.code];
      if (idx === undefined) return;
      const skill = skills[idx];
      if (!skill || skill.cooldown > 0) return;
      setActiveKey(skill.key);
      setTimeout(() => setActiveKey(null), 300);
      cooldownsRef.current[idx] = skill.maxCooldown;
      setSkills(prev => prev.map((s, i) => i === idx ? { ...s, cooldown: skill.maxCooldown } : s));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [skills]);

  // Attack flash
  useEffect(() => {
    if (attackFlash) {
      setFlashActive(true);
      const t = setTimeout(() => setFlashActive(false), 180);
      return () => clearTimeout(t);
    }
  }, [attackFlash]);

  if (skills.length === 0) return null;

  return (
    <>
      {/* Hit flash overlay */}
      {flashActive && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(79,195,247,0.18) 0%, transparent 70%)',
          animation: 'none',
        }} />
      )}

      {/* Skill bar */}
      <div className="skill-bar">
        {/* Basic attack indicator */}
        <div className={`skill-slot skill-basic ${flashActive ? 'skill-active' : ''}`}>
          <span className="skill-icon">⚔</span>
          <span className="skill-label">ATK</span>
          <span className="skill-key-badge">SPC</span>
        </div>

        <div className="skill-divider" />

        {skills.map((skill, i) => {
          const progress = skill.cooldown > 0 ? skill.cooldown / skill.maxCooldown : 0;
          const isActive = activeKey === skill.key;
          const onCd = skill.cooldown > 0;
          return (
            <div
              key={skill.key}
              className={`skill-slot ${isActive ? 'skill-active' : ''} ${onCd ? 'skill-oncd' : ''}`}
              style={{ '--skill-color': skill.color } as React.CSSProperties}
            >
              {/* Cooldown overlay */}
              {onCd && (
                <div className="cd-overlay" style={{ height: `${progress * 100}%` }} />
              )}
              <span className="skill-icon">{skill.icon}</span>
              <span className="skill-name">{skill.name}</span>
              {onCd ? (
                <span className="cd-timer">{skill.cooldown.toFixed(1)}s</span>
              ) : (
                <span className="skill-key-badge">{skill.key}</span>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .skill-bar {
          position: fixed; bottom: 72px; left: 50%; transform: translateX(-50%);
          z-index: 60;
          display: flex; align-items: center; gap: 6px;
          background: rgba(4,12,26,0.88);
          border: 1px solid rgba(79,195,247,0.2);
          border-radius: 14px; padding: 8px 12px;
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,195,247,0.06);
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        .skill-divider {
          width: 1px; height: 44px;
          background: rgba(79,195,247,0.15); margin: 0 4px;
        }

        .skill-slot {
          position: relative; overflow: hidden;
          width: 58px; height: 58px; border-radius: 10px;
          background: rgba(8,20,40,0.7);
          border: 1px solid rgba(79,195,247,0.15);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 2px;
          cursor: default; transition: border-color 0.15s, box-shadow 0.15s;
          flex-shrink: 0;
        }
        .skill-slot:hover { border-color: rgba(79,195,247,0.4); }

        .skill-basic {
          border-color: rgba(79,195,247,0.3);
          background: rgba(10,25,50,0.8);
        }

        .skill-active {
          border-color: var(--skill-color, #4fc3f7) !important;
          box-shadow: 0 0 16px var(--skill-color, rgba(79,195,247,0.6));
          animation: slotPop 0.2s ease;
        }
        @keyframes slotPop {
          0%   { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .skill-oncd { opacity: 0.65; }

        .cd-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: rgba(0,0,0,0.55);
          transition: height 0.1s linear;
          pointer-events: none;
        }

        .skill-icon {
          font-size: 20px; line-height: 1; position: relative; z-index: 1;
          filter: drop-shadow(0 0 4px var(--skill-color, #4fc3f7));
        }
        .skill-name {
          font-size: 8px; font-weight: 600; letter-spacing: 0.04em;
          color: rgba(180,215,240,0.7); text-align: center;
          max-width: 52px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
          position: relative; z-index: 1;
        }
        .skill-label { font-size: 9px; font-weight: 700; color: #4fc3f7; letter-spacing: 0.1em; }
        .skill-key-badge {
          position: absolute; bottom: 3px; right: 4px;
          font-size: 8px; font-weight: 700; letter-spacing: 0.05em;
          color: rgba(79,195,247,0.7); z-index: 2;
        }
        .cd-timer {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          font-size: 11px; font-weight: 700; color: #e0f4ff; z-index: 3;
        }

        @media (max-width: 600px) {
          .skill-slot { width: 46px; height: 46px; }
          .skill-icon { font-size: 16px; }
          .skill-name { display: none; }
        }
      `}</style>
    </>
  );
}
