interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  available: boolean;
}

interface Props {
  active: string;
  onChange: (id: string) => void;
}

const TABS: Tab[] = [
  {
    id: 'hub',
    label: 'The Hub',
    available: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
      </svg>
    ),
  },
  {
    id: 'lifeweb',
    label: 'Life Web',
    available: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L8 7H3l4 4-2 6 7-4 7 4-2-6 4-4h-5L12 2z" />
      </svg>
    ),
  },
  {
    id: 'inventory',
    label: 'Inventory',
    available: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    id: 'map',
    label: 'World Map',
    available: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  {
    id: 'party',
    label: 'Party',
    available: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'shop',
    label: 'Shop',
    available: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bnav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`bnav-btn ${active === tab.id ? 'bnav-active' : ''} ${!tab.available ? 'bnav-locked' : ''}`}
          onClick={() => tab.available && onChange(tab.id)}
          title={!tab.available ? `${tab.label} — Coming Soon` : tab.label}
        >
          <span className="bnav-icon">{tab.icon}</span>
          <span className="bnav-label">{tab.label}</span>
          {!tab.available && <span className="bnav-soon">Soon</span>}
          {active === tab.id && <span className="bnav-pip" />}
        </button>
      ))}

      <style>{`
        .bnav {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 80;
          display: flex; align-items: stretch;
          background: rgba(4,10,22,0.96);
          border-top: 1px solid rgba(79,195,247,0.15);
          backdrop-filter: blur(20px);
          height: 62px;
          font-family: 'Segoe UI', system-ui, sans-serif;
          box-shadow: 0 -4px 32px rgba(0,0,0,0.5);
        }

        .bnav-btn {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; background: none; border: none; cursor: pointer;
          color: rgba(120,160,200,0.5);
          transition: color 0.18s, background 0.18s;
          position: relative; padding: 0 4px;
        }
        .bnav-btn:hover:not(.bnav-locked) { color: rgba(200,230,245,0.9); background: rgba(79,195,247,0.05); }
        .bnav-active { color: #4fc3f7 !important; }
        .bnav-locked { opacity: 0.4; cursor: not-allowed; }

        .bnav-icon { line-height: 1; }
        .bnav-label { font-size: 9px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }

        .bnav-soon {
          position: absolute; top: 6px; right: 8px;
          font-size: 7px; font-weight: 700; letter-spacing: 0.08em;
          background: rgba(243,156,18,0.15); border: 1px solid rgba(243,156,18,0.3);
          color: rgba(243,156,18,0.7); border-radius: 3px; padding: 1px 4px;
          text-transform: uppercase;
        }

        .bnav-pip {
          position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 28px; height: 2px; border-radius: 2px 2px 0 0;
          background: #4fc3f7;
          box-shadow: 0 0 8px rgba(79,195,247,0.7);
        }
      `}</style>
    </nav>
  );
}
