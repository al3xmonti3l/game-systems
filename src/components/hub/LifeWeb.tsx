import { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { getConstellation, getChineseZodiac } from '../../utils/astrology';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SkillNode {
  id: string;
  x: number; // 0-1 relative SVG coords
  y: number;
  name: string;
  desc: string;
  cost: number;
  requires: string[];
  tier: number;
}

// ─── Class skill tree — chemistry / molecular shape ───────────────────────────

function buildClassTree(combatClass: string): SkillNode[] {
  const base = [
    { id: 'c0', x: 0.5, y: 0.88, name: 'Core Resonance', desc: 'Foundation of all class abilities. +5% to all stats.', cost: 1, requires: [], tier: 0 },
    // Tier 1
    { id: 'c1a', x: 0.28, y: 0.70, name: 'Force Atom', desc: 'Unlocks basic physical force multiplier.', cost: 1, requires: ['c0'], tier: 1 },
    { id: 'c1b', x: 0.50, y: 0.66, name: 'Energy Bond', desc: 'Links attack chains for bonus damage.', cost: 1, requires: ['c0'], tier: 1 },
    { id: 'c1c', x: 0.72, y: 0.70, name: 'Catalyst Shell', desc: 'Defensive reaction layer. +8% armor.', cost: 1, requires: ['c0'], tier: 1 },
    // Tier 2
    { id: 'c2a', x: 0.16, y: 0.50, name: 'Valence Strike', desc: 'Outer shell burst. High single-hit damage.', cost: 2, requires: ['c1a'], tier: 2 },
    { id: 'c2b', x: 0.38, y: 0.46, name: 'Ionic Surge', desc: 'Charged AoE shockwave around the player.', cost: 2, requires: ['c1a', 'c1b'], tier: 2 },
    { id: 'c2c', x: 0.62, y: 0.46, name: 'Covalent Bind', desc: 'Root an enemy for 2 seconds with energy.', cost: 2, requires: ['c1b', 'c1c'], tier: 2 },
    { id: 'c2d', x: 0.84, y: 0.50, name: 'Neutron Shield', desc: 'Absorb up to 30% of one hit.', cost: 2, requires: ['c1c'], tier: 2 },
    // Tier 3
    { id: 'c3a', x: 0.22, y: 0.28, name: 'Fission Burst', desc: 'Explosive area strike. Splits into 3 smaller blasts.', cost: 3, requires: ['c2a', 'c2b'], tier: 3 },
    { id: 'c3b', x: 0.50, y: 0.22, name: 'Molecular Ascent', desc: 'Temporarily enter a heightened state. +40% all stats for 8s.', cost: 3, requires: ['c2b', 'c2c'], tier: 3 },
    { id: 'c3c', x: 0.78, y: 0.28, name: 'Quantum Barrier', desc: 'Phase-shift defense. Chance to dodge all damage.', cost: 3, requires: ['c2c', 'c2d'], tier: 3 },
    // Apex
    { id: 'c4', x: 0.50, y: 0.06, name: `${combatClass} Apex`, desc: `The pinnacle of the ${combatClass} path. Unlocks your ultimate form.`, cost: 5, requires: ['c3a', 'c3b', 'c3c'], tier: 4 },
  ];
  return base;
}

// ─── Constellation tree — arranged as the zodiac star shape ──────────────────

const CONSTELLATION_SHAPES: Record<string, Array<{ id: string; x: number; y: number; name: string; desc: string; cost: number; requires: string[]; tier: number }>> = {
  Aries: [
    { id: 'a0', x: 0.50, y: 0.90, name: 'Ram\'s Drive', desc: 'Charge forward, dealing damage on impact.', cost: 1, requires: [], tier: 0 },
    { id: 'a1', x: 0.35, y: 0.72, name: 'Horn Thrust', desc: 'Piercing attack that bypasses 20% armor.', cost: 1, requires: ['a0'], tier: 1 },
    { id: 'a2', x: 0.65, y: 0.72, name: 'Ember Breath', desc: 'Short-range fire cone.', cost: 1, requires: ['a0'], tier: 1 },
    { id: 'a3', x: 0.20, y: 0.52, name: 'Battle Frenzy', desc: 'Each hit increases your attack speed by 3%.', cost: 2, requires: ['a1'], tier: 2 },
    { id: 'a4', x: 0.50, y: 0.48, name: 'Vanguard Aura', desc: 'Allies near you gain 10% damage.', cost: 2, requires: ['a1', 'a2'], tier: 2 },
    { id: 'a5', x: 0.80, y: 0.52, name: 'Ignition Field', desc: 'Leave a trail of fire while moving.', cost: 2, requires: ['a2'], tier: 2 },
    { id: 'a6', x: 0.30, y: 0.30, name: 'Stampede', desc: 'Rush through enemies hitting all in your path.', cost: 3, requires: ['a3', 'a4'], tier: 3 },
    { id: 'a7', x: 0.70, y: 0.30, name: 'Conflagration', desc: 'Huge fire explosion centered on you.', cost: 3, requires: ['a4', 'a5'], tier: 3 },
    { id: 'a8', x: 0.50, y: 0.10, name: 'Ember Vanguard Ascension', desc: 'Your true form ignites the battlefield.', cost: 5, requires: ['a6', 'a7'], tier: 4 },
  ],
  Taurus: [
    { id: 'ta0', x: 0.50, y: 0.90, name: 'Iron Hide', desc: '+12% maximum health.', cost: 1, requires: [], tier: 0 },
    { id: 'ta1', x: 0.30, y: 0.70, name: 'Bull Rush', desc: 'Short dash that knocks back enemies.', cost: 1, requires: ['ta0'], tier: 1 },
    { id: 'ta2', x: 0.70, y: 0.70, name: 'Stone Stomp', desc: 'Ground slam creating a shockwave.', cost: 1, requires: ['ta0'], tier: 1 },
    { id: 'ta3', x: 0.15, y: 0.50, name: 'Unyielding', desc: 'Reduce incoming stagger by 50%.', cost: 2, requires: ['ta1'], tier: 2 },
    { id: 'ta4', x: 0.50, y: 0.45, name: 'Earthen Resolve', desc: 'Regenerate 1% health per second.', cost: 2, requires: ['ta1', 'ta2'], tier: 2 },
    { id: 'ta5', x: 0.85, y: 0.50, name: 'Tremor Plate', desc: 'Armor reflects 10% melee damage.', cost: 2, requires: ['ta2'], tier: 2 },
    { id: 'ta6', x: 0.28, y: 0.27, name: 'Bastion Stance', desc: 'Enter an unbreakable defensive stance for 5s.', cost: 3, requires: ['ta3', 'ta4'], tier: 3 },
    { id: 'ta7', x: 0.72, y: 0.27, name: 'Tectonic Blow', desc: 'Massive slam that cracks the ground.', cost: 3, requires: ['ta4', 'ta5'], tier: 3 },
    { id: 'ta8', x: 0.50, y: 0.08, name: 'Iron Bulwark Ascension', desc: 'Become an immovable fortress of flesh and steel.', cost: 5, requires: ['ta6', 'ta7'], tier: 4 },
  ],
};

// For signs without a specific layout, generate a sensible circular star map
function buildConstellationTree(sign: string, title: string): SkillNode[] {
  if (CONSTELLATION_SHAPES[sign]) return CONSTELLATION_SHAPES[sign];

  const titleWords = title.split(/\s+/);
  // Generic 9-node radial pattern
  const nodes: SkillNode[] = [
    { id: 'x0', x: 0.50, y: 0.88, name: `${sign} Origin`, desc: `Entry node. Awakens the ${sign} constellation within you.`, cost: 1, requires: [], tier: 0 },
    { id: 'x1', x: 0.28, y: 0.68, name: `${titleWords[0]} Echo`, desc: 'Radiate your constellation energy outward.', cost: 1, requires: ['x0'], tier: 1 },
    { id: 'x2', x: 0.72, y: 0.68, name: 'Stellar Pulse', desc: 'Send out a burst of starlight to stun enemies.', cost: 1, requires: ['x0'], tier: 1 },
    { id: 'x3', x: 0.14, y: 0.48, name: 'Nebula Step', desc: 'Leave afterimages that confuse enemies.', cost: 2, requires: ['x1'], tier: 2 },
    { id: 'x4', x: 0.50, y: 0.44, name: 'Zodiac Lock', desc: 'Lock onto a target, increasing damage by 20%.', cost: 2, requires: ['x1', 'x2'], tier: 2 },
    { id: 'x5', x: 0.86, y: 0.48, name: 'Star Shield', desc: 'Absorb 15% of incoming magical damage.', cost: 2, requires: ['x2'], tier: 2 },
    { id: 'x6', x: 0.25, y: 0.26, name: 'Void Rift', desc: 'Tear a small rift that pulls enemies inward.', cost: 3, requires: ['x3', 'x4'], tier: 3 },
    { id: 'x7', x: 0.75, y: 0.26, name: 'Light Cascade', desc: 'Heavenly light strikes multiple enemies.', cost: 3, requires: ['x4', 'x5'], tier: 3 },
    { id: 'x8', x: 0.50, y: 0.08, name: `${title} Ascension`, desc: `Your full ${sign} constellation blazes into existence.`, cost: 5, requires: ['x6', 'x7'], tier: 4 },
  ];
  return nodes;
}

// ─── Chinese Zodiac tree — arranged as the 12-animal wheel ───────────────────

function buildZodiacTree(animal: string, title: string): SkillNode[] {
  const titleWords = title.split(/\s+/);
  // Circular node layout representing the 12 positions of the wheel
  // We use a subset relevant to this animal's element/archetype
  return [
    { id: 'z0', x: 0.50, y: 0.88, name: `${animal} Awakening`, desc: `The spirit of the ${animal} stirs within you.`, cost: 1, requires: [], tier: 0 },
    { id: 'z1', x: 0.26, y: 0.70, name: 'Primal Instinct', desc: 'Sense danger before it strikes. +10% dodge.', cost: 1, requires: ['z0'], tier: 1 },
    { id: 'z2', x: 0.74, y: 0.70, name: `${titleWords[0]} Fang`, desc: 'Razor bite attack that applies bleeding.', cost: 1, requires: ['z0'], tier: 1 },
    { id: 'z3', x: 0.12, y: 0.50, name: 'Spirit Form', desc: `Briefly become the ${animal} in spirit — movement speed +40%.`, cost: 2, requires: ['z1'], tier: 2 },
    { id: 'z4', x: 0.38, y: 0.46, name: 'Pack Howl', desc: 'Emit a cry that weakens enemy defense by 15%.', cost: 2, requires: ['z1', 'z2'], tier: 2 },
    { id: 'z5', x: 0.62, y: 0.46, name: 'Chi Bite', desc: 'Each strike channels chi for a burst follow-up.', cost: 2, requires: ['z1', 'z2'], tier: 2 },
    { id: 'z6', x: 0.88, y: 0.50, name: 'Jade Claw', desc: 'Rare material enhanced attack. Ignores 25% defense.', cost: 2, requires: ['z2'], tier: 2 },
    { id: 'z7', x: 0.20, y: 0.28, name: 'Ancestral Call', desc: 'Summon a ghostly ancestor to fight alongside you.', cost: 3, requires: ['z3', 'z4'], tier: 3 },
    { id: 'z8', x: 0.50, y: 0.22, name: 'Heaven Seal', desc: 'Seal the fate of an enemy. They take 30% more damage.', cost: 3, requires: ['z4', 'z5'], tier: 3 },
    { id: 'z9', x: 0.80, y: 0.28, name: 'Celestial Brand', desc: 'Mark an enemy with the zodiac brand — massive burst on death.', cost: 3, requires: ['z5', 'z6'], tier: 3 },
    { id: 'z10', x: 0.50, y: 0.07, name: `${title} Ascension`, desc: `The ${animal}'s full celestial power manifests within you.`, cost: 5, requires: ['z7', 'z8', 'z9'], tier: 4 },
  ];
}

// ─── SVG Tree Renderer ────────────────────────────────────────────────────────

const TIER_COLORS = ['#4fc3f7', '#29b6f6', '#0288d1', '#f39c12', '#e74c3c'];

interface TreeRendererProps {
  nodes: SkillNode[];
  unlocked: Set<string>;
  onToggle: (id: string) => void;
  points: number;
  accentColor: string;
  bgPattern?: 'chemistry' | 'constellation' | 'zodiac';
  constellationSign?: string;
  zodiacAnimal?: string;
}

function canUnlock(node: SkillNode, unlocked: Set<string>): boolean {
  return node.requires.every(r => unlocked.has(r));
}

function TreeRenderer({ nodes, unlocked, onToggle, points, accentColor, bgPattern, constellationSign, zodiacAnimal }: TreeRendererProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 600, h: 520 });

  useEffect(() => {
    if (!svgRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    ro.observe(svgRef.current.parentElement!);
    return () => ro.disconnect();
  }, []);

  const W = size.w;
  const H = size.h;

  function px(node: SkillNode) { return node.x * W; }
  function py(node: SkillNode) { return node.y * H; }

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const hNode = hovered ? nodeMap[hovered] : null;

  return (
    <div className="tree-wrap">
      {/* Background decorations */}
      <svg className="tree-bg-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {bgPattern === 'constellation' && constellationSign && (
          <ConstellationBg sign={constellationSign} W={W} H={H} color={accentColor} />
        )}
        {bgPattern === 'zodiac' && zodiacAnimal && (
          <ZodiacBg animal={zodiacAnimal} W={W} H={H} color={accentColor} />
        )}
        {bgPattern === 'chemistry' && <ChemistryBg W={W} H={H} color={accentColor} />}
      </svg>

      {/* Main tree SVG */}
      <svg
        ref={svgRef}
        className="tree-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {nodes.map(node =>
          node.requires.map(reqId => {
            const req = nodeMap[reqId];
            if (!req) return null;
            const active = unlocked.has(node.id) && unlocked.has(reqId);
            const available = unlocked.has(reqId) && canUnlock(node, unlocked);
            return (
              <line
                key={`${reqId}-${node.id}`}
                x1={px(req)} y1={py(req)}
                x2={px(node)} y2={py(node)}
                stroke={active ? accentColor : available ? `${accentColor}55` : 'rgba(255,255,255,0.08)'}
                strokeWidth={active ? 2 : 1}
                strokeDasharray={active ? undefined : '4 3'}
                filter={active ? 'url(#glow)' : undefined}
              />
            );
          })
        )}

        {/* Nodes */}
        {nodes.map(node => {
          const x = px(node);
          const y = py(node);
          const isUnlocked = unlocked.has(node.id);
          const available = canUnlock(node, unlocked) && !isUnlocked && points >= node.cost;
          const hovering = hovered === node.id;
          const tierColor = TIER_COLORS[node.tier] ?? accentColor;
          const r = node.tier === 4 ? 22 : node.tier === 3 ? 18 : node.tier === 2 ? 15 : node.tier === 1 ? 13 : 16;

          return (
            <g
              key={node.id}
              transform={`translate(${x},${y})`}
              style={{ cursor: available || isUnlocked ? 'pointer' : 'not-allowed' }}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onToggle(node.id)}
            >
              {hovering && <circle r={r + 10} fill="url(#nodeGlow)" />}
              {isUnlocked && <circle r={r + 4} fill={`${tierColor}22`} filter="url(#glow)" />}
              <circle
                r={r}
                fill={isUnlocked ? tierColor : available ? `${tierColor}33` : 'rgba(8,20,40,0.85)'}
                stroke={isUnlocked ? tierColor : available ? tierColor : 'rgba(255,255,255,0.12)'}
                strokeWidth={isUnlocked ? 2 : 1}
                filter={isUnlocked ? 'url(#glow)' : undefined}
              />
              {node.tier === 4 && (
                <polygon
                  points={hexPoints(r - 4)}
                  fill="none"
                  stroke={isUnlocked ? '#fff' : `${tierColor}44`}
                  strokeWidth="1"
                />
              )}
              <text
                textAnchor="middle"
                dy="4"
                fontSize={node.tier === 4 ? 11 : 9}
                fontWeight="700"
                fill={isUnlocked ? '#fff' : available ? tierColor : 'rgba(255,255,255,0.2)'}
                style={{ pointerEvents: 'none', fontFamily: 'system-ui' }}
              >
                {node.cost}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hNode && (
        <div className="tree-tooltip" style={{
          left: `${hNode.x * 100}%`,
          top: `${hNode.y * 100 - 4}%`,
          transform: hNode.x > 0.65 ? 'translate(-100%,-110%)' : hNode.x < 0.35 ? 'translate(0,-110%)' : 'translate(-50%,-110%)',
          borderColor: accentColor,
        }}>
          <div className="tt-title" style={{ color: accentColor }}>{hNode.name}</div>
          <div className="tt-desc">{hNode.desc}</div>
          <div className="tt-cost">Cost: <strong style={{ color: accentColor }}>{hNode.cost} pts</strong> · Tier {hNode.tier + 1}</div>
          {!unlocked.has(hNode.id) && !canUnlock(hNode, unlocked) && (
            <div className="tt-locked">Requires: {hNode.requires.join(', ')}</div>
          )}
        </div>
      )}

      <style>{`
        .tree-wrap { position: relative; width: 100%; height: 100%; }
        .tree-bg-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.12; }
        .tree-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .tree-tooltip {
          position: absolute; z-index: 10; pointer-events: none;
          background: rgba(4,12,26,0.96); border: 1px solid;
          border-radius: 10px; padding: 10px 14px; width: 200px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .tt-title { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; margin-bottom: 4px; }
        .tt-desc  { font-size: 11px; color: rgba(180,215,240,0.7); line-height: 1.5; margin-bottom: 6px; }
        .tt-cost  { font-size: 10px; color: rgba(150,190,220,0.6); }
        .tt-locked { font-size: 10px; color: rgba(239,68,68,0.7); margin-top: 3px; }
      `}</style>
    </div>
  );
}

