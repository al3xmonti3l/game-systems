import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { getConstellation, getChineseZodiac } from '../utils/astrology';

const CONSTELLATION_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌',
  Virgo: '♍', Libra: '♎', Scorpio: '♏', Sagittarius: '♐',
  Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const CLASS_COLORS: Record<string, string> = {
  Warrior: '#c0392b', Mage: '#2980b9', Rogue: '#7f8c8d',
  Paladin: '#f39c12', Ranger: '#27ae60', Necromancer: '#8e44ad',
  Monk: '#e67e22', Druid: '#16a085', Berserker: '#d35400',
};

// Static achievement definitions — earned based on profile data
function computeAchievements(player: {
  global_id: number;
  combat_class: string | null;
  constellation_title: string | null;
  zodiac_title: string | null;
  player_level: number;
  gold_balance: number;
}) {
  const achievements = [];

  achievements.push({
    id: 'forged',
    icon: '⚡',
    name: 'Consciousness Forged',
    desc: 'Successfully initialized a player profile.',
    unlocked: true,
  });

  if (player.combat_class) {
    achievements.push({
      id: 'class',
      icon: '⚔',
      name: 'Class Bound',
      desc: `Pledged allegiance to the ${player.combat_class} order.`,
      unlocked: true,
    });
  } else {
    achievements.push({
      id: 'class',
      icon: '⚔',
      name: 'Class Bound',
      desc: 'Choose a combat class to unlock.',
      unlocked: false,
    });
  }

  if (player.constellation_title) {
    achievements.push({
      id: 'stars',
      icon: '✦',
      name: 'Star-Marked',
      desc: `Received the title: ${player.constellation_title}.`,
      unlocked: true,
    });
  }

  if (player.zodiac_title) {
    achievements.push({
      id: 'zodiac',
      icon: '☯',
      name: 'Zodiac Branded',
      desc: `Received the title: ${player.zodiac_title}.`,
      unlocked: true,
    });
  }

  if (player.global_id <= 10) {
    achievements.push({
      id: 'pioneer',
      icon: '🏅',
      name: 'Pioneer',
      desc: 'Among the first 10 souls to enter LifeForge.',
      unlocked: true,
    });
  }

  if (player.global_id === 1) {
    achievements.push({
      id: 'genesis',
      icon: '👑',
      name: 'Genesis Player',
      desc: 'The very first consciousness ever synchronized.',
      unlocked: true,
    });
  }

  achievements.push({
    id: 'lobby',
    icon: '🚀',
    name: 'Entered the Void',
    desc: 'Stepped into the deep-space lobby for the first time.',
    unlocked: true,
  });

  return achievements;
}

