import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { getConstellation, getChineseZodiac } from '../utils/astrology';

const CONSTELLATION_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌',
  Virgo: '♍', Libra: '♎', Scorpio: '♏', Sagittarius: '♐',
  Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ZODIAC_GLYPHS: Record<string, string> = {
  Rat: '🐀', Ox: '🐂', Tiger: '🐅', Rabbit: '🐇', Dragon: '🐉',
  Snake: '🐍', Horse: '🐎', Goat: '🐐', Monkey: '🐒',
  Rooster: '🐓', Dog: '🐕', Pig: '🐖',
};

// Stage order: 0=dark, 1=title1, 2=title2, 3=congrats, 4=button
const DELAYS = [800, 1400, 2200, 3200, 4400];

export default function Welcome() {
  const navigate = useNavigate();
  const { player } = usePlayer();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    DELAYS.forEach((delay, i) => {
      setTimeout(() => setStage(i + 1), delay);
    });
  }, []);

  if (!player) {
    navigate('/register', { replace: true });
    return null;
  }

  const constellation = getConstellation(player.birth_month, player.birth_day);
  const animal = getChineseZodiac(player.birth_year);
  const constellationGlyph = CONSTELLATION_GLYPHS[constellation] ?? '✦';
  const zodiacGlyph = ZODIAC_GLYPHS[animal] ?? '◉';

  function handleEnter() {
    navigate('/', { replace: true });
  }

  return (
    <div className="wc-bg">
      <div className="wc-stars" />
      <div className="wc-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      <div className="wc-center">
        {/* Player number badge */}
        <div className={`wc-badge fade-in ${stage >= 1 ? 'visible' : ''}`}>
          <span className="badge-hash">#</span>
          <span className="badge-num">{String(player.global_id).padStart(4, '0')}</span>
          <span className="badge-name">{player.username}</span>
        </div>

        {/* Titles */}
        <div className="titles-wrap">
          <div className={`title-card fade-up ${stage >= 1 ? 'visible' : ''}`}>
            <span className="title-glyph">{constellationGlyph}</span>
            <div className="title-text">
              <span className="title-type">Constellation Title</span>
              <span className="title-value">{player.constellation_title}</span>
            </div>
          </div>

          <div className="title-divider">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="2" fill="rgba(79,195,247,0.4)" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="rgba(79,195,247,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <div className={`title-card fade-up ${stage >= 2 ? 'visible' : ''}`}>
            <span className="title-glyph zodiac-glyph">{zodiacGlyph}</span>
            <div className="title-text">
              <span className="title-type">Zodiac Title</span>
              <span className="title-value">{player.zodiac_title}</span>
            </div>
          </div>
        </div>

        {/* Class badge */}
        <div className={`class-badge fade-in ${stage >= 2 ? 'visible' : ''}`}>
          <span className="class-label">Combat Class</span>
          <span className="class-value">{player.combat_class}</span>
        </div>

        {/* Congratulations */}
        <div className={`congrats-wrap fade-up ${stage >= 3 ? 'visible' : ''}`}>
          <div className="congrats-line" />
          <p className="congrats-text">Congratulations for Existing!</p>
          <div className="congrats-line" />
        </div>

        <p className={`congrats-sub fade-in ${stage >= 3 ? 'visible' : ''}`}>
          Your consciousness has been permanently synchronized with the LifeForge multiverse.
          The forge remembers you.
        </p>

        {/* Enter button */}
        <button
          className={`enter-btn fade-up ${stage >= 4 ? 'visible' : ''}`}
          onClick={handleEnter}
        >
          <span className="btn-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
            </svg>
            Enter the Lobby
          </span>
          <span className="enter-shimmer" />
        </button>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wc-bg {
          min-height: 100vh; width: 100%;
          background: radial-gradient(ellipse at 50% 20%, #081422 0%, #030a14 55%, #000205 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 40px 24px; position: relative; overflow: hidden;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        .wc-stars {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            radial-gradient(1px 1px at 5%  10%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 20% 60%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 36% 25%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 78%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 72% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 84% 52%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 93% 88%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 12% 92%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(2px 2px at 62% 38%, rgba(79,195,247,0.25) 0%, transparent 100%),
            radial-gradient(2px 2px at 30% 70%, rgba(79,195,247,0.2) 0%, transparent 100%);
        }

        .wc-particles { position: absolute; inset: 0; pointer-events: none; }
        .particle {
          position: absolute; bottom: -10px;
          width: 2px; height: 2px; border-radius: 50%;
          background: rgba(79,195,247,0.5);
          animation: floatUp linear infinite;
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 0.5; }
          100% { transform: translateY(-100vh) scale(0); opacity: 0; }
        }

        .wc-center {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          gap: 28px; max-width: 560px; width: 100%; text-align: center;
        }

        /* Fade utilities */
        .fade-in  { opacity: 0; transition: opacity 0.8s ease; }
        .fade-up  { opacity: 0; transform: translateY(20px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-in.visible  { opacity: 1; }
        .fade-up.visible  { opacity: 1; transform: translateY(0); }

        /* Player badge */
        .wc-badge {
          display: flex; align-items: center; gap: 10px;
          background: rgba(8,20,40,0.6);
          border: 1px solid rgba(79,195,247,0.2);
          border-radius: 40px; padding: 8px 20px;
        }
        .badge-hash { font-size: 13px; color: rgba(79,195,247,0.5); font-weight: 700; }
        .badge-num { font-size: 13px; color: #4fc3f7; font-weight: 700; font-variant-numeric: tabular-nums; }
        .badge-name { font-size: 13px; color: rgba(200,225,245,0.7); letter-spacing: 0.08em; }

        /* Titles */
        .titles-wrap {
          display: flex; flex-direction: column; align-items: center; gap: 0; width: 100%;
        }

        .title-card {
          width: 100%;
          background: rgba(6,16,32,0.8);
          border: 1px solid rgba(79,195,247,0.15);
          border-radius: 14px; padding: 20px 24px;
          display: flex; align-items: center; gap: 18px;
          text-align: left;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .title-card:first-child { border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom-color: transparent; }
        .title-card:last-child  { border-top-left-radius: 0; border-top-right-radius: 0; border-top-color: transparent; }

        .title-glyph {
          font-size: 36px; line-height: 1;
          filter: drop-shadow(0 0 10px rgba(79,195,247,0.4));
          flex-shrink: 0;
        }
        .zodiac-glyph { font-size: 32px; }

        .title-text { display: flex; flex-direction: column; gap: 3px; }
        .title-type {
          font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(79,195,247,0.5); font-weight: 600;
        }
        .title-value {
          font-size: 18px; font-weight: 700; letter-spacing: 0.05em;
          color: #e8f4ff;
          text-shadow: 0 0 20px rgba(79,195,247,0.3);
        }

        .title-divider {
          display: flex; align-items: center; justify-content: center;
          width: 100%; padding: 2px 0; z-index: 1;
        }

        /* Class badge */
        .class-badge {
          display: flex; align-items: center; gap: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 8px 18px;
          background: rgba(8,20,40,0.5);
        }
        .class-label {
          font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(120,160,200,0.5);
        }
        .class-value {
          font-size: 13px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(200,225,245,0.85);
        }

        /* Congratulations */
        .congrats-wrap {
          display: flex; align-items: center; gap: 16px; width: 100%;
        }
        .congrats-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, rgba(79,195,247,0.3), transparent); }
        .congrats-text {
          font-size: 22px; font-weight: 700; letter-spacing: 0.06em;
          color: #e8f4ff; white-space: nowrap;
          text-shadow: 0 0 30px rgba(79,195,247,0.4), 0 0 60px rgba(79,195,247,0.15);
        }
        @media (max-width: 480px) { .congrats-text { font-size: 17px; } }

        .congrats-sub {
          font-size: 13px; line-height: 1.7; color: rgba(140,180,220,0.55);
          max-width: 400px;
        }

        /* Enter button */
        .enter-btn {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #0d3a5c 0%, #0a4a7a 100%);
          border: 1px solid rgba(79,195,247,0.5); border-radius: 12px;
          color: #e0f4ff; font-size: 14px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 16px 40px; cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 0 32px rgba(79,195,247,0.15);
        }
        .enter-btn:hover {
          border-color: rgba(79,195,247,0.9);
          box-shadow: 0 0 48px rgba(79,195,247,0.3);
          transform: translateY(-2px);
        }
        .enter-btn:active { transform: translateY(0); }

        .enter-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 30%, rgba(79,195,247,0.12) 50%, transparent 70%);
          transform: translateX(-100%);
          animation: shimmer 2.5s ease infinite;
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }

        .btn-inner {
          display: flex; align-items: center; gap: 10px;
          position: relative; z-index: 1;
        }
      `}</style>
    </div>
  );
}