function hexPoints(r: number): string {
  return Array.from({ length: 6 }).map((_, i) => {
    const a = (i * Math.PI) / 3 - Math.PI / 6;
    return `${Math.cos(a) * r},${Math.sin(a) * r}`;
  }).join(' ');
}

// ─── Background art ──────────────────────────────────────────────────────────

function ChemistryBg({ W, H, color }: { W: number; H: number; color: string }) {
  const cx = W / 2, cy = H / 2;
  const rings = [60, 120, 200];
  return (
    <>
      {rings.map(r => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="6 4" />
      ))}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={cx + Math.cos(a) * 200} y2={cy + Math.sin(a) * 200}
            stroke={color} strokeWidth="0.5"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={18} fill="none" stroke={color} strokeWidth="1.5" />
    </>
  );
}

const CONSTELLATION_STAR_PATTERNS: Record<string, Array<[number, number]>> = {
  Aries:       [[.5,.2],[.4,.35],[.55,.45],[.45,.6],[.6,.55],[.3,.5]],
  Taurus:      [[.3,.2],[.5,.18],[.65,.3],[.7,.5],[.55,.62],[.4,.55],[.25,.45]],
  Gemini:      [[.3,.15],[.3,.4],[.3,.65],[.7,.15],[.7,.4],[.7,.65],[.5,.4]],
  Cancer:      [[.5,.15],[.35,.35],[.5,.5],[.65,.35],[.4,.65],[.6,.65]],
  Leo:         [[.2,.5],[.35,.35],[.5,.25],[.65,.35],[.7,.5],[.6,.65],[.4,.65],[.5,.5],[.38,.5]],
  Virgo:       [[.5,.1],[.35,.25],[.25,.45],[.35,.65],[.5,.75],[.65,.65],[.75,.45],[.65,.25],[.5,.4]],
  Libra:       [[.3,.5],[.5,.3],[.7,.5],[.5,.7],[.5,.5]],
  Scorpio:     [[.2,.3],[.3,.4],[.45,.45],[.55,.5],[.65,.45],[.75,.35],[.8,.55],[.72,.7],[.6,.75]],
  Sagittarius: [[.5,.2],[.35,.35],[.25,.55],[.4,.65],[.6,.65],[.75,.55],[.65,.35],[.5,.45]],
  Capricorn:   [[.2,.35],[.35,.25],[.5,.3],[.65,.25],[.8,.35],[.75,.55],[.6,.65],[.4,.65],[.25,.55]],
  Aquarius:    [[.2,.4],[.35,.35],[.5,.4],[.65,.35],[.8,.4],[.3,.55],[.45,.5],[.6,.55],[.75,.5]],
  Pisces:      [[.3,.25],[.4,.4],[.5,.3],[.6,.4],[.7,.25],[.3,.65],[.4,.5],[.5,.6],[.6,.5],[.7,.65]],
};

