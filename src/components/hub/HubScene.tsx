import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function HubFloor() {
  return (
    <group>
      {/* Main stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <circleGeometry args={[38, 64]} />
        <meshStandardMaterial color="#1a1f2e" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Glowing center sigil ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[7.8, 8.2, 64]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.6} roughness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.8, 4.2, 64]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>
      {/* Radial lines */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 6;
        const z = Math.sin(angle) * 6;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, angle]} position={[x * 0.5, 0.02, z * 0.5]}>
            <planeGeometry args={[0.08, 12]} />
            <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.3} transparent opacity={0.4} />
          </mesh>
        );
      })}
      {/* Outer boundary ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[37.5, 38, 64]} />
        <meshStandardMaterial color="#2a3a5a" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Pillar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[1.6, 0.8, 1.6]} />
        <meshStandardMaterial color="#1e2535" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Shaft */}
      <mesh castShadow receiveShadow position={[0, 5, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 9, 8]} />
        <meshStandardMaterial color="#222c40" roughness={0.85} metalness={0.15} />
      </mesh>
      {/* Capital */}
      <mesh castShadow receiveShadow position={[0, 9.8, 0]}>
        <boxGeometry args={[1.4, 0.8, 1.4]} />
        <meshStandardMaterial color="#1e2535" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Glow band */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.15, 8]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={1.2} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 7, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.15, 8]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={1.2} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function Pillars() {
  const count = 12;
  const radius = 22;
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return <Pillar key={i} position={[x, 0, z]} />;
      })}
    </group>
  );
}

function CentralAltar() {
  const torusRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (torusRef.current) torusRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    if (innerRef.current) innerRef.current.rotation.y = -clock.getElapsedTime() * 0.5;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Pedestal */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.8, 2.2, 1, 8]} />
        <meshStandardMaterial color="#1a2035" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Spinning outer torus */}
      <mesh ref={torusRef} position={[0, 2.2, 0]}>
        <torusGeometry args={[1.4, 0.08, 16, 60]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={1.5} />
      </mesh>
      {/* Spinning inner torus */}
      <mesh ref={innerRef} position={[0, 2.2, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.9, 0.06, 12, 48]} />
        <meshStandardMaterial color="#81d4fa" emissive="#81d4fa" emissiveIntensity={1.2} />
      </mesh>
      {/* Core orb */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial color="#e0f4ff" emissive="#4fc3f7" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function AmbientParticles() {
  const count = 80;
  const ref = useRef<THREE.Points>(null);

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 4 + Math.random() * 28;
    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = Math.random() * 12;
    positions[i * 3 + 2] = Math.sin(angle) * r;
  }

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#4fc3f7" size={0.12} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function ArchGateway({ angle }: { angle: number }) {
  const x = Math.cos(angle) * 32;
  const z = Math.sin(angle) * 32;
  return (
    <group position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
      {/* Left post */}
      <mesh castShadow position={[-2, 4, 0]}>
        <boxGeometry args={[0.8, 8, 0.8]} />
        <meshStandardMaterial color="#1e2a40" roughness={0.85} />
      </mesh>
      {/* Right post */}
      <mesh castShadow position={[2, 4, 0]}>
        <boxGeometry args={[0.8, 8, 0.8]} />
        <meshStandardMaterial color="#1e2a40" roughness={0.85} />
      </mesh>
      {/* Arch lintel */}
      <mesh castShadow position={[0, 8.4, 0]}>
        <boxGeometry args={[5, 0.8, 0.8]} />
        <meshStandardMaterial color="#1e2a40" roughness={0.85} />
      </mesh>
      {/* Glow strip */}
      <mesh position={[0, 4.5, 0.1]}>
        <planeGeometry args={[0.12, 7.5]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={1} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export default function HubScene() {
  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.25} color="#1a2a4a" />
      <pointLight position={[0, 8, 0]} intensity={3} color="#4fc3f7" distance={40} decay={2} />
      <pointLight position={[0, 2, 0]} intensity={2} color="#81d4fa" distance={20} decay={2} />
      <directionalLight position={[15, 25, 10]} intensity={0.8} castShadow shadow-mapSize={[2048, 2048]} color="#c8e6ff" />
      <hemisphereLight args={['#1a2a4a', '#0a0f1a', 0.4]} />

      {/* Pillar accent lights */}
      <pointLight position={[22, 4, 0]}   intensity={0.8} color="#4fc3f7" distance={12} decay={2} />
      <pointLight position={[-22, 4, 0]}  intensity={0.8} color="#4fc3f7" distance={12} decay={2} />
      <pointLight position={[0, 4, 22]}   intensity={0.8} color="#4fc3f7" distance={12} decay={2} />
      <pointLight position={[0, 4, -22]}  intensity={0.8} color="#4fc3f7" distance={12} decay={2} />

      <HubFloor />
      <Pillars />
      <CentralAltar />
      <AmbientParticles />
      <ArchGateway angle={0} />
      <ArchGateway angle={Math.PI / 2} />
      <ArchGateway angle={Math.PI} />
      <ArchGateway angle={-Math.PI / 2} />

      {/* Fog plane ceiling — simulates depth */}
      <fog attach="fog" args={['#050c1a', 35, 80]} />
    </group>
  );
}