export default function ProfilePanel() {
  const { player, signOut } = usePlayer();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!player) return null;

  const constellation = getConstellation(player.birth_month, player.birth_day);
  const animal = getChineseZodiac(player.birth_year);
  const classColor = CLASS_COLORS[player.combat_class ?? ''] ?? '#4fc3f7';
  const achievements = computeAchievements(player);
  const unlocked = achievements.filter(a => a.unlocked).length;

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    navigate('/register', { replace: true });
  }

  return (
    <>
      {/* Trigger button — top-right corner */}
      <button className="profile-trigger" onClick={() => setOpen(true)} title="Open Profile">
        <span className="trigger-avatar" style={{ borderColor: classColor }}>
          {player.username.charAt(0).toUpperCase()}
        </span>
        <span className="trigger-name">{player.username}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && <div className="profile-backdrop" onClick={() => setOpen(false)} />}

      {/* Drawer */}
      <div className={`profile-drawer ${open ? 'drawer-open' : ''}`}>
        <div className="drawer-inner">

          {/* Close */}
          <button className="drawer-close" onClick={() => setOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Player identity */}
          <div className="drawer-hero">
            <div className="hero-avatar" style={{ borderColor: classColor, boxShadow: `0 0 20px ${classColor}40` }}>
              <span className="hero-initial">{player.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="hero-info">
              <div className="hero-badge">
                <span className="hero-hash">#</span>
                <span className="hero-id">{String(player.global_id).padStart(4, '0')}</span>
              </div>
              <h2 className="hero-name">{player.username}</h2>
              {player.combat_class && (
                <span className="hero-class" style={{ color: classColor, borderColor: `${classColor}40`, background: `${classColor}12` }}>
                  {player.combat_class}
                </span>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="stats-row">
            <div className="stat-chip">
              <span className="stat-chip-label">Level</span>
              <span className="stat-chip-val">{player.player_level}</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip-label">Gold</span>
              <span className="stat-chip-val">{player.gold_balance.toLocaleString()}</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip-label">Sign</span>
              <span className="stat-chip-val">{CONSTELLATION_GLYPHS[constellation]} {constellation}</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip-label">Zodiac</span>
              <span className="stat-chip-val">{animal}</span>
            </div>
          </div>

          {/* Titles */}
          <div className="section-header">Titles</div>
          <div className="titles-list">
            {player.constellation_title && (
              <div className="title-row">
                <span className="title-glyph">{CONSTELLATION_GLYPHS[constellation]}</span>
                <div>
                  <span className="title-type">Constellation</span>
                  <span className="title-name">{player.constellation_title}</span>
                </div>
              </div>
            )}
            {player.zodiac_title && (
              <div className="title-row">
                <span className="title-glyph">☯</span>
                <div>
                  <span className="title-type">Zodiac</span>
                  <span className="title-name">{player.zodiac_title}</span>
                </div>
              </div>
            )}
            {!player.constellation_title && !player.zodiac_title && (
              <p className="empty-hint">Complete class selection to receive your titles.</p>
            )}
          </div>

          {/* Achievements */}
          <div className="section-header">
            Achievements
            <span className="achievement-count">{unlocked}/{achievements.length}</span>
          </div>
          <div className="achievement-list">
            {achievements.map(a => (
              <div key={a.id} className={`achievement-row ${a.unlocked ? '' : 'achievement-locked'}`}>
                <span className="achievement-icon">{a.icon}</span>
                <div className="achievement-text">
                  <span className="achievement-name">{a.name}</span>
                  <span className="achievement-desc">{a.desc}</span>
                </div>
                {a.unlocked && (
                  <svg className="achievement-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Sign out */}
          <button className="signout-btn" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? (
              <span className="btn-inner"><span className="spinner" />Signing Out…</span>
            ) : (
              <span className="btn-inner">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </span>
            )}
          </button>

        </div>
      </div>

      <style>{`
        .profile-trigger {
          position: fixed; top: 16px; right: 16px; z-index: 100;
          display: flex; align-items: center; gap: 8px;
          background: rgba(8,20,40,0.85); border: 1px solid rgba(79,195,247,0.2);
          border-radius: 40px; padding: 6px 14px 6px 6px;
          cursor: pointer; color: rgba(180,215,240,0.8);
          font-size: 12px; font-weight: 600; letter-spacing: 0.05em;
          font-family: 'Segoe UI', system-ui, sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
          backdrop-filter: blur(12px);
        }
        .profile-trigger:hover {
          border-color: rgba(79,195,247,0.5);
          box-shadow: 0 0 16px rgba(79,195,247,0.15);
          color: #e0f4ff;
        }
        .trigger-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(79,195,247,0.12);
          border: 1.5px solid;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #4fc3f7;
          flex-shrink: 0;
        }
        .trigger-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .profile-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .profile-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 300;
          width: 360px; max-width: 100vw;
          background: rgba(6,14,28,0.97);
          border-left: 1px solid rgba(79,195,247,0.15);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          overflow-y: auto;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .drawer-open { transform: translateX(0); }
        @media (max-width: 400px) { .profile-drawer { width: 100vw; } }

        .drawer-inner { padding: 24px 24px 40px; display: flex; flex-direction: column; gap: 20px; min-height: 100%; }

        .drawer-close {
          align-self: flex-end; background: none; border: none;
          color: rgba(120,160,200,0.5); cursor: pointer; padding: 4px;
          transition: color 0.15s;
        }
        .drawer-close:hover { color: #e0f4ff; }

        /* Hero */
        .drawer-hero { display: flex; align-items: center; gap: 16px; }
        .hero-avatar {
          width: 60px; height: 60px; border-radius: 50%;
          border: 2px solid; background: rgba(8,20,40,0.8);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .hero-initial { font-size: 26px; font-weight: 700; color: #e0f4ff; }
        .hero-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .hero-badge { display: flex; align-items: center; gap: 3px; }
        .hero-hash { font-size: 11px; color: rgba(79,195,247,0.5); font-weight: 700; }
        .hero-id { font-size: 11px; color: #4fc3f7; font-weight: 700; font-variant-numeric: tabular-nums; }
        .hero-name { font-size: 20px; font-weight: 700; color: #e0f4ff; letter-spacing: 0.04em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hero-class { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; border: 1px solid; }

        /* Stats */
        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .stat-chip { background: rgba(8,20,40,0.6); border: 1px solid rgba(79,195,247,0.1); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
        .stat-chip-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(79,195,247,0.45); }
        .stat-chip-val { font-size: 13px; font-weight: 700; color: #e0f4ff; }

        /* Sections */
        .section-header {
          font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(79,195,247,0.5); padding-bottom: 8px;
          border-bottom: 1px solid rgba(79,195,247,0.1);
          display: flex; align-items: center; justify-content: space-between;
        }
        .achievement-count { background: rgba(79,195,247,0.12); border: 1px solid rgba(79,195,247,0.2); border-radius: 10px; padding: 1px 7px; font-size: 10px; color: #4fc3f7; }

        /* Titles */
        .titles-list { display: flex; flex-direction: column; gap: 10px; }
        .title-row { display: flex; align-items: center; gap: 12px; background: rgba(8,20,40,0.5); border: 1px solid rgba(79,195,247,0.1); border-radius: 10px; padding: 12px 14px; }
        .title-glyph { font-size: 22px; filter: drop-shadow(0 0 8px rgba(79,195,247,0.4)); flex-shrink: 0; }
        .title-row > div { display: flex; flex-direction: column; gap: 2px; }
        .title-type { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(79,195,247,0.45); }
        .title-name { font-size: 14px; font-weight: 600; color: #e0f4ff; }
        .empty-hint { font-size: 12px; color: rgba(120,160,200,0.4); font-style: italic; }

        /* Achievements */
        .achievement-list { display: flex; flex-direction: column; gap: 6px; }
        .achievement-row {
          display: flex; align-items: center; gap: 10px;
          background: rgba(8,20,40,0.4); border: 1px solid rgba(79,195,247,0.08);
          border-radius: 8px; padding: 10px 12px;
          transition: border-color 0.15s;
        }
        .achievement-row:hover { border-color: rgba(79,195,247,0.2); }
        .achievement-locked { opacity: 0.35; }
        .achievement-icon { font-size: 18px; flex-shrink: 0; width: 24px; text-align: center; }
        .achievement-text { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .achievement-name { font-size: 12px; font-weight: 600; color: #d0e8f8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .achievement-desc { font-size: 10px; color: rgba(120,160,200,0.5); line-height: 1.4; }
        .achievement-check { color: #4fc3f7; flex-shrink: 0; }

        /* Sign out */
        .signout-btn {
          margin-top: auto;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px; color: #fca5a5; font-size: 12px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 12px 20px; cursor: pointer; transition: all 0.2s;
        }
        .signout-btn:hover:not(:disabled) { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.5); }
        .signout-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spinner { width: 13px; height: 13px; border: 2px solid rgba(252,165,165,0.3); border-top-color: #fca5a5; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