function ConstellationBg({ sign, W, H, color }: { sign: string; W: number; H: number; color: string }) {
  const pts = CONSTELLATION_STAR_PATTERNS[sign] ?? CONSTELLATION_STAR_PATTERNS['Aries'];
  return (
    <>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x * W} cy={y * H} r={3} fill={color} />
      ))}
      {pts.map(([x, y], i) =>
        i < pts.length - 1 ? (
          <line key={i}
            x1={x * W} y1={y * H}
            x2={pts[i + 1][0] * W} y2={pts[i + 1][1] * H}
            stroke={color} strokeWidth="0.8"
          />
        ) : null
      )}
    </>
  );
}

const ZODIAC_WHEEL_ANIMALS = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];

function ZodiacBg({ animal, W, H, color }: { animal: string; W: number; H: number; color: string }) {
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) * 0.38;
  const activeIdx = ZODIAC_WHEEL_ANIMALS.indexOf(animal);
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke={color} strokeWidth="0.4" strokeDasharray="3 4" />
      {ZODIAC_WHEEL_ANIMALS.map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const ox = cx + Math.cos(a) * r;
        const oy = cy + Math.sin(a) * r;
        const isActive = i === activeIdx;
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={ox} y2={oy} stroke={color} strokeWidth="0.4" />
            <circle cx={ox} cy={oy} r={isActive ? 7 : 4} fill={isActive ? color : 'none'} stroke={color} strokeWidth={isActive ? 2 : 0.8} />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={10} fill="none" stroke={color} strokeWidth="1.5" />
    </>
  );
}

