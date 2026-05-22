import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const MOVE_SPEED = 6;
const ROTATION_SPEED = 8;
const ARENA_RADIUS = 34;

export interface PlayerCharacterRef {
  position: THREE.Vector3;
}

interface Props {
  classColor: string;
  onAttack: () => void;
}

export default function PlayerCharacter({ classColor, onAttack }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const weaponRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  const keys = useRef<Record<string, boolean>>({});
  const attackAnim = useRef(0); // 0 = idle, 1 = swing, fading back
  const isMoving = useRef(false);
  const walkCycle = useRef(0);
  const facingAngle = useRef(0);

  const { camera } = useThree();
  const [, forceUpdate] = useState(0);

  const handleAttack = useCallback(() => {
    if (attackAnim.current <= 0.05) {
      attackAnim.current = 1;
      onAttack();
    }
  }, [onAttack]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'Space') { e.preventDefault(); handleAttack(); }
    };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleAttack]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    const pos = groupRef.current.position;
    const k = keys.current;

    // Movement direction relative to camera
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();
    const right = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

    const moveDir = new THREE.Vector3();
    if (k['KeyW'] || k['ArrowUp'])    moveDir.add(camDir);
    if (k['KeyS'] || k['ArrowDown'])  moveDir.sub(camDir);
    if (k['KeyA'] || k['ArrowLeft'])  moveDir.sub(right);
    if (k['KeyD'] || k['ArrowRight']) moveDir.add(right);

    const moving = moveDir.lengthSq() > 0;
    isMoving.current = moving;

    if (moving) {
      moveDir.normalize();
      // Clamp to arena
      const next = pos.clone().addScaledVector(moveDir, MOVE_SPEED * delta);
      if (next.length() < ARENA_RADIUS) {
        pos.copy(next);
      }
      // Smooth rotation toward move direction
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      const diff = targetAngle - facingAngle.current;
      const wrapped = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      facingAngle.current += wrapped * Math.min(ROTATION_SPEED * delta, 1);
      groupRef.current.rotation.y = facingAngle.current;
    }

    // Walk cycle animation
    const t = clock.getElapsedTime();
    if (moving) {
      walkCycle.current += delta * 8;
    } else {
      walkCycle.current *= 0.9;
    }
    const wc = walkCycle.current;

    if (leftLegRef.current)  leftLegRef.current.rotation.x  =  Math.sin(wc) * 0.5;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(wc) * 0.5;
    if (leftArmRef.current)  leftArmRef.current.rotation.x  = -Math.sin(wc) * 0.4;
    if (rightArmRef.current && attackAnim.current <= 0) {
      rightArmRef.current.rotation.x = Math.sin(wc) * 0.4;
    }

    // Idle bob
    if (!moving) {
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.04;
    } else {
      groupRef.current.position.y = Math.abs(Math.sin(wc)) * 0.08;
    }

    // Attack animation
    if (attackAnim.current > 0) {
      attackAnim.current = Math.max(0, attackAnim.current - delta * 4);
      const swing = Math.sin(attackAnim.current * Math.PI);
      if (rightArmRef.current) rightArmRef.current.rotation.x = -swing * 1.8;
      if (weaponRef.current) weaponRef.current.rotation.x = -swing * 0.8;
    }

    // Aura pulse
    if (auraRef.current) {
      const pulse = 1 + Math.sin(t * 2.5) * 0.08;
      auraRef.current.scale.setScalar(pulse);
      (auraRef.current.material as THREE.MeshStandardMaterial).opacity = 0.15 + Math.sin(t * 2.5) * 0.05;
    }

    // Camera follow — isometric offset
    const camOffset = new THREE.Vector3(0, 10, 16);
    const targetCamPos = pos.clone().add(camOffset);
    camera.position.lerp(targetCamPos, 0.08);
    camera.lookAt(pos.clone().add(new THREE.Vector3(0, 1, 0)));

    forceUpdate(v => v + 1);
  });

  const color = classColor;
  const darkColor = new THREE.Color(color).multiplyScalar(0.4).getHexString();

  return (
    <group ref={groupRef} position={[0, 0, 5]}>
      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Aura ring */}
      <mesh ref={auraRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.6, 1.0, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.2} depthWrite={false} />
      </mesh>

      {/* Body */}
      <mesh ref={bodyRef} castShadow position={[0, 1.35, 0]}>
        <boxGeometry args={[0.7, 0.85, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} emissive={color} emissiveIntensity={0.1} />
      </mesh>

      {/* Chest plate */}
      <mesh castShadow position={[0, 1.45, 0.21]}>
        <boxGeometry args={[0.6, 0.6, 0.06]} />
        <meshStandardMaterial color={`#${darkColor}`} roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 2.05, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#e8c49a" roughness={0.8} />
      </mesh>

      {/* Visor glow */}
      <mesh position={[0, 2.08, 0.26]}>
        <boxGeometry args={[0.32, 0.1, 0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>

      {/* Left arm */}
      <mesh ref={leftArmRef} castShadow position={[-0.48, 1.4, 0]}>
        <boxGeometry args={[0.22, 0.7, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Right arm */}
      <mesh ref={rightArmRef} castShadow position={[0.48, 1.4, 0]}>
        <boxGeometry args={[0.22, 0.7, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Weapon (right hand) */}
      <mesh ref={weaponRef} castShadow position={[0.48, 0.9, 0.1]}>
        {/* Grip */}
        <group>
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshStandardMaterial color="#4a3728" roughness={0.9} />
          </mesh>
          {/* Blade */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.07, 0.7, 0.04]} />
            <meshStandardMaterial color="#c8d8e8" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Guard */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.28, 0.07, 0.1]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.8} emissive={color} emissiveIntensity={0.3} />
          </mesh>
        </group>
      </mesh>

      {/* Left leg */}
      <mesh ref={leftLegRef} castShadow position={[-0.2, 0.55, 0]}>
        <boxGeometry args={[0.25, 0.7, 0.28]} />
        <meshStandardMaterial color={`#${darkColor}`} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Right leg */}
      <mesh ref={rightLegRef} castShadow position={[0.2, 0.55, 0]}>
        <boxGeometry args={[0.25, 0.7, 0.28]} />
        <meshStandardMaterial color={`#${darkColor}`} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Boots */}
      <mesh castShadow position={[-0.2, 0.14, 0.06]}>
        <boxGeometry args={[0.27, 0.2, 0.38]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.2, 0.14, 0.06]}>
        <boxGeometry args={[0.27, 0.2, 0.38]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.8} />
      </mesh>

      {/* Cape */}
      <mesh castShadow position={[0, 1.3, -0.22]}>
        <boxGeometry args={[0.6, 0.8, 0.06]} />
        <meshStandardMaterial color={`#${darkColor}`} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
