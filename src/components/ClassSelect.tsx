import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { deriveTitles } from '../utils/astrology';

interface CombatClass {
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  accent: string;
  stats: { atk: number; def: number; mgk: number; spd: number };
}

const CLASSES: CombatClass[] = [
  {
    name: 'Warrior',
    role: 'Frontline Bruiser',
    description: 'Unyielding steel and raw power. Masters of direct combat who inspire allies with fearless charges.',
    icon: '⚔',
    color: '#c0392b',
    accent: 'rgba(192,57,43,0.18)',
    stats: { atk: 9, def: 8, mgk: 1, spd: 4 },
  },
  {
    name: 'Mage',
    role: 'Arcane Devastator',
    description: 'Conduits of pure cosmic energy. They bend the laws of reality to unleash catastrophic spell barrages.',
    icon: '✦',
    color: '#2980b9',
    accent: 'rgba(41,128,185,0.18)',
    stats: { atk: 2, def: 2, mgk: 10, spd: 6 },
  },
  {
    name: 'Rogue',
    role: 'Shadow Executor',
    description: 'Ghosts in the dark. Precision assassins who exploit every weakness with blinding speed.',
    icon: '◈',
    color: '#7f8c8d',
    accent: 'rgba(127,140,141,0.18)',
    stats: { atk: 8, def: 3, mgk: 3, spd: 10 },
  },
  {
    name: 'Paladin',
    role: 'Sacred Shield',
    description: 'Blessed warriors fusing divine light with martial prowess to protect and punish in equal measure.',
    icon: '✙',
    color: '#f39c12',
    accent: 'rgba(243,156,18,0.18)',
    stats: { atk: 6, def: 9, mgk: 6, spd: 3 },
  },
  {
    name: 'Ranger',
    role: 'Horizon Stalker',
    description: 'Masters of distance and terrain. Patient hunters who control the battlefield before the fight begins.',
    icon: '◎',
    color: '#27ae60',
    accent: 'rgba(39,174,96,0.18)',
    stats: { atk: 7, def: 4, mgk: 2, spd: 9 },
  },
  {
    name: 'Necromancer',
    role: 'Death Weaver',
    description: 'Commanders of the slain. They raise armies from the fallen and drain life to sustain their own power.',
    icon: '☽',
    color: '#8e44ad',
    accent: 'rgba(142,68,173,0.18)',
    stats: { atk: 5, def: 4, mgk: 9, spd: 4 },
  },
  {
    name: 'Monk',
    role: 'Inner Tempest',
    description: 'Living weapons honed through discipline. They channel chi into devastating strikes and iron resilience.',
    icon: '◉',
    color: '#e67e22',
    accent: 'rgba(230,126,34,0.18)',
    stats: { atk: 8, def: 6, mgk: 4, spd: 8 },
  },
  {
    name: 'Druid',
    role: 'World Root',
    description: 'Voices of the primordial wild. Shape-shifters who call storms, heal wounds, and summon nature\'s wrath.',
    icon: '❧',
    color: '#16a085',
    accent: 'rgba(22,160,133,0.18)',
    stats: { atk: 4, def: 5, mgk: 8, spd: 5 },
  },
  {
    name: 'Berserker',
    role: 'Chaos Engine',
    description: 'Rage made flesh. The more damage they take, the more lethal they become — an unstoppable force of destruction.',
    icon: '⌖',
    color: '#d35400',
    accent: 'rgba(211,84,0,0.18)',
    stats: { atk: 10, def: 5, mgk: 1, spd: 7 },
  },
];

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${value * 10}%` }} />
      </div>
      <span className="stat-num">{value}</span>
    </div>
  );
}

export default function ClassSelect() {
  const navigate = useNavigate();
  const { player, patchPlayer } = usePlayer();
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeClass = CLASSES.find(c => c.name === (hovered ?? selected)) ?? null;

  async function handleConfirm() {
    if (!selected || !player) return;
    setError('');
    setLoading(true);

    const { constellationTitle, zodiacTitle } = deriveTitles(
      player.birth_month,
      player.birth_day,
      player.birth_year
    );

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/set-class`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            globalId: player.global_id,
            combatClass: selected,
            constellationTitle,
            zodiacTitle,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Failed to save class.'); return; }

      patchPlayer(json.player);
      navigate('/welcome', { replace: true });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cs-bg">
      <div className="cs-stars" />

      <div className="cs-layout">
        {/* Left panel — grid */}
        <div className="cs-left">
          <div className="cs-header">
            <p className="cs-eyebrow">Step 2 of 3</p>
            <h1 className="cs-title">Choose Your Combat Class</h1>
            <p className="cs-sub">Your class defines how you fight, survive, and leave your mark on LifeForge.</p>
          </div>

          <div className="class-grid">
            {CLASSES.map(cls => (
              <button
                key={cls.name}
                className={`class-card ${selected === cls.name ? 'is-selected' : ''}`}
                style={{
                  '--card-color': cls.color,
                  '--card-accent': cls.accent,
                } as React.CSSProperties}
                onClick={() => setSelected(cls.name)}
                onMouseEnter={() => setHovered(cls.name)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="card-icon" style={{ color: cls.color }}>{cls.icon}</span>
                <span className="card-name">{cls.name}</span>
                {selected === cls.name && (
                  <span className="card-check">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>

          {error && <div className="cs-error">{error}</div>}

          <button
            className="cs-confirm-btn"
            disabled={!selected || loading}
            onClick={handleConfirm}
          >
            {loading ? (
              <span className="btn-inner"><span className="spinner" />Binding Class…</span>
            ) : (
              <span className="btn-inner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Confirm Class
              </span>
            )}
          </button>
        </div>

        {/* Right panel — detail */}
        <div className="cs-right">
          {activeClass ? (
            <div className="detail-panel" key={activeClass.name}>
              <div className="detail-icon-wrap" style={{ color: activeClass.color }}>
                <span className="detail-icon">{activeClass.icon}</span>
              </div>
              <div className="detail-glow" style={{ background: activeClass.color }} />
              <p className="detail-role" style={{ color: activeClass.color }}>{activeClass.role}</p>
              <h2 className="detail-name">{activeClass.name}</h2>
              <p className="detail-desc">{activeClass.description}</p>
              <div className="detail-stats">
                <p className="stats-heading">Base Attributes</p>
                <StatBar label="ATK" value={activeClass.stats.atk} />
                <StatBar label="DEF" value={activeClass.stats.def} />
                <StatBar label="MGK" value={activeClass.stats.mgk} />
                <StatBar label="SPD" value={activeClass.stats.spd} />
              </div>
            </div>
          ) : (
            <div className="detail-empty">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.25">
                <circle cx="24" cy="24" r="22" stroke="#4fc3f7" strokeWidth="1.5" strokeDasharray="4 3"/>
                <circle cx="24" cy="24" r="4" fill="#4fc3f7"/>
              </svg>
              <p>Hover or select a class<br/>to preview details</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cs-bg {
          min-height: 100vh; width: 100%;
          background: radial-gradient(ellipse at 50% 0%, #0a1628 0%, #050c18 60%, #000408 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 24px; position: relative; overflow: hidden;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .cs-stars {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.55) 0%, transparent 100%),
            radial-gradient(1px 1px at 22% 65%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 38% 28%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 52% 82%, rgba(255,255,255,0.3)  0%, transparent 100%),
            radial-gradient(1px 1px at 68% 18%, rgba(255,255,255,0.55) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 50%, rgba(255,255,255,0.4)  0%, transparent 100%),
            radial-gradient(1px 1px at 91% 8%,  rgba(255,255,255,0.5)  0%, transparent 100%),
            radial-gradient(1px 1px at 14% 90%, rgba(255,255,255,0.3)  0%, transparent 100%),
            radial-gradient(1px 1px at 60% 42%, rgba(255,255,255,0.4)  0%, transparent 100%),
            radial-gradient(1px 1px at 33% 73%, rgba(255,255,255,0.45) 0%, transparent 100%);
        }

        .cs-layout {
          position: relative; z-index: 1;
          width: 100%; max-width: 1100px;
          display: grid; grid-template-columns: 1fr 340px; gap: 32px;
          align-items: start;
        }
        @media (max-width: 820px) {
          .cs-layout { grid-template-columns: 1fr; }
          .cs-right { display: none; }
        }

        /* Left */
        .cs-left { display: flex; flex-direction: column; gap: 24px; }

        .cs-header { }
        .cs-eyebrow {
          font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase;
          color: rgba(79,195,247,0.6); margin-bottom: 6px;
        }
        .cs-title {
          font-size: 28px; font-weight: 700; letter-spacing: 0.06em;
          color: #e0f4ff; text-transform: uppercase; margin-bottom: 8px;
        }
        .cs-sub { font-size: 13px; color: rgba(160,200,230,0.55); line-height: 1.6; }

        .class-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
        }
        @media (max-width: 500px) { .class-grid { grid-template-columns: repeat(2, 1fr); } }

        .class-card {
          position: relative;
          background: rgba(8,20,40,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 14px 12px;
          cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s;
          outline: none;
        }
        .class-card:hover {
          border-color: var(--card-color);
          background: var(--card-accent);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .class-card.is-selected {
          border-color: var(--card-color);
          background: var(--card-accent);
          box-shadow: 0 0 0 1px var(--card-color), 0 8px 24px rgba(0,0,0,0.5);
        }

        .card-icon { font-size: 26px; line-height: 1; }
        .card-name {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(200,225,245,0.85);
        }
        .card-check {
          position: absolute; top: 6px; right: 6px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #4fc3f7; color: #000;
          display: flex; align-items: center; justify-content: center;
        }

        .cs-error {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.35);
          border-radius: 8px; color: #fca5a5; font-size: 12px; padding: 10px 14px;
        }

        .cs-confirm-btn {
          background: linear-gradient(135deg, #0d3a5c 0%, #0a4a7a 100%);
          border: 1px solid rgba(79,195,247,0.4); border-radius: 10px;
          color: #e0f4ff; font-size: 13px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 14px 24px; cursor: pointer;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .cs-confirm-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(79,195,247,0.12) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.2s;
        }
        .cs-confirm-btn:hover:not(:disabled)::before { opacity: 1; }
        .cs-confirm-btn:hover:not(:disabled) {
          border-color: rgba(79,195,247,0.7);
          box-shadow: 0 0 24px rgba(79,195,247,0.2);
          transform: translateY(-1px);
        }
        .cs-confirm-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; z-index: 1; }

        /* Right */
        .cs-right {
          position: sticky; top: 24px;
          background: rgba(8,20,40,0.85);
          border: 1px solid rgba(79,195,247,0.15);
          border-radius: 16px; padding: 32px 28px;
          backdrop-filter: blur(20px);
          min-height: 420px;
          display: flex; align-items: center; justify-content: center;
        }

        .detail-panel {
          width: 100%; position: relative;
          display: flex; flex-direction: column; gap: 12px;
          animation: fadeUp 0.25s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .detail-icon-wrap {
          font-size: 52px; line-height: 1;
          filter: drop-shadow(0 0 16px currentColor);
        }
        .detail-glow {
          position: absolute; top: 0; left: 0;
          width: 80px; height: 80px; border-radius: 50%;
          filter: blur(40px); opacity: 0.25; pointer-events: none;
        }
        .detail-role {
          font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
          margin-top: 4px;
        }
        .detail-name {
          font-size: 26px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #e0f4ff;
        }
        .detail-desc {
          font-size: 13px; line-height: 1.65; color: rgba(170,205,230,0.7);
        }
        .detail-stats { margin-top: 8px; display: flex; flex-direction: column; gap: 8px; }
        .stats-heading {
          font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(79,195,247,0.5); margin-bottom: 4px;
        }
        .stat-row { display: flex; align-items: center; gap: 10px; }
        .stat-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: rgba(150,190,220,0.6); width: 28px; }
        .stat-track { flex: 1; height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
        .stat-fill { height: 100%; background: #4fc3f7; border-radius: 2px; transition: width 0.4s ease; }
        .stat-num { font-size: 11px; font-weight: 700; color: rgba(200,225,245,0.7); width: 16px; text-align: right; }

        .detail-empty {
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          color: rgba(120,160,200,0.4); font-size: 13px; text-align: center; line-height: 1.6;
        }

        .spinner {
          width: 14px; height: 14px; border: 2px solid rgba(79,195,247,0.3);
          border-top-color: #4fc3f7; border-radius: 50%;
          animation: spin 0.7s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