// ─── Main LifeWeb component ──────────────────────────────────────────────────

type TreeTab = 'class' | 'constellation' | 'zodiac';

export default function LifeWeb() {
  const { player } = usePlayer();
  const [tab, setTab] = useState<TreeTab>('class');
  const [unlockedClass, setUnlockedClass] = useState<Set<string>>(new Set());
  const [unlockedCon, setUnlockedCon] = useState<Set<string>>(new Set());
  const [unlockedZod, setUnlockedZod] = useState<Set<string>>(new Set());
  const [skillPoints] = useState(10);

  if (!player) return null;

  const sign = getConstellation(player.birth_month, player.birth_day);
  const animal = getChineseZodiac(player.birth_year);
  const combatClass = player.combat_class ?? 'Warrior';
  const conTitle = player.constellation_title ?? 'Star Wanderer';
  const zodTitle = player.zodiac_title ?? 'Spirit Seeker';

  const classNodes = buildClassTree(combatClass);
  const conNodes = buildConstellationTree(sign, conTitle);
  const zodNodes = buildZodiacTree(animal, zodTitle);

  function handleToggle(id: string, unlocked: Set<string>, setUnlocked: (s: Set<string>) => void, nodes: SkillNode[]) {
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    const newSet = new Set(unlocked);
    if (newSet.has(id)) {
      // Refund — check no child is unlocked
      const dependants = nodes.filter(n => n.requires.includes(id) && newSet.has(n.id));
      if (dependants.length > 0) return;
      newSet.delete(id);
    } else {
      if (!canUnlock(node, unlocked)) return;
      const spent = [...newSet].reduce((sum, nid) => {
        const n = nodes.find(x => x.id === nid);
        return sum + (n?.cost ?? 0);
      }, 0);
      if (spent + node.cost > skillPoints) return;
      newSet.add(id);
    }
    setUnlocked(newSet);
  }

  const tabInfo = {
    class:         { label: combatClass,     sub: 'Combat Class',   color: '#f39c12', nodes: classNodes, unlocked: unlockedClass, setU: setUnlockedClass, bg: 'chemistry' as const },
    constellation: { label: sign,            sub: 'Constellation',  color: '#4fc3f7', nodes: conNodes,   unlocked: unlockedCon,   setU: setUnlockedCon,   bg: 'constellation' as const },
    zodiac:        { label: animal,          sub: 'Chinese Zodiac', color: '#e74c3c', nodes: zodNodes,   unlocked: unlockedZod,   setU: setUnlockedZod,   bg: 'zodiac' as const },
  };

  const active = tabInfo[tab];
  const spent = [...active.unlocked].reduce((sum, id) => {
    const n = active.nodes.find(x => x.id === id);
    return sum + (n?.cost ?? 0);
  }, 0);

  return (
    <div className="lw-root">
      {/* Header */}
      <div className="lw-header">
        <div className="lw-title-block">
          <h2 className="lw-title">The Life Web</h2>
          <p className="lw-sub">Weave your fate through three paths of power</p>
        </div>
        <div className="lw-points">
          <span className="lw-pts-label">Skill Points</span>
          <span className="lw-pts-val">{skillPoints - spent} / {skillPoints}</span>
        </div>
      </div>

      {/* Tree tabs */}
      <div className="lw-tabs">
        {(['class', 'constellation', 'zodiac'] as TreeTab[]).map(t => {
          const info = tabInfo[t];
          const isActive = tab === t;
          return (
            <button
              key={t}
              className={`lw-tab ${isActive ? 'lw-tab-active' : ''}`}
              style={{ '--tab-color': info.color } as React.CSSProperties}
              onClick={() => setTab(t)}
            >
              <span className="lw-tab-sub">{info.sub}</span>
              <span className="lw-tab-label">{info.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tree canvas */}
      <div className="lw-canvas">
        <TreeRenderer
          key={tab}
          nodes={active.nodes}
          unlocked={active.unlocked}
          onToggle={(id) => handleToggle(id, active.unlocked, active.setU, active.nodes)}
          points={skillPoints - spent}
          accentColor={active.color}
          bgPattern={active.bg}
          constellationSign={sign}
          zodiacAnimal={animal}
        />
      </div>

      {/* Legend */}
      <div className="lw-legend">
        <div className="leg-item"><span className="leg-dot leg-unlocked" style={{ background: active.color }} />Unlocked</div>
        <div className="leg-item"><span className="leg-dot leg-available" style={{ border: `1px solid ${active.color}` }} />Available</div>
        <div className="leg-item"><span className="leg-dot leg-locked" />Locked</div>
        <div className="leg-hint">Click to unlock · Click again to refund</div>
      </div>

      <style>{`
        .lw-root {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          background: rgba(3,9,20,0.97);
          font-family: 'Segoe UI', system-ui, sans-serif;
          color: #e0f4ff; overflow: hidden;
        }

        .lw-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 20px 24px 12px; flex-shrink: 0;
          border-bottom: 1px solid rgba(79,195,247,0.1);
        }
        .lw-title { font-size: 20px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #e0f4ff; }
        .lw-sub   { font-size: 11px; color: rgba(79,195,247,0.5); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 2px; }
        .lw-points { text-align: right; }
        .lw-pts-label { display: block; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(79,195,247,0.45); margin-bottom: 2px; }
        .lw-pts-val   { font-size: 18px; font-weight: 700; color: #4fc3f7; }

        .lw-tabs {
          display: flex; gap: 8px; padding: 12px 24px;
          flex-shrink: 0;
        }
        .lw-tab {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 2px; padding: 10px 8px;
          background: rgba(8,20,40,0.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; cursor: pointer;
          transition: all 0.2s;
        }
        .lw-tab:hover { border-color: var(--tab-color); background: rgba(8,20,40,0.9); }
        .lw-tab-active {
          border-color: var(--tab-color) !important;
          background: color-mix(in srgb, var(--tab-color) 12%, rgba(3,9,20,0.95)) !important;
          box-shadow: 0 0 20px color-mix(in srgb, var(--tab-color) 25%, transparent);
        }
        .lw-tab-sub   { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(120,160,200,0.5); }
        .lw-tab-label { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; color: #e0f4ff; }
        .lw-tab-active .lw-tab-label { color: var(--tab-color); }

        .lw-canvas {
          flex: 1; position: relative; overflow: hidden;
          margin: 0 12px;
        }

        .lw-legend {
          display: flex; align-items: center; gap: 16px;
          padding: 10px 24px; flex-shrink: 0;
          border-top: 1px solid rgba(79,195,247,0.08);
          background: rgba(4,10,22,0.8);
        }
        .leg-item { display: flex; align-items: center; gap: 6px; font-size: 10px; color: rgba(150,190,220,0.6); }
        .leg-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .leg-unlocked { }
        .leg-available { background: transparent; }
        .leg-locked { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); }
        .leg-hint { margin-left: auto; font-size: 10px; color: rgba(79,195,247,0.35); font-style: italic; }
      `}</style>
    </div>
  );
}
