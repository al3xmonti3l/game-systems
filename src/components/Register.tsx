import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { supabase } from '../utils/supabase';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Register() {
  const navigate = useNavigate();
  const { setPlayer } = usePlayer();

  const [tab, setTab] = useState<'register' | 'login'>('register');

  // Register fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState(1);
  const [birthYear, setBirthYear] = useState(2000);

  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!birthMonth) { setError('Please select your birth month.'); return; }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ username, password, birthMonth, birthDay, birthYear }),
        }
      );
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Registration failed.'); return; }

      // Restore the session in the Supabase client
      await supabase.auth.setSession({
        access_token: json.session.access_token,
        refresh_token: json.session.refresh_token,
      });

      setPlayer(json.player);
      navigate('/class-select', { replace: true });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ username: loginUsername, password: loginPassword }),
        }
      );
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Login failed.'); return; }

      await supabase.auth.setSession({
        access_token: json.session.access_token,
        refresh_token: json.session.refresh_token,
      });

      setPlayer(json.player);
      // If no class yet, send to class select; otherwise go to lobby
      if (!json.player.combat_class) {
        navigate('/class-select', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-bg">
      <div className="stars" />
      <div className="register-panel">
        {/* Header */}
        <div className="panel-header">
          <div className="logo-ring">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#4fc3f7" strokeWidth="1.5" strokeDasharray="4 3" />
              <circle cx="24" cy="24" r="14" stroke="#4fc3f7" strokeWidth="1" opacity="0.5" />
              <circle cx="24" cy="24" r="4" fill="#4fc3f7" />
              <path d="M24 2 L24 10 M24 38 L24 46 M2 24 L10 24 M38 24 L46 24" stroke="#4fc3f7" strokeWidth="1" />
            </svg>
          </div>
          <h1 className="panel-title">LifeForge</h1>
          <p className="panel-subtitle">
            {tab === 'register' ? 'Initialize your consciousness profile' : 'Resume your existence'}
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-row">
          <button
            className={`tab-btn ${tab === 'register' ? 'tab-active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
            type="button"
          >
            New Player
          </button>
          <button
            className={`tab-btn ${tab === 'login' ? 'tab-active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
            type="button"
          >
            Returning Player
          </button>
        </div>

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="register-form">
            <div className="field-group">
              <label className="field-label"><span className="label-tag">SYS</span>Player Designation</label>
              <input type="text" className="field-input" placeholder="Enter unique username"
                value={username} onChange={e => setUsername(e.target.value)}
                minLength={3} maxLength={24} required autoComplete="off" />
              <span className="field-hint">3–24 characters · permanent once set</span>
            </div>

            <div className="field-group">
              <label className="field-label"><span className="label-tag">SYS</span>Password</label>
              <input type="password" className="field-input" placeholder="Min. 6 characters"
                value={password} onChange={e => setPassword(e.target.value)}
                minLength={6} required autoComplete="new-password" />
            </div>

            <div className="field-group">
              <label className="field-label"><span className="label-tag">BIO</span>Birth Month</label>
              <select className="field-input field-select" value={birthMonth}
                onChange={e => setBirthMonth(e.target.value)} required>
                <option value="">— Select Month —</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">
                <span className="label-tag">BIO</span>Birth Day
                <span className="slider-value">{birthDay}</span>
              </label>
              <input type="range" className="field-slider" min={1} max={31} value={birthDay}
                onChange={e => setBirthDay(Number(e.target.value))} />
              <div className="slider-track-labels"><span>1</span><span>31</span></div>
            </div>

            <div className="field-group">
              <label className="field-label"><span className="label-tag">BIO</span>Birth Year</label>
              <input type="number" className="field-input" placeholder="e.g. 1992"
                value={birthYear} onChange={e => setBirthYear(Number(e.target.value))}
                min={1900} max={2026} required />
              <span className="field-hint">Range: 1900 – 2026</span>
            </div>

            <div className="lock-notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Birth profile is permanently sealed upon registration.
            </div>

            {error && <div className="error-banner">{error}</div>}

            <button type="submit" className="sync-btn" disabled={loading}>
              {loading ? (
                <span className="btn-inner"><span className="spinner" />Synchronizing…</span>
              ) : (
                <span className="btn-inner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                  Synchronize Consciousness
                </span>
              )}
            </button>
          </form>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="register-form">
            <div className="field-group">
              <label className="field-label"><span className="label-tag">SYS</span>Player Designation</label>
              <input type="text" className="field-input" placeholder="Your username"
                value={loginUsername} onChange={e => setLoginUsername(e.target.value)}
                required autoComplete="username" />
            </div>

            <div className="field-group">
              <label className="field-label"><span className="label-tag">SYS</span>Password</label>
              <input type="password" className="field-input" placeholder="Your password"
                value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                required autoComplete="current-password" />
            </div>

            {error && <div className="error-banner">{error}</div>}

            <button type="submit" className="sync-btn" disabled={loading}>
              {loading ? (
                <span className="btn-inner"><span className="spinner" />Authenticating…</span>
              ) : (
                <span className="btn-inner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Enter the Forge
                </span>
              )}
            </button>
          </form>
        )}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .register-bg {
          min-height: 100vh; width: 100%;
          background: radial-gradient(ellipse at 50% 0%, #0a1628 0%, #050c18 60%, #000408 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 24px; position: relative; overflow: hidden;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        .stars {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 60%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 30%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 82% 55%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 88%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 65% 45%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 70%, rgba(255,255,255,0.5) 0%, transparent 100%);
        }

        .register-panel {
          position: relative; width: 100%; max-width: 480px;
          background: rgba(8, 20, 40, 0.88);
          border: 1px solid rgba(79, 195, 247, 0.2);
          border-radius: 16px; padding: 40px 40px 36px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 0 1px rgba(79,195,247,0.05), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(79,195,247,0.06);
        }
        .register-panel::before, .register-panel::after {
          content: ''; position: absolute; width: 20px; height: 20px;
          border-color: rgba(79,195,247,0.5); border-style: solid;
        }
        .register-panel::before { top: -1px; left: -1px; border-width: 2px 0 0 2px; border-radius: 16px 0 0 0; }
        .register-panel::after  { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; border-radius: 0 0 16px 0; }

        .panel-header { text-align: center; margin-bottom: 28px; }

        .logo-ring { display: inline-flex; margin-bottom: 12px; animation: rotateSlow 20s linear infinite; }
        @keyframes rotateSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .panel-title { font-size: 28px; font-weight: 700; letter-spacing: 0.12em; color: #e0f4ff; text-transform: uppercase; line-height: 1; margin-bottom: 6px; }
        .panel-subtitle { font-size: 11px; letter-spacing: 0.2em; color: rgba(79,195,247,0.6); text-transform: uppercase; }

        /* Tabs */
        .tab-row {
          display: grid; grid-template-columns: 1fr 1fr;
          background: rgba(4,14,30,0.6);
          border: 1px solid rgba(79,195,247,0.12);
          border-radius: 10px; padding: 3px; gap: 3px;
          margin-bottom: 24px;
        }
        .tab-btn {
          background: none; border: none; border-radius: 8px;
          color: rgba(140,180,220,0.5); font-size: 12px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 9px 8px; cursor: pointer; transition: all 0.2s;
        }
        .tab-btn:hover { color: rgba(200,230,245,0.8); }
        .tab-active {
          background: rgba(79,195,247,0.12);
          color: #4fc3f7 !important;
          box-shadow: inset 0 0 0 1px rgba(79,195,247,0.25);
        }

        .register-form { display: flex; flex-direction: column; gap: 18px; }

        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(180,210,240,0.8); }
        .label-tag { background: rgba(79,195,247,0.12); border: 1px solid rgba(79,195,247,0.25); color: #4fc3f7; font-size: 9px; letter-spacing: 0.1em; padding: 1px 5px; border-radius: 3px; }

        .field-input {
          background: rgba(4,14,30,0.8); border: 1px solid rgba(79,195,247,0.2);
          border-radius: 8px; color: #e0f4ff; font-size: 14px; padding: 10px 14px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%;
        }
        .field-input:focus { border-color: rgba(79,195,247,0.6); box-shadow: 0 0 0 3px rgba(79,195,247,0.08); }
        .field-input::placeholder { color: rgba(150,180,210,0.35); }

        .field-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234fc3f7' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; cursor: pointer;
        }
        .field-select option { background: #060f22; color: #e0f4ff; }
        .field-hint { font-size: 10px; color: rgba(120,160,200,0.5); letter-spacing: 0.05em; }

        .field-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; background: rgba(79,195,247,0.15); outline: none; cursor: pointer; margin-top: 4px; }
        .field-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #4fc3f7; border: 2px solid #0a1628; box-shadow: 0 0 8px rgba(79,195,247,0.6); cursor: pointer; }
        .slider-value { font-size: 13px; font-weight: 700; color: #4fc3f7; font-variant-numeric: tabular-nums; margin-left: auto; }
        .slider-track-labels { display: flex; justify-content: space-between; font-size: 10px; color: rgba(120,160,200,0.4); }

        .lock-notice { display: flex; align-items: flex-start; gap: 8px; background: rgba(255,160,50,0.06); border: 1px solid rgba(255,160,50,0.2); border-radius: 8px; padding: 10px 12px; font-size: 11px; line-height: 1.5; color: rgba(255,195,100,0.75); }
        .lock-notice svg { flex-shrink: 0; margin-top: 1px; color: rgba(255,160,50,0.7); }

        .error-banner { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.35); border-radius: 8px; color: #fca5a5; font-size: 12px; padding: 10px 14px; text-align: center; }

        .sync-btn {
          margin-top: 4px; background: linear-gradient(135deg, #0d3a5c 0%, #0a4a7a 100%);
          border: 1px solid rgba(79,195,247,0.4); border-radius: 10px;
          color: #e0f4ff; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 14px 24px; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
        }
        .sync-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(79,195,247,0.12) 0%, transparent 60%); opacity: 0; transition: opacity 0.2s; }
        .sync-btn:hover:not(:disabled)::before { opacity: 1; }
        .sync-btn:hover:not(:disabled) { border-color: rgba(79,195,247,0.7); box-shadow: 0 0 24px rgba(79,195,247,0.2); transform: translateY(-1px); }
        .sync-btn:active:not(:disabled) { transform: translateY(0); }
        .sync-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; z-index: 1; }

        .spinner { width: 14px; height: 14px; border: 2px solid rgba(79,195,247,0.3); border-top-color: #4fc3f7; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 520px) { .register-panel { padding: 28px 24px 24px; } .panel-title { font-size: 22px; } }
      `}</style>
    </div>
  );
}
