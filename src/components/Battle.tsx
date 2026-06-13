/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlayerStats, Enemy, CombatLog, CharacterClass, Item, ItemType } from '../types';
import { CLASS_IMAGES } from '../constants';
import { PixelTransparentImage } from './PixelTransparentImage';
import { 
  Sword, 
  ShieldAlert, 
  Heart, 
  Zap, 
  Sparkles, 
  Flame, 
  Compass, 
  Activity, 
  AlertCircle,
  RotateCcw,
  Crown,
  Skull,
  Shield
} from 'lucide-react';

interface BattleProps {
  playerStats: PlayerStats;
  enemy: Enemy;
  inventory: Item[];
  onUsePotion: (potionId: string) => void;
  onVictory: (xp: number, gold: number) => void;
  onDefeat: () => void;
  onEscape: () => void;
  activatedTalents?: string[];
}

interface SkillCardData {
  id: string;
  name: string;
  mpCost: number;
  cooldown: number;
  maxCooldown: number;
  description: string;
  icon: React.ReactNode;
  colorClasses: string;
  iconContainerClass: string;
  action: () => void;
}

class SynthEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playAttack() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
    
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playCrit() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.35);
    
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  playBlock() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(140, now + 0.05);
    
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  playHeal() {
    this.init();
    if (!this.ctx) return;
    
    const playTone = (freq: number, delay: number) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, t + 0.14);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    };

    playTone(290, 0);
    playTone(410, 0.05);
    playTone(550, 0.10);
    playTone(820, 0.15);
  }

  playMagic() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.38);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(230, now);
    osc2.frequency.exponentialRampToValueAtTime(920, now + 0.38);
    
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
    
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.43);
    osc2.stop(now + 0.43);
  }

  playSelect() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    gain.gain.setValueAtTime(0.10, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playVictory() {
    this.init();
    if (!this.ctx) return;
    
    const playTone = (freq: number, delay: number, duration: number) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.20, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    };

    playTone(261.63, 0, 0.14); // C4
    playTone(329.63, 0.08, 0.14); // E4
    playTone(392.00, 0.16, 0.14); // G4
    playTone(523.25, 0.24, 0.32); // C5
    playTone(659.25, 0.32, 0.42); // E5
  }

  playHurt() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(30, now + 0.2);
    
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  playUpgrade() {
    this.init();
    if (!this.ctx) return;
    const playPulse = (freq: number, delay: number, length: number) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.20, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + length);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + length + 0.05);
    };

    playPulse(330, 0, 0.15); // E4
    playPulse(392, 0.06, 0.15); // G4
    playPulse(523, 0.12, 0.15); // C5
    playPulse(659, 0.18, 0.30); // E5
  }

  playDefeat() {
    this.init();
    if (!this.ctx) return;
    
    const playTone = (freq: number, delay: number, duration: number) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 0.65, t + duration);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    };

    playTone(220, 0, 0.22); // A3
    playTone(207.65, 0.18, 0.22); // Ab3
    playTone(196, 0.36, 0.22); // G3
    playTone(174.61, 0.54, 0.55); // F3
  }
}

const sfx = new SynthEngine();

export default function Battle({
  playerStats,
  enemy,
  inventory,
  onUsePotion,
  onVictory,
  onDefeat,
  onEscape,
  activatedTalents = []
}: BattleProps) {
  // Combat Local States
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [playerHp, setPlayerHp] = useState(playerStats.hp);
  // Cap starting energy at 18 MP (3 Energy) to avoid starting with too much energy
  const [playerMp, setPlayerMp] = useState(() => Math.min(18, playerStats.mp));
  const [shakeScreen, setShakeScreen] = useState(false);
  const [flashScreen, setFlashScreen] = useState(false);
  const [rageElixirTurns, setRageElixirTurns] = useState(0);

  // Card Mouse Hover 3D Tilt Effect States & Handlers
  const [tiltStyles, setTiltStyles] = useState<Record<string, React.CSSProperties>>({});

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xDeg = ((y / rect.height) - 0.5) * -12;
    const yDeg = ((x / rect.width) - 0.5) * 12;
    setTiltStyles(prev => ({
      ...prev,
      [cardId]: {
        transform: `perspective(400px) rotateX(${xDeg}deg) rotateY(${yDeg}deg) scale(1.045)`,
        zIndex: 50,
      }
    }));
  };

  const handleCardMouseLeave = (cardId: string) => {
    setTiltStyles(prev => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  };

  // Combat Helper Methods
  const getPotionList = (): Item[] => {
    return inventory.filter(item => (item.type as string) === 'POTION');
  };

  const handleVictoryConfirm = () => {
    onVictory(enemy.xpValue, enemy.goldValue || 15);
  };

  const triggerScreenShake = () => {
    setShakeScreen(true);
    setTimeout(() => {
      setShakeScreen(false);
    }, 350);
  };

  const triggerFlashScreen = () => {
    setFlashScreen(true);
    setTimeout(() => {
      setFlashScreen(false);
    }, 350);
  };


  const [tempShield, setTempShield] = useState(0); // Mage Shield
  const [tempDef, setTempDef] = useState(playerStats.def); // Warrior temporary armor
  const [critMultiplier, setCritMultiplier] = useState(1); // Rogue poison/critical multiplier
  const [enemyWeakenedTurns, setEnemyWeakenedTurns] = useState(0); // Rogue poison turns
  const [enemyStunnedTurns, setEnemyStunnedTurns] = useState(0); // Warrior stun turns
  const [skill1Cooldown, setSkill1Cooldown] = useState(0); // Cooldown for Skill 1 (heavy defense or primary spell)
  const [skill2Cooldown, setSkill2Cooldown] = useState(0); // Cooldown for Skill 2 (elite/ultimate level skill)
  const [customCardCooldowns, setCustomCardCooldowns] = useState<Record<string, number>>({});

  // High-dimensional expansion states
  const [doubleEdgedAtkStacks, setDoubleEdgedAtkStacks] = useState(0);
  const [ruinVulnerabilityTurns, setRuinVulnerabilityTurns] = useState(0);
  const [isBloodContractBleeding, setIsBloodContractBleeding] = useState(false);
  const [isShieldResonanceActive, setIsShieldResonanceActive] = useState(false);
  const [lastCastWasDefensive, setLastCastWasDefensive] = useState(false);
  const [lastPlayedSkillId, setLastPlayedSkillId] = useState<string>("");
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);
  const [enemyShield, setEnemyShield] = useState(0);
  const [enemyAtkDebuffTurns, setEnemyAtkDebuffTurns] = useState(0);
  
  const [logs, setLogs] = useState<CombatLog[]>([]);
  const [isCombatFinished, setIsCombatFinished] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  // --- Retro Pixel Minions and Targeting States ---
  interface Minion {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    image: string;
    hurtAnimate?: boolean;
  }
  const [minions, setMinions] = useState<Minion[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | 'main'>('main');

  // --- Elegant Floating Retro Pixel Damage Popups State & Helper ---
  interface DamagePopup {
    id: string;
    text: string;
    x: number;
    y: number;
    color: string;
    isCrit?: boolean;
  }
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);

  const triggerDamagePopup = (text: string, x: number, y: number, color: string, isCrit = false) => {
    const id = `${Math.random()}-${Date.now()}`;
    const scatterX = x + (Math.random() * 8 - 4);
    const scatterY = y + (Math.random() * 10 - 5);
    setDamagePopups((prev) => [
      ...prev,
      { id, text, x: scatterX, y: scatterY, color, isCrit }
    ]);
    setTimeout(() => {
      setDamagePopups((prev) => prev.filter((p) => p.id !== id));
    }, 1100);
  };

  const addPlayerShield = (amount: number) => {
    setTempShield((prev) => prev + amount);
    if (isShieldResonanceActive) {
      const resonanceDmg = Math.round(amount * 0.20);
      if (resonanceDmg > 0) {
        setEnemyHp((prev) => {
          const next = Math.max(0, prev - resonanceDmg);
          if (next <= 0) {
            setWinner('player');
            setIsCombatFinished(true);
            createSmoke('enemy');
          }
          return next;
        });
        triggerDamagePopup(`-${resonanceDmg} 🛡️⚡`, 76, 45, '#38bdf8');
        addLog(`⚡ 【铁画银钩】盾能共振：你获得了 ${amount} 点盾，同步反噬震击敌人造成了 ${resonanceDmg} 点穿钢真实伤害！`, 'player-attack');
      }
    }
  };

  const getSummonType = () => {
    const isFire = enemy.icon === 'Flame' || enemy.image?.toLowerCase().includes('cerberus') || enemy.image?.toLowerCase().includes('fire');
    const isUndead = enemy.icon === 'Skull' || enemy.image?.toLowerCase().includes('lich') || enemy.image?.toLowerCase().includes('skeleton');
    
    if (isFire) {
      const list = [
        { name: '涅槃炎翼奴', hp: 20, maxHp: 20, atk: 5, def: 0, image: '/src/assets/images/pixel_red_bat_1780281378507.png' },
        { name: '爆裂熔岩雏怪', hp: 25, maxHp: 25, atk: 4, def: 2, image: '/src/assets/images/pixel_slime_img_1780280504949.png' }
      ];
      return { ...list[Math.floor(Math.random() * list.length)], id: `minion-${Math.random()}`, hurtAnimate: false };
    } else if (isUndead) {
      const list = [
        { name: '复生枯骨尖刺卒', hp: 24, maxHp: 24, atk: 6, def: 1, image: '/src/assets/images/pixel_skeleton_img_1780280517629.png' },
        { name: '魔沼深渊毒泥怪', hp: 18, maxHp: 18, atk: 7, def: 0, image: '/src/assets/images/pixel_slime_img_1780280504949.png' }
      ];
      return { ...list[Math.floor(Math.random() * list.length)], id: `minion-${Math.random()}`, hurtAnimate: false };
    } else {
      const list = [
        { name: '地牢毒腺蜘蛛灵', hp: 20, maxHp: 20, atk: 5, def: 1, image: '/src/assets/images/pixel_cave_spider_1780281759329.png' },
        { name: '酸蚀莹莹软泥', hp: 16, maxHp: 16, atk: 6, def: 0, image: '/src/assets/images/pixel_slime_img_1780280504949.png' }
      ];
      return { ...list[Math.floor(Math.random() * list.length)], id: `minion-${Math.random()}`, hurtAnimate: false };
    }
  };
  
  // Animation Triggers
  const [playerAttackAnimate, setPlayerAttackAnimate] = useState(false);
  const [enemyAttackAnimate, setEnemyAttackAnimate] = useState(false);
  const [playerHurtAnimate, setPlayerHurtAnimate] = useState(false);
  const [enemyHurtAnimate, setEnemyHurtAnimate] = useState(false);

  // Spark Particles
  interface SparkParticle {
    id: string;
    x: number;
    y: number;
    color: string;
    size: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    isSmoke?: boolean;
    isFlame?: boolean;
    isShield?: boolean;
    width?: number;
    height?: number;
    rotate?: number;
    borderRadius?: string;
    filter?: string;
    boxShadow?: string;
    isProjectile?: boolean;
    projectileType?: 'fireball';
    targetX?: number;
    targetY?: number;
  }

  const [particles, setParticles] = useState<SparkParticle[]>([]);

  const createSparks = (target: 'player' | 'enemy') => {
    const isPlayer = target === 'player';
    const baseX = isPlayer ? 22 : 78;
    const baseY = 55;
    
    const colors = isPlayer
      ? ['#ef4444', '#f97316', '#dc2626', '#facc15', '#ffffff']
      : ['#a855f7', '#3b82f6', '#38bdf8', '#c084fc', '#ffffff'];

    const count = 30;
    const tempParticles: SparkParticle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 5.0;
      tempParticles.push({
        id: `${Math.random()}-${Date.now()}-${i}`,
        x: baseX + (Math.random() * 8 - 4),
        y: baseY + (Math.random() * 12 - 6),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2.5 + Math.floor(Math.random() * 3.5),
        vx: Math.cos(angle) * speed * 0.45,
        vy: Math.sin(angle) * speed * 0.45 - 0.2, // slight upward force
        life: 1.0,
        maxLife: 20 + Math.random() * 15
      });
    }
    setParticles((prev) => [...prev, ...tempParticles]);
  };

  const createSmoke = (target: 'player' | 'enemy') => {
    const isPlayer = target === 'player';
    const baseX = isPlayer ? 22 : 78;
    const baseY = 55;

    const count = 35;
    const tempParticles: SparkParticle[] = [];

    // Nice puffy white, light-gray and soft vapor colors
    const colors = [
      'rgba(255, 255, 255, 0.9)',
      'rgba(240, 240, 240, 0.85)',
      'rgba(225, 225, 225, 0.8)',
      'rgba(212, 212, 212, 0.7)',
      'rgba(190, 190, 190, 0.55)'
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 2.2;
      tempParticles.push({
        id: `smoke-${Math.random()}-${Date.now()}-${i}`,
        x: baseX + (Math.random() * 10 - 5),
        y: baseY + (Math.random() * 14 - 7),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8.0 + Math.random() * 12.0, // larger initial size
        vx: Math.cos(angle) * speed * 0.25,
        vy: Math.sin(angle) * speed * 0.25 - 0.12, // float upward and outward
        life: 1.0,
        maxLife: 35 + Math.random() * 25,
        isSmoke: true
      });
    }
    setParticles((prev) => [...prev, ...tempParticles]);
  };

  const createSkillEffect = (
    type: 'slash' | 'shield' | 'fireball' | 'holy' | 'poison' | 'shadow' | 'arcane',
    target: 'player' | 'enemy'
  ) => {
    const isPlayer = target === 'player';
    const baseX = isPlayer ? 22 : 78;
    const baseY = 55;

    const tempParticles: SparkParticle[] = [];

    if (type === 'slash') {
      const count = 25;
      for (let i = 0; i < count; i++) {
        // Linear slash particles that move fast diagonally
        const angle = (Math.random() - 0.5) * 0.2 + (isPlayer ? Math.PI : 0);
        const speed = 5.0 + Math.random() * 7.0;
        tempParticles.push({
          id: `slash-${Math.random()}-${Date.now()}-${i}`,
          x: baseX + (Math.random() * 20 - 10),
          y: baseY + (Math.random() * 20 - 10),
          color: '#f8fafc', // bright silver white
          size: 3,
          width: 18 + Math.random() * 32,
          height: 1.5 + Math.random() * 1.5,
          vx: Math.cos(angle) * speed * 0.5,
          vy: Math.sin(angle) * speed * 0.15,
          life: 1.0,
          maxLife: 12 + Math.random() * 8,
          rotate: -25 + (Math.random() - 0.5) * 15, // cool diagonal slash angle
          borderRadius: '1px',
          boxShadow: '0 0 12px #ffffff'
        });
      }
    } else if (type === 'fireball') {
      const startX = target === 'player' ? 78 : 22;
      const targetX = target === 'player' ? 22 : 78;
      const startY = 55;
      const targetY = 55;

      const dx = targetX - startX;
      const dy = targetY - startY;
      const steps = 18; // travel frames (about 0.3s)
      const vx = dx / steps;
      const vy = dy / steps;

      tempParticles.push({
        id: `fireball-projectile-${Math.random()}-${Date.now()}`,
        x: startX,
        y: startY,
        color: '#ffdd00',
        size: 14,
        width: 25,
        height: 14,
        vx: vx,
        vy: vy,
        life: 1.0,
        maxLife: 100, // persists until explosion triggers on boundary arrival
        isProjectile: true,
        projectileType: 'fireball',
        targetX: targetX,
        targetY: targetY,
        borderRadius: '50%',
        filter: 'blur(0.5px)',
        boxShadow: '0 0 16px #ff4550, 0 0 32px #ff8c00',
        rotate: target === 'player' ? 180 : 0
      });
    } else if (type === 'holy') {
      const count = 45;
      const colors = ['#facc15', '#eab308', '#fef08a', '#ffffff', '#fffbeb'];
      for (let i = 0; i < count; i++) {
        tempParticles.push({
          id: `holy-${Math.random()}-${Date.now()}-${i}`,
          x: baseX + (Math.random() * 18 - 9),
          y: baseY - 24 - Math.random() * 25, // Start high
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4,
          width: 3.5 + Math.random() * 4.5,
          height: 20 + Math.random() * 38, // tall vertical laser beam sparks
          vx: (Math.random() - 0.5) * 0.25,
          vy: 2.2 + Math.random() * 3.2, // fast vertical speed down
          life: 1.0,
          maxLife: 15 + Math.random() * 10,
          borderRadius: '2px',
          boxShadow: '0 0 20px #facc15'
        });
      }
    } else if (type === 'shield') {
      const count = 35;
      const colors = ['#38bdf8', '#0ea5e9', '#0284c7', '#7dd3fc', '#ffffff'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2.2;
        tempParticles.push({
          id: `shield-${Math.random()}-${Date.now()}-${i}`,
          x: baseX + Math.cos(angle) * 4,
          y: baseY + Math.sin(angle) * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 6.0 + Math.random() * 7.5,
          vx: Math.cos(angle) * speed * 0.15,
          vy: -0.6 - Math.random() * 1.2, // lift upward continuously
          life: 1.0,
          maxLife: 38 + Math.random() * 15,
          borderRadius: '4px', // Diamond crystalline shapes
          rotate: Math.random() * 360,
          boxShadow: '0 0 14px #38bdf8'
        });
      }
    } else if (type === 'poison') {
      const count = 40;
      const colors = ['#22c55e', '#10b981', '#14532d', '#a3e635', '#064e3b'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.0 + Math.random() * 4.8;
        tempParticles.push({
          id: `poison-${Math.random()}-${Date.now()}-${i}`,
          x: baseX + (Math.random() * 12 - 6),
          y: baseY + (Math.random() * 12 - 6),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 7,
          vx: Math.cos(angle) * speed * 0.22,
          vy: Math.sin(angle) * speed * 0.15 + 0.6, // heavy acid drip effect
          life: 1.0,
          maxLife: 26 + Math.random() * 12,
          borderRadius: '50%',
          boxShadow: '0 0 12px #22c55e'
        });
      }
    } else if (type === 'arcane') {
      const count = 40;
      const colors = ['#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#ffffff'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.8 + Math.random() * 2.8;
        tempParticles.push({
          id: `arcane-${Math.random()}-${Date.now()}-${i}`,
          x: baseX + Math.cos(angle) * 8,
          y: baseY + Math.sin(angle) * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 5 + Math.random() * 7,
          vx: -Math.cos(angle) * speed * 0.15, // swirl inward
          vy: -Math.sin(angle) * speed * 0.12 - 0.35, // float slowly upward
          life: 1.0,
          maxLife: 32 + Math.random() * 15,
          borderRadius: '50%',
          boxShadow: '0 0 16px currentColor'
        });
      }
    } else if (type === 'shadow') {
      const count = 40;
      const colors = ['#1e1b4b', '#311042', '#000000', '#581c87', '#6b21a8'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2.5;
        tempParticles.push({
          id: `shadow-${Math.random()}-${Date.now()}-${i}`,
          x: baseX + (Math.random() * 14 - 7),
          y: baseY + (Math.random() * 14 - 7),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 10 + Math.random() * 18,
          isSmoke: true,
          vx: Math.cos(angle) * speed * 0.25,
          vy: Math.sin(angle) * speed * 0.25 - 0.1, // fade out floating up
          life: 1.0,
          maxLife: 34 + Math.random() * 20,
          filter: 'blur(2.5px)'
        });
      }
    }

    setParticles((prev) => [...prev, ...tempParticles]);
  };

  useEffect(() => {
    if (particles.length === 0) return;
    let animFrameId: number;

    const tick = () => {
      setParticles((prev) => {
        const nextParticles: SparkParticle[] = [];
        const spawnedDuringTick: SparkParticle[] = [];

        for (const p of prev) {
          if (p.isProjectile) {
            // Check if projectile reached destination
            const dx = p.targetX! - p.x;
            const dy = p.targetY! - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const isNear = dist <= speed * 1.5;

            if (isNear) {
              // DETONATION BLAST! Spawn massive explosive fireworks at target coordinates
              const count = 48;
              const colors = ['#f59e0b', '#ef4444', '#f97316', '#ff4500', '#ff8c00', '#ffffff'];
              for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 1.0 + Math.random() * 8.5;
                spawnedDuringTick.push({
                  id: `fire-exp-${Math.random()}-${Date.now()}-${i}`,
                  x: p.targetX! + (Math.random() * 4 - 2),
                  y: p.targetY! + (Math.random() * 8 - 4),
                  color: colors[Math.floor(Math.random() * colors.length)],
                  size: 7.0 + Math.random() * 15.0,
                  vx: Math.cos(angle) * spd * 0.38,
                  vy: Math.sin(angle) * spd * 0.38 - 0.25, // fly outwards and upwards
                  life: 1.0,
                  maxLife: 24 + Math.random() * 20,
                  borderRadius: '50%',
                  filter: 'blur(1px)',
                  boxShadow: '0 0 18px currentColor'
                });
              }
            } else {
              // Standard continuation
              const nextX = p.x + p.vx;
              const nextY = p.y + p.vy;

              // Spawn 2 flame/spark trail particles behind the head
              const trailColors = ['#ff4500', '#ff8c00', '#ef4444', '#f59e0b'];
              for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 0.4 + Math.random() * 1.2;
                spawnedDuringTick.push({
                  id: `trail-${Math.random()}-${Date.now()}-${i}`,
                  x: nextX - p.vx * 0.4,
                  y: nextY - p.vy * 0.4,
                  color: trailColors[Math.floor(Math.random() * trailColors.length)],
                  size: 3.5 + Math.random() * 5.5,
                  vx: -p.vx * 0.25 + Math.cos(angle) * spd * 0.12, // eject slightly backwards
                  vy: -p.vy * 0.25 + Math.sin(angle) * spd * 0.12 - 0.04,
                  life: 0.85,
                  maxLife: 8 + Math.random() * 8,
                  borderRadius: '50%',
                  filter: 'blur(0.5px)'
                });
              }

              nextParticles.push({
                ...p,
                x: nextX,
                y: nextY
              });
            }
          } else {
            // Standard particles
            const nextX = p.x + p.vx;
            const nextY = p.y + p.vy;
            const nextVy = p.isSmoke ? p.vy - 0.003 : p.vy + 0.012; // float up if smoke, else fall
            const nextSize = p.isSmoke ? p.size + 0.35 : p.size;
            const nextLife = p.life - 1 / p.maxLife;

            if (nextLife > 0) {
              nextParticles.push({
                ...p,
                x: nextX,
                y: nextY,
                vy: nextVy,
                size: nextSize,
                life: nextLife
              });
            }
          }
        }

        return [...nextParticles, ...spawnedDuringTick];
      });
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [particles.length]);

  // Intent calculation (Weakened influence)
  const getEnemyBaseValue = () => {
    let val = enemy.intentValue;
    if (enemyAtkDebuffTurns > 0) {
      val = Math.max(1, val - 4);
    }
    return val;
  };

  const currentEnemyAttackValue = Math.max(1, Math.round(
    enemy.intent === 'ATTACK' && enemyWeakenedTurns > 0 
      ? getEnemyBaseValue() * 0.7 
      : getEnemyBaseValue()
  ));

  // Initialize combat logs
  useEffect(() => {
    setLogs([
      {
        id: 'start',
        text: `⚔️ 地牢宿命相遇！遭遇魔物: 「${enemy.name}」!`,
        type: 'info'
      }
    ]);
  }, [enemy]);

  const addLog = (text: string, type: CombatLog['type']) => {
    setLogs((prev) => [{ id: Math.random().toString(), text, type }, ...prev]);
  };

  // Turn-based: start next Player turn
  const startPlayerTurn = () => {
    setIsPlayerTurn(true);
    
    // Recover 18 MP (+3 Energy) capped at player's max usable MP
    setPlayerMp((prev) => Math.min(playerStats.maxMp, prev + 18));
    addLog(`⏳ 我的回合开始！能量值恢复 +18 MP (+3 能量) ⚡`, 'player-heal');
    triggerDamagePopup("+18 MP", 22, 45, '#38bdf8');
    
    // Spark and mystical blue shield shield-ups on the player side for feedback
    createSkillEffect('shield', 'player');

    // High-dimensional ticks
    if (isBloodContractBleeding) {
      setPlayerHp((prev) => {
        const nextHp = Math.max(1, prev - 5);
        triggerDamagePopup("-5 HP 🩸", 22, 50, '#ef4444');
        addLog(`🩸 【禁忌血契】血债噬咬：血管暴涌扣减了你 5 点生命 HP！`, 'info');
        return nextHp;
      });
    }

    if (ruinVulnerabilityTurns > 0) {
      setRuinVulnerabilityTurns((prev) => {
        if (prev === 1) {
          addLog(`⚡ 【堕天狂意】的“崩坏易伤”状态随流沙散去，你的御抗体感重回常态。`, 'info');
        }
        return prev - 1;
      });
    }

    if (enemyAtkDebuffTurns > 0) {
      setEnemyAtkDebuffTurns((prev) => prev - 1);
    }

    // Cool down countdown reductions
    setSkill1Cooldown((prev) => Math.max(0, prev - 1));
    setSkill2Cooldown((prev) => Math.max(0, prev - 1));
    setCustomCardCooldowns((prev) => {
      const next = { ...prev };
      for (const cardId in next) {
        next[cardId] = Math.max(0, next[cardId] - 1);
      }
      return next;
    });

    // 1. Rage Elixir turn reduction check
    if (rageElixirTurns > 0) {
      setRageElixirTurns((prev) => {
        if (prev === 1) {
          addLog(`🧪 虚空怒血印记消褪，你的狂暴本能渐渐回落归入宁静。`, 'info');
        }
        return prev - 1;
      });
    }

    // 2. Pyromancer Mage passive burning (t_mage_pyro)
    if (activatedTalents.includes('t_mage_pyro') && enemyHp > 0) {
      const burnDmg = 8;
      setEnemyHp((prev) => {
        const nextVal = Math.max(0, prev - burnDmg);
        if (nextVal <= 0) {
          setWinner('player');
          setIsCombatFinished(true);
        }
        return nextVal;
      });
      triggerDamagePopup(`-${burnDmg} 🔥`, 76, 45, '#f59e0b');
      addLog(`🔥 命印【混沌烈焰】释放：魔物承受火种燃烧折磨，常驻受到 ${burnDmg} 点法术灼烧！`, 'player-attack');
    }

    // 3. Rogue Venom passive tick (t_rogue_venom)
    if (enemyWeakenedTurns > 0 && playerStats.classType === CharacterClass.ROGUE && enemyHp > 0) {
      const poisonDmg = activatedTalents.includes('t_rogue_venom') ? 14 : 7;
      setEnemyHp((prev) => {
        const nextVal = Math.max(0, prev - poisonDmg);
        if (nextVal <= 0) {
          setWinner('player');
          setIsCombatFinished(true);
        }
        return nextVal;
      });
      triggerDamagePopup(`-${poisonDmg} 🧪`, 76, 45, '#22c55e');
      addLog(`🧪 恶性毒印：致残之毒腐蚀其外壳鳞片，使怪物受到 ${poisonDmg} 点毒性撕裂商！`, 'player-attack');
    }

    // 4. Warrior defensive shield tick (t_war_shield)
    if (activatedTalents.includes('t_war_shield')) {
      const gvShield = 6;
      setTempShield((prev) => prev + gvShield);
      triggerDamagePopup(`+6 🛡️`, 22, 45, '#d97706');
      addLog(`🛡️ 命印【圣教御守】感悟：你调动周身骨骼重卡凝聚出 ${gvShield} 点护体圣气盾墙！`, 'player-heal');
    }
  };

  // Modern Unified Combat damage execution with complete target-awareness and custom retro pixel damage popups
  const executeCombatAction = (
    multiplier: number,
    skillName: string,
    effectType: 'slash' | 'holy' | 'fireball' | 'poison',
    stunTurns = 0,
    weakenTurns = 0
  ) => {
    setPlayerAttackAnimate(true);

    // Auto target fallback if previous target main is dead but minions remain
    let actualTargetId = selectedTargetId;
    if (actualTargetId === 'main' && enemyHp <= 0 && minions.length > 0) {
      actualTargetId = minions[0].id;
      setSelectedTargetId(minions[0].id);
    }

    const isMainTarget = actualTargetId === 'main';
    const targetMinion = isMainTarget ? null : minions.find(m => m.id === actualTargetId);
    
    // Get target coordinates for physical/spell projectile and popups
    let targetX = 76;
    let targetY = 45;
    let targetName = enemy.name;
    let targetDef = enemy.def;

    if (!isMainTarget && targetMinion) {
      const idx = minions.findIndex(m => m.id === targetMinion.id);
      targetX = idx === 0 ? 64 : 52;
      targetY = idx === 0 ? 52 : 60;
      targetName = targetMinion.name;
      targetDef = targetMinion.def;
    }

    // Trigger hurt flashes
    if (isMainTarget) {
      setEnemyHurtAnimate(true);
    } else if (targetMinion) {
      setMinions((prev) =>
        prev.map((m) => (m.id === targetMinion.id ? { ...m, hurtAnimate: true } : m))
      );
    }

    // Calculate critical status
    let currentCrits = critMultiplier;
    if (rageElixirTurns > 0) {
      currentCrits = 2.5; // Supreme criticals on active battle elixir drinking
    }

    // Trigger screenshakes & sound assets
    triggerScreenShake();
    if (effectType !== 'slash') {
      sfx.playMagic();
    } else if (currentCrits > 1) {
      sfx.playCrit();
      triggerFlashScreen();
    } else {
      sfx.playAttack();
    }

    // Spawn custom retro visual spell and explosion particles 
    createSkillEffect(effectType, isMainTarget ? 'enemy' : 'enemy');

    const isSpell = effectType === 'fireball' || effectType === 'holy' || effectType === 'poison';
    let finalMultiplier = multiplier * currentCrits;
    if (isSpell && playerStats.classType === 'MAGE' && activatedTalents.includes('t_special')) {
      finalMultiplier *= 1.25; // 25% spell damage boost for Awakened Mage
    }

    // 1. Berserker low HP despair multiplier
    if (playerStats.ascendedClass === '破灭狂战' && playerHp < playerStats.maxHp * 0.40) {
      finalMultiplier *= 1.45;
    }

    // 2. Fetch active item set count lists
    const equippedList = inventory.filter(i => i.isEquipped);
    const countMyth = equippedList.filter(i => i.setName === '造物神话').length;
    const countDarkfire = equippedList.filter(i => i.setName === '深渊黑焰').length;
    const countDeathKnight = equippedList.filter(i => i.setName === '亡誓骑士').length;

    // 3. Stun/freeze breaks armor, defense bypasses to zero
    const actualTargetDef = enemyStunnedTurns > 0 ? 0 : targetDef;

    const currentAtkValue = playerStats.atk + (doubleEdgedAtkStacks * 12);
    let dmg = Math.max(1, Math.round((currentAtkValue * finalMultiplier) - actualTargetDef));

    // Death Knight bonus +4 flat physical damage
    if (countDeathKnight >= 2) {
      dmg += 4;
    }
    // Myth divine bonus +15 true explosion damage
    if (countMyth >= 2) {
      dmg += 15;
    }

    // Show beautiful pixel popups colorized by element classes
    const popupColor = effectType === 'holy' ? '#facc15' : effectType === 'fireball' ? '#f59e0b' : effectType === 'poison' ? '#22c55e' : '#f43f5e';
    triggerDamagePopup(
      `-${dmg}`, 
      targetX, 
      targetY - 5, 
      popupColor, 
      currentCrits > 1
    );

    // HP Lifesteal talent trigger (t_hp)
    const triggerLifesteal = activatedTalents.includes('t_hp') && Math.random() < 0.20;
    if (triggerLifesteal) {
      const healAmt = 5;
      setPlayerHp((prev) => Math.min(playerStats.maxHp, prev + healAmt));
      triggerDamagePopup("+5 HP 🩸", 22, 50, '#22c55e');
      addLog(`🩸 命印【血裔契灵】触发：由于你斩击造成的痛楚，你反向噬血恢复了 ${healAmt} 点生命值！`, 'player-heal');
    }

    // 4. Berserker active skill leach + Darkfire Set lifesteals
    let bloodSuckAmt = 0;
    if (playerStats.ascendedClass === '破灭狂战' && skillName === '狂暴怒斩') {
      bloodSuckAmt += Math.round(dmg * 0.15);
    }
    if (countDarkfire >= 2) {
      bloodSuckAmt += Math.round(dmg * 0.05);
    }
    if (bloodSuckAmt > 0) {
      setPlayerHp((prev) => Math.min(playerStats.maxHp, prev + bloodSuckAmt));
      triggerDamagePopup(`+${bloodSuckAmt} HP ❤️`, 22, 50, '#10b981');
      addLog(`❤️ 终极吸血：由于狂战狂怒或【深渊黑焰】套装神力，吸魔汲林恢复 ${bloodSuckAmt} 点生命值！`, 'player-heal');
    }

    // Rogue double strike talent trigger (t_special)
    const triggerDoubleStrike = playerStats.classType === 'ROGUE' && activatedTalents.includes('t_special') && Math.random() < 0.22;
    if (triggerDoubleStrike) {
      setTimeout(() => {
        const extraDmg = Math.max(1, Math.round(dmg * 0.6));
        if (isMainTarget) {
          setEnemyHp((prev) => {
            const afterDmg = Math.max(0, prev - extraDmg);
            if (afterDmg <= 0) {
              setWinner('player');
              setIsCombatFinished(true);
            }
            return afterDmg;
          });
        } else if (targetMinion) {
          setMinions((prev) =>
            prev.map((m) => (m.id === targetMinion.id ? { ...m, hp: Math.max(0, m.hp - extraDmg) } : m))
          );
        }
        triggerDamagePopup(`-${extraDmg}`, targetX + 10, targetY - 15, popupColor);
        addLog(`⚡ 【致死连击】触发：瞬杀暗印爆发，追加副刀连击，造成 ${extraDmg} 点割喉伤害！`, 'player-attack');
      }, 250);
    }

    // Apply HP change
    let hpDmg = dmg;
    if (isMainTarget && enemyShield > 0) {
      if (enemyShield >= dmg) {
        setEnemyShield((prev) => prev - dmg);
        triggerDamagePopup("吸收 🛡️", targetX, targetY - 10, '#38bdf8');
        addLog(`🛡️ 敌方的护体格挡皮盾阻挡并抵消了你的全部 ${dmg} 点攻击！`, 'info');
        hpDmg = 0;
      } else {
        const stolenVal = enemyShield;
        setEnemyShield(0);
        hpDmg = dmg - stolenVal;
        triggerDamagePopup(`-${stolenVal} 🛡️`, targetX, targetY - 10, '#38bdf8');
        addLog(`💥 敌方的格挡盾碎孔破裂（抵消了 ${stolenVal} 点），余下 ${hpDmg} 点穿透伤害裂透至其本体！`, 'player-attack');
      }
    }

    if (isMainTarget) {
      const nextHp = Math.max(0, enemyHp - hpDmg);
      setEnemyHp(nextHp);
      
      // Apply status debuffs to boss
      if (stunTurns > 0) setEnemyStunnedTurns((prev) => prev + stunTurns);
      if (weakenTurns > 0) setEnemyWeakenedTurns((prev) => prev + weakenTurns);

      if (hpDmg > 0 || dmg === 0) {
        addLog(`⚔️ 你施展【${skillName}】，对「${targetName}」造成了 ${hpDmg} 点穿透生命伤害！`, 'player-attack');
      }

      if (nextHp <= 0) {
        if (minions.length > 0) {
          setTimeout(() => {
            setPlayerAttackAnimate(false);
            setEnemyHurtAnimate(false);
            createSmoke('enemy');
            addLog(`💥 「${enemy.name}」已被你斩杀击竭！但其呼唤出的召唤怪物仍留在战场负隅顽抗，速战速决！`, 'info');
            // Auto target the first available minion
            setSelectedTargetId(minions[0].id);
          }, 400);
        } else {
          setTimeout(() => {
            setPlayerAttackAnimate(false);
            setEnemyHurtAnimate(false);
            setWinner('player');
            setIsCombatFinished(true);
            createSmoke('enemy');
            addLog(`🏆 胜利！你彻底净化了魔物「${enemy.name}」!`, 'victory');
            sfx.playVictory();
          }, 400);
        }
        return;
      }
    } else if (targetMinion) {
      const nextHp = Math.max(0, targetMinion.hp - hpDmg);
      
      setMinions((prev) =>
        prev.map((m) => (m.id === targetMinion.id ? { ...m, hp: nextHp } : m))
      );

      addLog(`⚔️ 你施展【${skillName}】，对召唤物「${targetName}」造成了 ${hpDmg} 点打击！`, 'player-attack');

      if (nextHp <= 0) {
        setTimeout(() => {
          createSmoke('enemy');
          addLog(`💥 [召唤物]「${targetName}」承受不住打击，惨吐烟雾化为碎影！`, 'info');
          
          setMinions((prev) => {
            const nextList = prev.filter((m) => m.id !== targetMinion.id);
            if (enemyHp <= 0 && nextList.length === 0) {
              setWinner('player');
              setIsCombatFinished(true);
              addLog(`🏆 战役全胜！你清除了所有盘据的黑暗余孽，顺利通关！`, 'victory');
            } else {
              if (enemyHp > 0) {
                setSelectedTargetId('main');
              } else if (nextList.length > 0) {
                setSelectedTargetId(nextList[0].id);
              }
            }
            return nextList;
          });
        }, 300);
      }
    }

    // Reset Rogue critical state
    if (critMultiplier > 1) {
      setCritMultiplier(1);
    }

    setTimeout(() => {
      setPlayerAttackAnimate(false);
      if (isMainTarget) {
        setEnemyHurtAnimate(false);
      } else if (targetMinion) {
        setMinions((prev) =>
          prev.map((m) => (m.id === targetMinion.id ? { ...m, hurtAnimate: false } : m))
        );
      }
    }, 450);
  };

  // Turn-based: end current Player turn and trigger Enemy attack phase (Slay the Spire style)
  const handlePlayerEndTurn = () => {
    if (isCombatFinished || !isPlayerTurn) return;

    setIsPlayerTurn(false);
    addLog(`⏳ 结束回合。轮到了「${enemy.name}」的行动回合！`, 'info');

    // Double check if enemy has perished
    if (enemyHp <= 0) {
      if (minions.length > 0) {
        setTimeout(() => {
          addLog(`⚠️ 大怪已灭，但残存的召唤物「${minions.map(m => m.name).join('、')}」仍在疯狂反击！`, 'info');
          let currentAccumulatedHp = playerHp;
          minions.forEach((m, idx) => {
            setTimeout(() => {
              if (isCombatFinished) return;
              setPlayerHurtAnimate(true);
              createSparks('player');
              createSkillEffect('slash', 'player');

              const minMinionDmg = Math.max(1, Math.round(m.atk * 0.20));
              const minionDmg = Math.max(minMinionDmg, m.atk - playerStats.def);
              currentAccumulatedHp = Math.max(0, currentAccumulatedHp - minionDmg);
              setPlayerHp(currentAccumulatedHp);
              triggerDamagePopup(`-${minionDmg}`, 22, 45, '#ef4444');
              addLog(`⚔️ [召唤物]「${m.name}」疯狂撕扯，对你造成 ${minionDmg} 点穿透物理普击！`, 'enemy-attack');

              setTimeout(() => setPlayerHurtAnimate(false), 250);

              if (currentAccumulatedHp <= 0) {
                setWinner('enemy');
                setIsCombatFinished(true);
                createSmoke('player');
                addLog(`💀 败北... 你的灵魂逐渐消逝在深渊黑暗之中...`, 'defeat');
              }
            }, 600 * (idx + 1));
          });

          setTimeout(() => {
            if (currentAccumulatedHp > 0) {
              startPlayerTurn();
            }
          }, 600 * minions.length + 500);
        }, 500);
        return;
      } else {
        setWinner('player');
        setIsCombatFinished(true);
        createSmoke('enemy');
        addLog(`🏆 胜利！你彻底净化了魔物「${enemy.name}」!`, 'victory');
        return;
      }
    }

    // Process Stun debuff
    if (enemyStunnedTurns > 0) {
      setTimeout(() => {
        setEnemyStunnedTurns((prev) => prev - 1);
        addLog(`✨ 「${enemy.name}」处于击晕失神状态，本轮无法行动！`, 'info');
        triggerDamagePopup("眩晕 🌀", 76, 42, '#facc15');
        
        if (enemyWeakenedTurns > 0) {
          setEnemyWeakenedTurns((prev) => prev - 1);
        }

        // Active minions can still attack if they exist
        if (minions.length > 0) {
          addLog(`⚠️ 尽管领主被击晕，但场上的召唤物仍在顽强冲锋！`, 'info');
          let currentAccumulatedHp = playerHp;
          minions.forEach((m, idx) => {
            setTimeout(() => {
              if (isCombatFinished) return;
              setPlayerHurtAnimate(true);
              createSparks('player');
              createSkillEffect('slash', 'player');

              const minMinionDmg = Math.max(1, Math.round(m.atk * 0.20));
              const minionDmg = Math.max(minMinionDmg, m.atk - playerStats.def);
              currentAccumulatedHp = Math.max(0, currentAccumulatedHp - minionDmg);
              setPlayerHp(currentAccumulatedHp);
              triggerDamagePopup(`-${minionDmg}`, 22, 45, '#ef4444');
              addLog(`⚔️ [召唤物]「${m.name}」疯狂撕扯，对你造成 ${minionDmg} 点穿透物理普击！`, 'enemy-attack');

              setTimeout(() => setPlayerHurtAnimate(false), 250);

              if (currentAccumulatedHp <= 0) {
                setWinner('enemy');
                setIsCombatFinished(true);
                createSmoke('player');
                addLog(`💀 败北... 你的灵魂逐渐消逝在深渊黑暗之中...`, 'defeat');
              }
            }, 600 * (idx + 1));
          });

          setTimeout(() => {
            if (currentAccumulatedHp > 0) {
              startPlayerTurn();
            }
          }, 600 * minions.length + 500);
        } else {
          setTimeout(() => {
            startPlayerTurn();
          }, 850);
        }
      }, 500);
      return;
    }

    // Enemy Action simulation
    setTimeout(() => {
      let isSummonTurn = false;
      
      // Bosses and elites have a massive 45% chance to call a protective minion if below cap
      if ((enemy.isBoss || enemy.isElite || enemy.maxHp >= 50) && minions.length < 2 && Math.random() < 0.45) {
        isSummonTurn = true;
      }

      setEnemyAttackAnimate(true);

      let finalPlayerHp = playerHp;
      let finalTempShield = tempShield;

      if (isSummonTurn) {
        //召唤！
        const newMinion = getSummonType();
        setMinions((prev) => [...prev, newMinion]);
        
        const summonIdx = minions.length;
        const targetMinionX = summonIdx === 0 ? 64 : 52;
        const targetMinionY = summonIdx === 0 ? 52 : 60;
        
        createSkillEffect('shadow', 'enemy');
        triggerDamagePopup("召唤 🪄", targetMinionX, targetMinionY - 10, '#ec4899');
        
        // Boss gains block shield protection
        setTempDef((prev) => prev + 4);
        addLog(`🔮 「${enemy.name}」口中轻吐邪恶冥音，施展禁忌唤灵！召唤「${newMinion.name}」在身前列阵护卫！`, 'info');
      } else {
        // Standard moves
        if (enemy.intent === 'ATTACK') {
          setPlayerHurtAnimate(true);
          createSparks('player');

          if (enemy.icon === 'Crown') {
            createSkillEffect('holy', 'player');
          } else if (enemy.icon === 'Flame') {
            createSkillEffect('fireball', 'player');
          } else if (enemy.icon === 'Skull') {
            createSkillEffect('shadow', 'player');
          } else {
            createSkillEffect('slash', 'player');
          }

          // Elite and Boss attacks penetrate defense of players to ensure battles remain highly engaging and challenging.
          // Bosses bypass 45% of player defense. Elites bypass 25% of player defense.
          // There is also a minimum damage threshold: Bosses deal at least 45% of raw ATK; Elites 30%; Normal enemies 20%.
          const defenseBypassPct = enemy.isBoss ? 0.45 : (enemy.isElite ? 0.25 : 0);
          const effectiveDef = Math.max(0, tempDef * (1 - defenseBypassPct));
          const minDamagePct = enemy.isBoss ? 0.45 : (enemy.isElite ? 0.30 : 0.20);
          const minDmg = Math.max(1, Math.round(currentEnemyAttackValue * minDamagePct));
          let baseDamage = Math.max(minDmg, Math.round(currentEnemyAttackValue - effectiveDef));
          
          if (ruinVulnerabilityTurns > 0) {
            baseDamage = Math.round(baseDamage * 1.35);
          }
          const damage = baseDamage;

          if (finalTempShield > 0) {
            if (finalTempShield >= damage) {
              finalTempShield -= damage;
              triggerDamagePopup("吸收 🛡️", 22, 45, '#38bdf8');
              addLog(`🛡️ 你的魔力奥术护盾阻挡了全部 ${damage} 点攻击！${ruinVulnerabilityTurns > 0 ? "（含「崩坏易伤」+35% 加剧）" : ""}`, 'player-heal');
              sfx.playBlock();
            } else {
              const remainder = damage - finalTempShield;
              finalTempShield = 0;
              finalPlayerHp = Math.max(0, finalPlayerHp - remainder);
              triggerDamagePopup(`-${remainder}`, 22, 45, '#ef4444');
              addLog(`💥 敌人的攻击粉碎了你的魔法奥术护盾并在「崩坏易伤」加剧下对你造成了 ${remainder} 点物理重击！`, 'enemy-attack');
              sfx.playHurt();
              triggerScreenShake();
            }
          } else {
            finalPlayerHp = Math.max(0, finalPlayerHp - damage);
            triggerDamagePopup(`-${damage}`, 22, 45, '#ef4444');
            addLog(`💥 「${enemy.name}」对你发出咆哮撕咬，造成了 ${damage} 点物理伤害。${ruinVulnerabilityTurns > 0 ? "（触发「崩坏易伤」伤害增加 35%！）" : ""}`, 'enemy-attack');
            sfx.playHurt();
            triggerScreenShake();
          }
        } else if (enemy.intent === 'DEFEND') {
          triggerDamagePopup("+防 🛡️", 76, 45, '#38bdf8');
          addLog(`🛡️ 「${enemy.name}」伏地咆哮，展开坚骨防御，大幅提升自身格挡！`, 'info');
        } else if (enemy.intent === 'HEAL') {
          const healAmt = enemy.intentValue;
          setEnemyHp((prev) => Math.min(enemy.maxHp, prev + healAmt));
          triggerDamagePopup(`+${healAmt}`, 76, 45, '#22c55e');
          addLog(`💚 「${enemy.name}」贪婪地吸食四周死灵血气，自身恢复了 ${healAmt} 点生命。`, 'enemy-heal');
        } else {
          triggerDamagePopup("狂暴 ⚡", 76, 45, '#facc15');
          addLog(`🧪 「${enemy.name}」正在口吐深渊迷雾，战力状态瞬间得到极地增强。`, 'info');
        }
      }

      setTempShield(finalTempShield);
      setPlayerHp(finalPlayerHp);

      // Decrement Weakened turns
      if (enemyWeakenedTurns > 0) {
        setEnemyWeakenedTurns((prev) => prev - 1);
      }

      // Check if player died
      if (finalPlayerHp <= 0) {
        setWinner('enemy');
        setIsCombatFinished(true);
        createSmoke('player');
        addLog(`💀 败北... 你的灵魂逐渐消逝在深渊黑暗之中...`, 'defeat');
        setEnemyAttackAnimate(false);
        sfx.playDefeat();
        return;
      }

      // Restore temporary defense parameters
      setTempDef(playerStats.def);

      setTimeout(() => {
        setEnemyAttackAnimate(false);
        setPlayerHurtAnimate(false);

        // Chain Minion reactions if they are active
        if (minions.length > 0) {
          let currentAccumulatedHp = finalPlayerHp;
          minions.forEach((m, idx) => {
            setTimeout(() => {
              if (isCombatFinished) return;
              setPlayerHurtAnimate(true);
              createSparks('player');
              createSkillEffect('slash', 'player');

              const minMinionDmg = Math.max(1, Math.round(m.atk * 0.20));
              const minionDmg = Math.max(minMinionDmg, m.atk - playerStats.def);
              currentAccumulatedHp = Math.max(0, currentAccumulatedHp - minionDmg);
              setPlayerHp(currentAccumulatedHp);
              triggerDamagePopup(`-${minionDmg}`, 22, 45, '#ef4444');
              addLog(`⚔️ [召唤物]「${m.name}」向你凶狠扑咬，造成 ${minionDmg} 点撕裂伤！`, 'enemy-attack');

              setTimeout(() => setPlayerHurtAnimate(false), 250);

              if (currentAccumulatedHp <= 0) {
                setWinner('enemy');
                setIsCombatFinished(true);
                createSmoke('player');
                addLog(`💀 败北... 你的灵魂逐渐消逝在深渊黑暗之中...`, 'defeat');
              }
            }, 600 * (idx + 1));
          });

          setTimeout(() => {
            if (currentAccumulatedHp > 0) {
              startPlayerTurn();
            }
          }, 600 * minions.length + 500);
        } else {
          startPlayerTurn();
        }
      }, 500);

    }, 800);
  };

  // Basic Action Hook
  const handleBasicAttack = () => {
    if (isCombatFinished || !isPlayerTurn) return;
    // All classes now consume 6 MP (1 Energy) for normal attacks
    if (playerMp < 6) return;
    setPlayerMp((prev) => prev - 6);
    const actionName = playerStats.classType === CharacterClass.WARRIOR ? '誓约斩' : '普通挥击';
    executeCombatAction(1.0, actionName, 'slash');
  };

  // Skill Activations
  const handleCastSkill = (skillIndex: number) => {
    if (isCombatFinished || !isPlayerTurn) return;

    // Cooldown Validation Gate
    if (skillIndex === 1 && skill1Cooldown > 0) return;
    if (skillIndex === 2 && skill2Cooldown > 0) return;

    // MP Refund talent check (t_mp)
    const triggerRefund = activatedTalents.includes('t_mp') && Math.random() < 0.25;

    if (playerStats.classType === CharacterClass.WARRIOR) {
      if (skillIndex === 1) {
        // Skill 2: 铁壁 (6 MP) / Upgraded for Paladin/Berserker
        if (playerMp < 6) return;
        setSkill1Cooldown(2); // 2 turn cooldown
        setPlayerMp((prev) => prev - (triggerRefund ? 2 : 6));
        
        const isPaladin = playerStats.ascendedClass === '圣骑士';
        const isBerserker = playerStats.ascendedClass === '破灭狂战';

        if (isBerserker) {
          // Berserker sacrifice life for high rage focus
          setPlayerHp((prev) => Math.max(4, prev - 10));
          setPlayerMp((prev) => Math.min(playerStats.maxMp, prev + 18));
          setCritMultiplier(2.5); // high rage critical potential!
          createSkillEffect('slash', 'player');
          triggerDamagePopup("残齿吼! 🩸", 22, 50, '#ef4444');
          addLog(`🩸 施展【残齿怒吼】：献祭自身 10 点生命，瞬间气荡胸腔恢复 18 点法力（+3能量），并爆发 2.5 倍暴虐战意！`, 'info');
          sfx.playCrit();
          return;
        }

        let bonusDef = isPaladin ? 8 : 5;
        let bonusShield = isPaladin ? 35 : 15;
        if (activatedTalents.includes('t_special')) {
          bonusDef += 3;
          bonusShield += 10;
          setPlayerHp((prev) => Math.min(playerStats.maxHp, prev + 5));
          triggerDamagePopup("+5 HP 💚", 22, 50, '#22c55e');
          addLog(`🛡️ 极意【神圣永定】觉醒：护体气墙坚固，额外增幅防御，并直接治愈自我 +5 点生命值！`, 'player-heal');
        }

        if (isPaladin) {
          setPlayerHp((prev) => Math.min(playerStats.maxHp, prev + 15));
          triggerDamagePopup("+15 HP✨", 22, 42, '#22c55e');
          createSkillEffect('holy', 'player');
          addLog(`✨ 【圣光护壁】触发：圣辉漫落，额外恢复 15 点生命值且抵御力剧增！`, 'player-heal');
          sfx.playHeal();
        } else {
          createSkillEffect('shield', 'player');
          sfx.playBlock();
        }

        setTempDef(playerStats.def + bonusDef);
        setTempShield((prev) => prev + bonusShield);
        triggerDamagePopup("+防 🛡️", 22, 45, '#38bdf8');
        addLog(`🛡️ 施展【${isPaladin ? '圣光护壁' : '铁壁'}】：获得 ${bonusDef} 点临时防御并加载 ${bonusShield} 点圣法护甲盾！`, 'player-heal');
      } else if (skillIndex === 2) {
        // Skill 3: 圣光裁决 (12 MP) / Upgraded for Paladin/Berserker
        if (playerMp < 12) return;
        setSkill2Cooldown(3); // 3 turn cooldown
        setPlayerMp((prev) => prev - (triggerRefund ? 8 : 12));
        
        const isPaladin = playerStats.ascendedClass === '圣骑士';
        const isBerserker = playerStats.ascendedClass === '破灭狂战';

        if (isPaladin) {
          executeCombatAction(3.5, '圣华圣光耀审判', 'holy', 2, 0);
        } else if (isBerserker) {
          executeCombatAction(3.0, '碎颅破灭重斩', 'slash', 1, 2);
        } else {
          executeCombatAction(2.2, '圣光裁决', 'holy', 1, 0);
        }
      }
    } else if (playerStats.classType === CharacterClass.MAGE) {
      if (skillIndex === 1) {
        // Skill 2: 红莲火球 (12 MP) / Upgraded for Alchemist/Oracle
        if (playerMp < 12) return;
        setSkill1Cooldown(2); // 2 turn cooldown
        setPlayerMp((prev) => prev - (triggerRefund ? 8 : 12));
        
        const isAlchemist = playerStats.ascendedClass === '混沌炼金师';
        const isOracle = playerStats.ascendedClass === '寂灭圣言者';

        if (isAlchemist) {
          executeCombatAction(3.5, '混沌炽炼爆弹', 'fireball', 1, 0);
        } else if (isOracle) {
          executeCombatAction(3.2, '寂灭星落神咒', 'holy', 0, 2);
        } else {
          executeCombatAction(2.0, '红莲火球', 'fireball', 0, 0);
        }
      } else if (skillIndex === 2) {
        // Skill 3: 奥术护盾 (18 MP) / Upgraded for Alchemist/Oracle
        if (playerMp < 18) return;
        setSkill2Cooldown(3); // 3 turn cooldown
        setPlayerMp((prev) => prev - (triggerRefund ? 14 : 18));
        
        const isAlchemist = playerStats.ascendedClass === '混沌炼金师';
        const isOracle = playerStats.ascendedClass === '寂灭圣言者';

        let shieldVal = 50;
        if (isAlchemist) {
          shieldVal = 85;
          setPlayerMp((prev) => Math.min(playerStats.maxMp, prev + 15));
          createSkillEffect('fireball', 'player');
          triggerDamagePopup("+15 MP 💎", 22, 42, '#38bdf8');
          addLog(`🔮 【贤者炼金壁】共鸣：凝聚质能屏障获得 85 点钢甲，逆向速提 15 点魔力！`, 'player-heal');
        } else if (isOracle) {
          shieldVal = 75;
          setPlayerHp((prev) => Math.min(playerStats.maxHp, prev + 30));
          createSkillEffect('holy', 'player');
          triggerDamagePopup("+30 HP 💚", 22, 45, '#22c55e');
          addLog(`✨ 【天体星璇盾】星轨运转：构筑 75 点护层并瞬息治愈全身 30 点生命值！`, 'player-heal');
        } else {
          createSkillEffect('arcane', 'player');
        }

        setTempShield((prev) => prev + shieldVal);
        triggerDamagePopup(`+${shieldVal} 🛡️`, 22, 45, '#38bdf8');
        addLog(`🔮 启动防御结界！【${isAlchemist ? '贤者炼金壁' : isOracle ? '天体星璇盾' : '奥术护盾'}】已生成 ${shieldVal} 点伤害承受屏障。`, 'player-heal');
        sfx.playBlock();
      }
    } else if (playerStats.classType === CharacterClass.ROGUE) {
      if (skillIndex === 1) {
        // Skill 2: 匿迹伏击 (6 MP) / Upgraded for Venom Weaver/Shadow Dancer
        if (playerMp < 6) return;
        setSkill1Cooldown(2); // 2 turn cooldown
        setPlayerMp((prev) => prev - (triggerRefund ? 2 : 6));
        
        const isVenom = playerStats.ascendedClass === '织网毒杀者';
        const isShadow = playerStats.ascendedClass === '神速影舞';

        if (isVenom) {
          setCritMultiplier(3.0);
          createSkillEffect('poison', 'player');
          triggerDamagePopup("剧毒蛊刃! 🧪", 22, 45, '#22c55e');
          addLog(`🌫️ 浸润蛊神之血施展【死神蛊针】：全身涂毒激发极致，刺刀斩爆将获得高达 3.0 倍剧毒伤害！`, 'info');
        } else if (isShadow) {
          setCritMultiplier(3.0);
          setTempShield((prev) => prev + 30);
          createSkillEffect('shadow', 'player');
          triggerDamagePopup("+30影障 🛡️", 22, 45, '#a855f7');
          addLog(`🌫️ 翩若惊鸿施展【极速瞬影】：潜入重影获得 3.0 暴创，并掠影拖出 30 点奥盾障壁！`, 'info');
        } else {
          setCritMultiplier(2.5);
          createSkillEffect('shadow', 'player');
          triggerDamagePopup("匿影 ⚡", 22, 45, '#f59e0b');
          addLog(`🌫️ 遁入虚空，施展【匿迹伏击】：下一击物理刀斩将获得 2.5 倍致命伤害倍率！`, 'info');
        }
        sfx.playMagic();
      } else if (skillIndex === 2) {
        // Skill 3: 致残剧毒 (12 MP) / Upgraded for Venom Weaver/Shadow Dancer
        if (playerMp < 12) return;
        setSkill2Cooldown(3); // 3 turn cooldown
        setPlayerMp((prev) => prev - (triggerRefund ? 8 : 12));
        
        const isVenom = playerStats.ascendedClass === '织网毒杀者';
        const isShadow = playerStats.ascendedClass === '神速影舞';

        if (isVenom) {
          executeCombatAction(2.5, '蛊毒万炼爆', 'poison', 0, 3);
        } else if (isShadow) {
          executeCombatAction(2.8, '千影乱舞杀', 'slash', 1, 2);
        } else {
          executeCombatAction(1.5, '致残剧毒', 'poison', 0, 2);
        }
      }
    }

    if (triggerRefund) {
      setTimeout(() => {
        triggerDamagePopup("+4 MP 💎", 22, 42, '#38bdf8');
        addLog(`💎 命印【法咒神核】共鸣：星芒神力回流，直接免除 4 点 MP 的魔法消耗！`, 'player-heal');
      }, 350);
    }
  };

  // Drink healing Potion during combat
  const handleDrinkPotion = (potion: Item) => {
    if (isCombatFinished || !isPlayerTurn) return;
    
    // Check if tactical combat gadgets are used
    if (potion.id === 'g_void_scroll') {
      onUsePotion(potion.id);
      sfx.playMagic();
      setTempShield((prev) => prev + 60);
      triggerDamagePopup("+60 奥盾 🛡️", 22, 45, '#38bdf8');
      addLog(`🔮 你捏碎并激活了【虚无法卷】！奥术屏障狂暴生成，瞬间构筑获得 +60 点虚无临时圣金护甲屏障！`, 'player-heal');
      return;
    }

    if (potion.id === 'g_frost_bomb') {
      onUsePotion(potion.id);
      sfx.playCrit();
      triggerFlashScreen();
      setEnemyStunnedTurns(2); // Stuns enemy for 1 entire round + break armor
      triggerDamagePopup("冻结破防! ❄️", 76, 45, '#38bdf8');
      addLog(`❄️ 你对魔物投掷了【寒冰结界弹】！使敌人冻结破防 2 回合，无法行动且护甲失效！`, 'player-attack');
      return;
    }

    // Default healing potions
    onUsePotion(potion.id);
    let healAmt = 30;
    let mpRest = 0;
    if (potion.id === 's_pot_2') {
      healAmt = 60;
      mpRest = 40;
    } else if (potion.id === 's_pot_3') {
      healAmt = playerStats.maxHp;
      mpRest = playerStats.maxMp;
    }
    
    setPlayerHp((prev) => Math.min(playerStats.maxHp + (potion.id === 's_pot_3' ? 5 : 0), prev + healAmt));
    if (mpRest > 0) {
      setPlayerMp((prev) => Math.min(playerStats.maxMp, prev + mpRest));
    }
    
    sfx.playHeal();
    addLog(`🧪 你饮下了恢复物【${potion.name}】，瞬间调节气血，抚平伤痛！`, 'player-heal');
  };

  // Generate immersive retro card deck dynamically based on character stats and class
  const getSkillCards = (): SkillCardData[] => {
    const isBerserker = playerStats.ascendedClass === '破灭狂战';
    const isPaladin = playerStats.ascendedClass === '圣骑士';
    const isAlchemist = playerStats.ascendedClass === '混沌炼金师';
    const isOracle = playerStats.ascendedClass === '寂灭圣言者';
    const isVenom = playerStats.ascendedClass === '织网毒杀者';
    const isShadow = playerStats.ascendedClass === '神速影舞';

    // 1. DEFINE CLASS BASIC ATTACK CARD
    const basicCard: SkillCardData = {
      id: 'btn_battle_use_atk',
      name: isBerserker ? '狂暴怒斩' : playerStats.classType === CharacterClass.WARRIOR ? '誓约斩' : '普通攻击',
      mpCost: 6, // 1 Energy for all classes
      cooldown: 0,
      maxCooldown: 0,
      description: isBerserker 
        ? '【狂愿本能】狂战挥劈！造成 1.4 倍爆裂真实伤害并吸取 15% 伤害为体能，生命恢复（消耗 1 能量）。'
        : playerStats.classType === CharacterClass.WARRIOR 
          ? '誓愿重击！施展誓刀冲破，对目标爆发物理伤害（消耗 1 能量）。'
          : '运用手中武器对眼前的魔物发起普通挥砍斩击，造成物理基础伤害（消耗 1 能量）。',
      icon: <Sword className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-amber-400" />,
      colorClasses: isBerserker 
        ? 'border-red-900/80 hover:border-red-500 bg-gradient-to-b from-stone-900 to-red-950/30 text-red-100 shadow-[0_8px_25px_rgba(239,68,68,0.2)]'
        : 'border-zinc-700 hover:border-amber-500 bg-gradient-to-b from-stone-900 to-stone-950/45 text-amber-100 shadow-[0_8px_20px_rgba(0,0,0,0.4)]',
      iconContainerClass: isBerserker
        ? 'bg-red-950 border-red-800 text-red-400 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]'
        : 'bg-stone-850 border-stone-700 text-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      action: handleBasicAttack
    };

    // 2. DEFINE CLASS ACTIVE SKILL 1
    const classSkill1: SkillCardData = playerStats.classType === CharacterClass.WARRIOR ? {
      id: 'btn_class_skill_1',
      name: isPaladin ? '圣光护壁' : isBerserker ? '残齿怒吼' : '铁壁',
      mpCost: 6,
      cooldown: skill1Cooldown,
      maxCooldown: 2,
      description: isPaladin 
        ? '【圣耀神术】神盾叠固！获得 +8 防御临时增加，提供 +35 护甲屏障并立刻治愈 15 HP！'
        : isBerserker 
          ? '【嗜血怒震】献祭自我 10 HP，气海重震，瞬间恢复 +18 MP 并叠加 2.5 倍愤怒暴创战意！'
          : '金石重御！瞬间加固坚不可摧的绝壁，获得 5 点物理防御并生成奥术护膜。',
      icon: <ShieldAlert className={isPaladin ? "text-yellow-400 w-4.5 h-4.5 md:w-5.5 md:h-5.5" : isBerserker ? "text-red-400 w-4.5 h-4.5 md:w-5.5 md:h-5.5" : "text-sky-400 w-4.5 h-4.5 md:w-5.5 md:h-5.5"} />,
      colorClasses: isPaladin 
        ? 'border-yellow-900/60 hover:border-yellow-400 bg-gradient-to-b from-stone-900 to-yellow-950/20 text-yellow-101 shadow-[0_8px_20px_rgba(234,179,8,0.2)] font-serif'
        : isBerserker 
          ? 'border-red-900/60 hover:border-red-500 bg-gradient-to-b from-stone-900 to-red-950/25 text-red-101 shadow-[0_8px_20px_rgba(239,68,68,0.25)]'
          : 'border-sky-900/60 hover:border-sky-400 bg-gradient-to-b from-stone-900 to-sky-950/20 text-sky-101 shadow-[0_8px_20px_rgba(14,165,233,0.15)]',
      iconContainerClass: isPaladin 
        ? 'bg-yellow-950/40 border-yellow-850 text-yellow-400 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.35)]'
        : isBerserker 
          ? 'bg-red-950/40 border-red-800 text-red-400 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.45)]'
          : 'bg-sky-950/40 border-sky-800/40 text-sky-400 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.35)]',
      action: () => handleCastSkill(1)
    } : playerStats.classType === CharacterClass.MAGE ? {
      id: 'btn_class_skill_1',
      name: isAlchemist ? '混沌炽爆' : isOracle ? '星落寂灭' : '红莲火球',
      mpCost: 12,
      cooldown: skill1Cooldown,
      maxCooldown: 2,
      description: isAlchemist 
        ? '【元素异变】炸裂激荡！投掷混沌炼金爆弹，造成暴烈 3.5 倍致命魔法轰击，并致晕其 1 轮！'
        : isOracle 
          ? '【陨星唤灭】极光落陨！星光碎片砸陷，对魔物爆发 3.2 倍魔法神效并侵吞致盲 2 轮！'
          : '吟唱狂暴的爆烈炎能红莲投向对手，引发震耳大爆炸造成 2.0 倍致命魔法炎能轰击。',
      icon: <Flame className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-orange-400" />,
      colorClasses: isAlchemist 
        ? 'border-emerald-900/60 hover:border-emerald-400 bg-gradient-to-b from-stone-900 to-emerald-950/20 text-emerald-100 shadow-[0_8px_20px_rgba(16,185,129,0.25)]'
        : isOracle 
          ? 'border-indigo-900/60 hover:border-indigo-400 bg-gradient-to-b from-stone-900 to-indigo-950/20 text-indigo-100 shadow-[0_8px_20px_rgba(99,102,241,0.2)]'
          : 'border-orange-900/60 hover:border-orange-400 bg-gradient-to-b from-stone-900 to-orange-950/20 text-orange-100 shadow-[0_8px_20px_rgba(249,115,22,0.15)]',
      iconContainerClass: isAlchemist 
        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.35)]'
        : isOracle 
          ? 'bg-indigo-950/40 border-indigo-800 text-indigo-400 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.35)]'
          : 'bg-orange-950/40 border-orange-800/40 text-orange-400 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.35)]',
      action: () => handleCastSkill(1)
    } : {
      id: 'btn_class_skill_1',
      name: isVenom ? '死神蛊针' : isShadow ? '极速瞬影' : '匿迹伏击',
      mpCost: 6,
      cooldown: skill1Cooldown,
      maxCooldown: 2,
      description: isVenom 
        ? '【百炼蛊神】毒浆涂刃！激发极致剧毒命引，使接下来任意斩击享有高达 3.0 倍暴创伤害！'
        : isShadow 
          ? '【破空闪掠】影落瞬杀！获得巨大的 3.0 倍爆击破防系数，并在身后瞬曳凝聚 30 点残影奥能护膜！'
          : '隐入尘俗暗影，潜行激发致命刀锋，使下一回合的挥斩利刃斩杀享有巨大的 2.5 倍暴伤伤害。',
      icon: <Compass className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-indigo-400" />,
      colorClasses: isVenom 
        ? 'border-emerald-900/60 hover:border-emerald-400 bg-gradient-to-b from-stone-900 to-emerald-950/20 text-emerald-100 shadow-[0_8px_20px_rgba(16,185,129,0.25)]'
        : isShadow 
          ? 'border-purple-900/60 hover:border-purple-400 bg-gradient-to-b from-stone-900 to-purple-950/20 text-purple-100 shadow-[0_8px_20px_rgba(168,85,247,0.25)]'
          : 'border-indigo-900/60 hover:border-indigo-400 bg-gradient-to-b from-stone-900 to-indigo-950/20 text-indigo-100 shadow-[0_8px_20px_rgba(99,102,241,0.15)]',
      iconContainerClass: isVenom 
        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.35)]'
        : isShadow 
          ? 'bg-purple-950/40 border-purple-800 text-purple-400 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.35)]'
          : 'bg-indigo-950/40 border-indigo-800/40 text-indigo-400 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.35)]',
      action: () => handleCastSkill(1)
    };

    // 3. DEFINE CLASS ACTIVE SKILL 2
    const classSkill2: SkillCardData = playerStats.classType === CharacterClass.WARRIOR ? {
      id: 'btn_class_skill_2',
      name: isPaladin ? '圣华制裁' : isBerserker ? '破灭风暴' : '圣光裁决',
      mpCost: 12,
      cooldown: skill2Cooldown,
      maxCooldown: 3,
      description: isPaladin 
        ? '【高阶审判】神言制裁！唤回天尊雷罚惩击对手，造成 3.5 倍光辉裁决并致其强眩晕 2 轮！'
        : isBerserker 
          ? '【极碎震重击】造成极其狂乱的 3.0 倍撕裂重击，眩晕 1 轮且双倍破甲降防 2 轮！'
          : '天界重光！呼召神圣权杖审判魔障，造成 2.2 倍物理打击并致其眩晕 1 轮。',
      icon: <Sparkles className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-purple-400" />,
      colorClasses: isPaladin 
        ? 'border-yellow-705 hover:border-yellow-400 bg-gradient-to-b from-stone-900 to-yellow-950/20 text-yellow-101 shadow-[0_8px_20px_rgba(234,179,8,0.25)]'
        : isBerserker 
          ? 'border-red-650/60 hover:border-red-400 bg-gradient-to-b from-stone-900 to-red-950/20 text-red-101 shadow-[0_8px_20px_rgba(239,68,68,0.3)]'
          : 'border-purple-900/60 hover:border-purple-400 bg-gradient-to-b from-stone-900 to-purple-950/20 text-purple-101 shadow-[0_8px_20px_rgba(168,85,247,0.15)]',
      iconContainerClass: isPaladin 
        ? 'bg-yellow-950/40 border-yellow-800 text-yellow-400 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.45)]'
        : isBerserker 
          ? 'bg-red-950/40 border-red-800 text-red-400 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.45)]'
          : 'bg-purple-950/40 border-purple-800 text-purple-400 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.35)]',
      action: () => handleCastSkill(2)
    } : playerStats.classType === CharacterClass.MAGE ? {
      id: 'btn_class_skill_2',
      name: isAlchemist ? '贤者炼金壁' : isOracle ? '天体星璇盾' : '奥术护盾',
      mpCost: 18,
      cooldown: skill2Cooldown,
      maxCooldown: 3,
      description: isAlchemist 
        ? '【质能守恒】虚金熔铁！构筑 85 点高额钢能御盾，且反向熔炼恢复自己 15 点魔法值！'
        : isOracle 
          ? '【至高星盾】星轨永寂！编组 75 点临时奥能盾，并在神光映透下瞬间超效治愈 30 生命值！'
          : '凭空塑构奥之粒子，凝聚远古奥术圣辉，立刻为己身形成 50 点承受伤害的虚实法术结界。',
      icon: <Zap className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-blue-400" />,
      colorClasses: isAlchemist 
        ? 'border-emerald-900/60 hover:border-emerald-400 bg-gradient-to-b from-stone-900 to-emerald-950/20 text-emerald-100 shadow-[0_8px_20px_rgba(16,185,129,0.25)]'
        : isOracle 
          ? 'border-indigo-900/60 hover:border-indigo-400 bg-gradient-to-b from-stone-900 to-indigo-950/20 text-indigo-100 shadow-[0_8px_20px_rgba(99,102,241,0.2)]'
          : 'border-blue-900/60 hover:border-blue-400 bg-gradient-to-b from-stone-900 to-blue-950/20 text-blue-101 shadow-[0_8px_20px_rgba(59,130,246,0.15)]',
      iconContainerClass: isAlchemist 
        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.35)]'
        : isOracle 
          ? 'bg-indigo-950/40 border-indigo-800 text-indigo-400 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.35)]'
          : 'bg-blue-950/40 border-blue-800/40 text-blue-400 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.35)]',
      action: () => handleCastSkill(2)
    } : {
      id: 'btn_class_skill_2',
      name: isVenom ? '蛊毒万炼爆' : isShadow ? '千影乱舞杀' : '致残剧毒',
      mpCost: 12,
      cooldown: skill2Cooldown,
      maxCooldown: 3,
      description: isVenom 
        ? '【万劫蛊沸】疯狂引爆！投射剧毒法弹斩击，造成 2.5 倍剧毒伤害，导致其气脉虚弱 3 轮输出暴降！'
        : isShadow 
          ? '【瞬杀斩击】残影纷飞！拉出漫天利爪千段破袭，造成 2.8 倍物理割裂，眩晕 1 轮并虚弱 2 轮！'
          : '在刺毒上施敷腐尸致残毒，穿刺造成 1.5 倍剧毒伤害，导致其气脉虚弱二回合，伤害输出降 30%。',
      icon: <Activity className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-teal-400" />,
      colorClasses: isVenom 
        ? 'border-emerald-900/60 hover:border-emerald-400 bg-gradient-to-b from-stone-900 to-emerald-950/20 text-emerald-100 shadow-[0_8px_20px_rgba(16,185,129,0.25)]'
        : isShadow 
          ? 'border-purple-900/60 hover:border-purple-400 bg-gradient-to-b from-stone-900 to-purple-950/20 text-purple-100 shadow-[0_8px_20px_rgba(168,85,247,0.25)]'
          : 'border-indigo-900/60 hover:border-indigo-400 bg-gradient-to-b from-stone-900 to-indigo-950/20 text-indigo-100 shadow-[0_8px_20px_rgba(99,102,241,0.15)]',
      iconContainerClass: isVenom 
        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.35)]'
        : isShadow 
          ? 'bg-purple-950/40 border-purple-800 text-purple-400 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.35)]'
          : 'bg-indigo-950/40 border-indigo-800/40 text-indigo-400 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.35)]',
      action: () => handleCastSkill(2)
    };

    const allCustomCards: Record<string, SkillCardData> = {
      // Condition-Triggered Card 1: 「圣印反蚀」
      btn_card_sigil_backblow: {
        id: 'btn_card_sigil_backblow',
        name: '圣印反蚀',
        mpCost: 6,
        cooldown: customCardCooldowns['btn_card_sigil_backblow'] || 0,
        maxCooldown: 2,
        description: '【圣印反蚀 · 条件触发】若你目前拥有物理或魔法盾，引爆护罩能级对敌人爆发 2.5倍 的极限输出物伤；否则仅造成 0.8倍 的普通劈砍。',
        icon: <ShieldAlert className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-yellow-405" />,
        colorClasses: 'border-yellow-905 hover:border-yellow-405 bg-gradient-to-b from-stone-900 to-yellow-950/25 text-yellow-105 shadow-[0_8px_20px_rgba(234,179,8,0.2)]',
        iconContainerClass: 'bg-yellow-950/45 border-yellow-800 text-yellow-405 group-hover:shadow-[0_0_12px_rgba(234,179,8,0.3)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 6) return;
          const hasShield = tempShield > 0;
          const dmgFactor = hasShield ? 2.5 : 0.8;
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_sigil_backblow: 2 }));
          setPlayerMp((prev) => prev - 6);
          setLastCastWasDefensive(hasShield);
          executeCombatAction(dmgFactor, '圣印反蚀', 'slash');
          if (hasShield) {
            addLog(`🛡️ 【圣印反蚀】触发！引爆厚实护盾冲击对敌人造成 ${dmgFactor} 倍冲击敌躯！`, 'player-attack');
          } else {
            addLog(`🛡️ 【圣印反蚀】触发：未检测到体表护盾，仅能造成微弱的 ${dmgFactor} 倍挥砍伤害。`, 'info');
          }
        }
      },
      // Condition-Triggered Card 2: 「破败斩杀」
      btn_card_ruined_exec: {
        id: 'btn_card_ruined_exec',
        name: '破败斩杀',
        mpCost: 8,
        cooldown: customCardCooldowns['btn_card_ruined_exec'] || 0,
        maxCooldown: 2,
        description: '【破败斩杀 · 条件触发/斩杀】若惊变魔物生命值低于 40% HP 绝命占比，爆发招魂怒鸣 3.5倍 伤害并震眩 1 轮！否则仅为 1.2倍 斩痕伤害。',
        icon: <Skull className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-purple-400" />,
        colorClasses: 'border-purple-900/60 hover:border-purple-405 bg-gradient-to-b from-stone-900 to-purple-950/25 text-purple-105 shadow-[0_8px_20px_rgba(168,85,247,0.2)]',
        iconContainerClass: 'bg-purple-950/45 border-purple-800 text-purple-400 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.3)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 8) return;
          const enemyRatio = enemyHp / enemy.maxHp;
          const lowHp = enemyRatio < 0.45;
          const dmgFactor = lowHp ? 3.5 : 1.2;
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_ruined_exec: 2 }));
          setPlayerMp((prev) => prev - 8);
          setLastCastWasDefensive(false);
          executeCombatAction(dmgFactor, '破败斩杀', 'slash', lowHp ? 1 : 0);
          addLog(`💀 【破败斩杀】惊天炸裂！敌人剩余气血占比 ${(enemyRatio * 100).toFixed(0)}%。爆发出 ${dmgFactor} 倍重创！${lowHp ? '目标重伤强制眩晕 1 轮！' : ''}`, 'player-attack');
        }
      },
      // Card Linkage Card 1: 「虚绽合击」
      btn_card_vulnerable_link: {
        id: 'btn_card_vulnerable_link',
        name: '虚绽合击',
        mpCost: 10,
        cooldown: customCardCooldowns['btn_card_vulnerable_link'] || 0,
        maxCooldown: 3,
        description: '【虚绽合击 · 联动】撕裂灵穴。造成 1.5倍 魔法挥击，并使你所有其他战术卡牌卡（铁壁/红莲等技能）的冷却 CD 立刻缩短 1 轮！',
        icon: <Sparkles className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-indigo-400 animate-pulse" />,
        colorClasses: 'border-indigo-900/60 hover:border-indigo-405 bg-gradient-to-b from-stone-900 to-indigo-950/25 text-indigo-105 shadow-[0_8px_20px_rgba(99,102,241,0.2)]',
        iconContainerClass: 'bg-indigo-950/45 border-indigo-800 text-indigo-400 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.3)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 10) return;
          
          setCustomCardCooldowns(prev => {
            const next = { ...prev };
            next['btn_card_vulnerable_link'] = 3;
            for (const key in next) {
              if (key !== 'btn_card_vulnerable_link') {
                next[key] = Math.max(0, next[key] - 1);
              }
            }
            return next;
          });
          setSkill1Cooldown((prev) => Math.max(0, prev - 1));
          setSkill2Cooldown((prev) => Math.max(0, prev - 1));
          
          setPlayerMp((prev) => prev - 10);
          setLastCastWasDefensive(false);
          executeCombatAction(1.5, '虚绽合击', 'slash');
          addLog(`🔮 【虚绽合击】触发：造成 1.5 倍合击伤害，并共振缩短其他所有战技 1 轮的冷却 CD！`, 'player-heal');
        }
      },
      // Card Linkage Card 2: 「神圣律令」
      btn_card_holy_decree: {
        id: 'btn_card_holy_decree',
        name: '神圣律令',
        mpCost: 12,
        cooldown: customCardCooldowns['btn_card_holy_decree'] || 0,
        maxCooldown: 3,
        description: '【神圣律令 · 联动】言灵加身。直接凝铸 30 点临时守护奥能盾，并神明启慧，使你的下一击任意劈砍享有暴烈的 2.5倍 全能暴击率！',
        icon: <Crown className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-amber-300 animate-pulse" />,
        colorClasses: 'border-amber-900/60 hover:border-amber-450 bg-gradient-to-b from-stone-900 to-amber-950/25 text-amber-105 shadow-[0_8px_20px_rgba(245,158,11,0.2)]',
        iconContainerClass: 'bg-amber-950/45 border-amber-800 text-amber-400 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.3)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 12) return;
          
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_holy_decree: 3 }));
          setPlayerMp((prev) => prev - 12);
          addPlayerShield(30);
          setCritMultiplier(2.5); // set next damage multipliers high!
          setLastCastWasDefensive(true);
          createSkillEffect('holy', 'player');
          triggerDamagePopup("+30 🛡️", 22, 45, '#38bdf8');
          addLog(`✨ 【神圣律令】：口衔天宪！构筑 30 点临时守护结界，并将你下一次爆发倍率拉升至 2.5倍 爆烈战胜状态！`, 'player-heal');
          sfx.playMagic();
        }
      },
      // Resource Conversion Card 1: 「血能炼制」
      btn_card_blood_refinery: {
        id: 'btn_card_blood_refinery',
        name: '血能炼制',
        mpCost: 0,
        cooldown: customCardCooldowns['btn_card_blood_refinery'] || 0,
        maxCooldown: 1,
        description: '【血能炼制 · 资源转换】逆血精炼。牺牲自己的 15 点生命 HP 发起血沸，淬火回复 25 点法力 MP（回复4能量）！',
        icon: <Activity className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-rose-500 animate-fade-in" />,
        colorClasses: 'border-red-900/60 hover:border-red-505 bg-gradient-to-b from-stone-900 to-red-950/30 text-red-105 shadow-[0_8px_20px_rgba(239,68,68,0.25)]',
        iconContainerClass: 'bg-red-950/45 border-red-800 text-red-400 group-hover:shadow-[0_0_12px_rgba(239,68,68,0.4)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerHp <= 15) {
            addLog(`❌ 你当前的血量仅剩 ${playerHp} HP，若继续榨取【血能炼制】体骸将直接虚脱暴毙！`, 'info');
            return;
          }
          
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_blood_refinery: 1 }));
          setPlayerHp(prev => Math.max(1, prev - 15));
          setPlayerMp(prev => Math.min(playerStats.maxMp, prev + 25));
          setLastCastWasDefensive(false);
          createSkillEffect('fireball', 'player');
          triggerDamagePopup("-15 HP 🩸", 22, 50, '#ef4444');
          setTimeout(() => {
            triggerDamagePopup("+25 MP 💎", 22, 42, '#38bdf8');
          }, 200);
          addLog(`🩸 【血能炼制】血脉翻涌：以 15 点生命 HP 换提自身全能灵脉，瞬间恢复了 25 点 MP 法力！`, 'player-heal');
          sfx.playCrit();
        }
      },
      // Resource Conversion Card 2: 「气源圣盾」
      btn_card_spiritual_shield: {
        id: 'btn_card_spiritual_shield',
        name: '气源圣盾',
        mpCost: 0,
        cooldown: customCardCooldowns['btn_card_spiritual_shield'] || 0,
        maxCooldown: 2,
        description: '【气源圣盾 · 资源转换】极气铸甲。散排空自身剩余的所有法力 MP（至少 15点 ），每 1 点法力极效固化为体表 3 点高阶守护甲！',
        icon: <Zap className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-cyan-400 animate-bounce" />,
        colorClasses: 'border-cyan-900/60 hover:border-cyan-405 bg-gradient-to-b from-stone-900 to-cyan-950/20 text-cyan-105 shadow-[0_8px_20px_rgba(6,182,212,0.15)]',
        iconContainerClass: 'bg-cyan-950/45 border-cyan-800 text-cyan-405 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 15) {
            addLog(`❌ 你的蓝量不足（少于 15 MP），无法凝聚铸起【气源圣盾】！`, 'info');
            return;
          }
          
          const consumed = playerMp;
          const shieldGranted = consumed * 3;
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_spiritual_shield: 2 }));
          setPlayerMp(0);
          addPlayerShield(shieldGranted);
          setLastCastWasDefensive(true);
          createSkillEffect('shield', 'player');
          triggerDamagePopup(`+${shieldGranted} 🛡️`, 22, 45, '#38bdf8');
          addLog(`🔮 【气源圣盾】凝聚：清空全身当前 ${consumed} 点魔法 MP，在周身固顶铸起 ${shieldGranted} 点临时绝刚圣盾！`, 'player-heal');
          sfx.playBlock();
        }
      },
      // Double-Edged Sword Card 1: 「同归于尽」
      btn_card_mutual_destruct: {
        id: 'btn_card_mutual_destruct',
        name: '同归于尽',
        mpCost: 8,
        cooldown: customCardCooldowns['btn_card_mutual_destruct'] || 0,
        maxCooldown: 2,
        description: '【同归于尽 · 双刃剑】心决自毁。对敌人爆发碎裂天穹般的 4.0倍 极限物伤，但内震也将折碎反弹自身该基础数值 25% 的毁灭真实法伤！',
        icon: <Flame className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-rose-500 animate-pulse" />,
        colorClasses: 'border-red-900/60 hover:border-red-405 bg-gradient-to-b from-stone-950 to-red-950/40 text-rose-101 shadow-[0_8px_25px_rgba(239,68,68,0.35)]',
        iconContainerClass: 'bg-red-950/45 border-red-800 text-rose-405 group-hover:shadow-[0_0_12px_rgba(239,68,68,0.4)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 8) return;
          
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_mutual_destruct: 2 }));
          setPlayerMp((prev) => prev - 8);
          setLastCastWasDefensive(false);
          executeCombatAction(4.0, '同归于尽', 'slash');
          
          const backlash = Math.round(((playerStats.atk + doubleEdgedAtkStacks * 12) * 4.0) * 0.25);
          setTimeout(() => {
            setPlayerHp(prev => Math.max(1, prev - backlash));
            triggerDamagePopup(`-${backlash} 🩸`, 22, 50, '#ef4444');
            addLog(`⚡ 【同归于尽】爆发：自毁经脉对魔物施以碎裂打击，但内震反震自身，你流失了 ${backlash} 点体力 HP！`, 'info');
          }, 300);
        }
      },
      // Condition-Triggered Card 3: 「不破不立」
      btn_card_ascension_retrib: {
        id: 'btn_card_ascension_retrib',
        name: '不破不立',
        mpCost: 12,
        cooldown: customCardCooldowns['btn_card_ascension_retrib'] || 0,
        maxCooldown: 3,
        description: '【不破不立 · 条件触发】当且仅当自身血气衰败至濒死状态（HP 低于 30% ）才可引灵触发，回复 +50 生命并暴加 50点 不破圣金铠！',
        icon: <Sparkles className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-lime-400" />,
        colorClasses: 'border-lime-900/60 hover:border-lime-405 bg-gradient-to-b from-stone-900 to-lime-950/25 text-lime-105 shadow-[0_8px_20px_rgba(132,204,22,0.2)]',
        iconContainerClass: 'bg-lime-950/45 border-lime-800 text-lime-405 group-hover:shadow-[0_0_12px_rgba(132,204,22,0.3)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 12) return;
          
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_ascension_retrib: 3 }));
          setPlayerMp((prev) => prev - 12);
          
          const isLowHp = playerHp < (playerStats.maxHp * 0.3);
          setLastCastWasDefensive(isLowHp);
          if (isLowHp) {
            setPlayerHp(prev => Math.min(playerStats.maxHp, prev + 50));
            addPlayerShield(50);
            createSkillEffect('holy', 'player');
            triggerDamagePopup("+50 HP 💚", 22, 40, '#22c55e');
            triggerDamagePopup("+50 🛡️", 22, 48, '#38bdf8');
            addLog(`✨ 【不破不立】绝地唤誓触发！立刻重获生命的滋补 +50 HP 还有 50 点御守结界！`, 'player-heal');
            sfx.playHeal();
          } else {
            createSkillEffect('holy', 'player');
            addLog(`✨ 【不破不立】涅槃沉寂：你体内血气饱满，功法未受濒死感知。直接空耗法力，不触发护甲治疗。`, 'info');
          }
        }
      },
      // Shield Defense Card 1: 「不动如山」
      btn_card_steadfast: {
        id: 'btn_card_steadfast',
        name: '不动如山',
        mpCost: 8,
        cooldown: customCardCooldowns['btn_card_steadfast'] || 0,
        maxCooldown: 2,
        description: '【不动如山 · 御守】圣耀坚躯。瞬间浇铸 +45 点超重型圣盾堡垒，磐石巍巍保护周身！',
        icon: <Shield className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-orange-400" />,
        colorClasses: 'border-orange-950/60 hover:border-orange-400 bg-gradient-to-b from-stone-900 to-orange-950/20 text-orange-100 shadow-[0_8px_20px_rgba(249,115,22,0.15)]',
        iconContainerClass: 'bg-orange-950/40 border-orange-800/40 text-orange-400 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.35)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 8) return;
          
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_steadfast: 2 }));
          setPlayerMp((prev) => prev - 8);
          addPlayerShield(45);
          setLastCastWasDefensive(true);
          createSkillEffect('shield', 'player');
          triggerDamagePopup("+45 🛡️", 22, 45, '#38bdf8');
          addLog(`🛡️ 【不动如山】：山崩于前而不变！在周身浇铸获得 +45 点超重型物理绝缘圣光护罩！`, 'player-heal');
          sfx.playBlock();
        }
      },
      // Double-Edged Sword Card 2: 「命轮狂赌」
      btn_card_fated_gamble: {
        id: 'btn_card_fated_gamble',
        name: '命轮狂赌',
        mpCost: 8,
        cooldown: customCardCooldowns['btn_card_fated_gamble'] || 0,
        maxCooldown: 2,
        description: '【命轮狂赌 · 双刃剑】赌命一搏！50% 概率触发大吉，对敌人爆发 5.0倍 极限斩击；若大凶，敌人享受到其 +20 HP 回复，而你自己流失 10 点生命！',
        icon: <Compass className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-yellow-400 rotate-12" />,
        colorClasses: 'border-amber-900/60 hover:border-amber-450 bg-gradient-to-b from-stone-900 to-amber-950/20 text-indigo-101 shadow-[0_8px_20px_rgba(245,158,11,0.25)]',
        iconContainerClass: 'bg-amber-950/45 border-amber-800 text-amber-400 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.35)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 8) return;
          
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_fated_gamble: 2 }));
          setPlayerMp((prev) => prev - 8);
          setLastCastWasDefensive(false);
          
          const rolledLucky = Math.random() < 0.50;
          if (rolledLucky) {
            executeCombatAction(5.0, '命轮狂赌', 'slash');
            addLog(`🎲 【命轮狂赌】大吉！命运齿轮金光璀璨，爆发出 5.0 倍神意碾压斩击！`, 'player-attack');
          } else {
            setEnemyHp(prev => Math.min(enemy.maxHp, prev + 20));
            setPlayerHp(prev => Math.max(1, prev - 10));
            triggerDamagePopup("+20💚", 76, 45, '#22c55e');
            triggerDamagePopup("-10 HP 🩸", 22, 50, '#ef4444');
            sfx.playHeal();
            addLog(`🎲 【命轮狂赌】大凶！功法发生逆流反噬，敌人大喜享用了其 +20 HP 回复，而你流失 10 点体力 HP！`, 'info');
          }
        }
      },
      //🪐 High Dimension Card 1: 「逆境反振」
      btn_card_limit_break: {
        id: 'btn_card_limit_break',
        name: '逆境反振',
        mpCost: 8,
        cooldown: customCardCooldowns['btn_card_limit_break'] || 0,
        maxCooldown: 3,
        description: '【逆境反振 · 条件触发】常规：造成 1.0倍 物理伤害。当主角当前 HP 低于 30% 时，效果跃迁为「极境怒震」：造成 3.5倍 爆裂物理伤害，并瞬间获得 45点 护盾格挡。',
        icon: <ShieldAlert className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-red-500" />,
        colorClasses: 'border-red-900/70 hover:border-red-400 bg-gradient-to-b from-stone-900 to-red-950/40 text-red-100 shadow-[0_8px_20px_rgba(239,68,68,0.25)]',
        iconContainerClass: 'bg-red-950/45 border-red-800 text-red-400 group-hover:shadow-[0_0_12px_rgba(239,68,68,0.35)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 8) return;
          const isLowHp = playerHp <= (playerStats.maxHp * 0.3);
          const dmgFactor = isLowHp ? 3.5 : 1.0;
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_limit_break: 3 }));
          setPlayerMp((prev) => prev - 8);
          setLastCastWasDefensive(isLowHp);
          
          if (isLowHp) {
            addPlayerShield(45);
            executeCombatAction(dmgFactor, '逆境反振', 'slash');
            addLog(`🪐 【逆境反振】极境唤裂！因你生命值濒危（低于30%），绝地打出 ${dmgFactor} 倍核子冲击，并获得固盾 45 点护防！`, 'player-attack');
          } else {
            executeCombatAction(dmgFactor, '逆境反振', 'slash');
            addLog(`🪐 【逆境反振】常规施展：你状态仍然充盈，技能造成普通的 ${dmgFactor} 倍斩伤。`, 'info');
          }
        }
      },
      //🪐 High Dimension Card 2: 「满盈洪流」
      btn_card_full_mp_surge: {
        id: 'btn_card_full_mp_surge',
        name: '满盈洪流',
        mpCost: 18,
        cooldown: customCardCooldowns['btn_card_full_mp_surge'] || 0,
        maxCooldown: 2,
        description: '【满盈洪流 · 条件触发】常规：造成 1.2倍 魔法伤害并致晕 1 轮。若施法时自身满魔（MP = 最大MP），效果跃迁为「灭世洪流」：造成极其恐怖的 4.0倍 魔法暴击并回复 9 MP（退减 50% 消耗）！',
        icon: <Sparkles className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-sky-400 animate-pulse" />,
        colorClasses: 'border-sky-900/60 hover:border-sky-450 bg-gradient-to-b from-stone-900 to-sky-950/30 text-sky-101 shadow-[0_8px_20px_rgba(56,189,248,0.25)]',
        iconContainerClass: 'bg-sky-950/45 border-sky-800 text-sky-350 group-hover:shadow-[0_0_12px_rgba(56,189,248,0.35)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 18) return;
          const isFullMp = playerMp >= playerStats.maxMp;
          const dmgFactor = isFullMp ? 4.0 : 1.2;
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_full_mp_surge: 2 }));
          setLastCastWasDefensive(false);

          if (isFullMp) {
            setPlayerMp((prev) => Math.min(playerStats.maxMp, prev - 18 + 9));
            executeCombatAction(dmgFactor, '满盈洪流', 'holy', 1);
            addLog(`🪐 【满盈洪流】触发「灭世洪流」暴冲！你在极致饱和精力点打出 ${dmgFactor} 倍天体法暴致颤击晕，并退回 9 点 MP 消耗！`, 'player-attack');
          } else {
            setPlayerMp((prev) => prev - 18);
            executeCombatAction(dmgFactor, '满盈洪流', 'holy', 1);
            addLog(`🪐 【满盈洪流】法力未至极端爆发：消耗 18 MP，对怪物造成普通的 ${dmgFactor} 倍法咒伤害并击虚眩晕 1 回合。`, 'info');
          }
        }
      },
      //🪐 High Dimension Card 3: 「铁画银钩」
      btn_card_shield_resonance: {
        id: 'btn_card_shield_resonance',
        name: '铁画银钩',
        mpCost: 10,
        cooldown: customCardCooldowns['btn_card_shield_resonance'] || 0,
        maxCooldown: 3,
        description: '【铁画银钩 · 联动机制】以意驭气！瞬间造成等同于你当前临时护盾 1.2倍（若无护盾，保底 0.8倍 的物理刺劈）的真实贯穿伤害。同时此后若你获得护盾，该盾值的 20% 将额外反噬震击敌人。',
        icon: <Activity className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-teal-400" />,
        colorClasses: 'border-teal-900/60 hover:border-teal-405 bg-gradient-to-b from-stone-900 to-teal-950/25 text-teal-100 shadow-[0_8px_20px_rgba(20,184,166,0.15)]',
        iconContainerClass: 'bg-teal-950/45 border-teal-800 text-teal-400 group-hover:shadow-[0_0_12px_rgba(20,184,166,0.25)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 10) return;
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_shield_resonance: 3 }));
          setPlayerMp((prev) => prev - 10);
          setLastCastWasDefensive(false);

          const dmgFactor = tempShield > 0 ? (tempShield * 1.2) / playerStats.atk : 0.8;
          setIsShieldResonanceActive(true);
          executeCombatAction(dmgFactor, '铁画银钩', 'slash');
          addLog(`🪐 【铁画银钩】意念凝剑！你将当前 ${tempShield} 点盾爆裂映射造成 ${dmgFactor.toFixed(1)} 倍穿深重刺！并且本局在此之后的盾甲增幅均同步反弹 20% 圣刺反伤！`, 'player-attack');
        }
      },
      //🪐 High Dimension Card 4: 「星能共振」
      btn_card_spell_resonance: {
        id: 'btn_card_spell_resonance',
        name: '星能共振',
        mpCost: 8,
        cooldown: customCardCooldowns['btn_card_spell_resonance'] || 0,
        maxCooldown: 2,
        description: '【星能共振 · 联动机制】前置连击：如果上一个施放的手牌是防御/护盾/治愈效果，则此卡造成的魔法加成翻倍（变为 3.0倍 伤害），并狂揽星力瞬间回复 15 点魔法 MP。',
        icon: <Sparkles className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-indigo-300 animate-pulse" />,
        colorClasses: 'border-indigo-900/70 hover:border-indigo-400 bg-gradient-to-b from-stone-900 to-indigo-950/40 text-indigo-101 shadow-[0_8px_20px_rgba(99,102,241,0.2)]',
        iconContainerClass: 'bg-indigo-950/45 border-indigo-800 text-indigo-405 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.3)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 8) return;
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_spell_resonance: 2 }));
          setPlayerMp((prev) => prev - 8);
          setLastCastWasDefensive(false);

          if (lastCastWasDefensive) {
            executeCombatAction(3.0, '星能共振', 'holy');
            setPlayerMp((prev) => Math.min(playerStats.maxMp, prev + 15));
            triggerDamagePopup("+15 MP 🌟", 22, 45, '#38bdf8');
            addLog(`🪐 【星能共振】前置联动点燃！由于你上个回合/瞬间做出盾格防御，攻击产生翻倍狂暴 3.0 倍伤害，并倒抽回复 15 点法力 MP！`, 'player-attack');
          } else {
            executeCombatAction(1.5, '星能共振', 'holy');
            addLog(`🪐 【星能共振】常规施展：由于前置没有防御铺垫，未能产生星轨共振，仅造成普通の 1.5 倍奥咒伤害。`, 'info');
          }
        }
      },
      //🪐 High Dimension Card 5: 「炼体自解」
      btn_card_hp_to_shield: {
        id: 'btn_card_hp_to_shield',
        name: '炼体自解',
        mpCost: 0,
        cooldown: customCardCooldowns['btn_card_hp_to_shield'] || 0,
        maxCooldown: 2,
        description: '【炼体自解 · 资源转换】自残解盾。无能量消耗。主动榨取并扣除自身当前生命值的 20%，将其放大 250%（即损耗血量的 2.5倍）转化为体表格挡圣盾。',
        icon: <Activity className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-orange-500" />,
        colorClasses: 'border-orange-900/60 hover:border-orange-500 bg-gradient-to-b from-stone-900 to-orange-950/30 text-orange-101 shadow-[0_8px_20px_rgba(249,115,22,0.2)]',
        iconContainerClass: 'bg-orange-950/45 border-orange-850 text-orange-400 group-hover:shadow-[0_0_12px_rgba(249,115,22,0.3)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          const hpCost = Math.round(playerHp * 0.20);
          if (hpCost < 1) {
            addLog(`❌ 你体内生气已降至孤寂枯水，无法进行自残精盾炼制！`, 'info');
            return;
          }
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_hp_to_shield: 2 }));
          setPlayerHp((prev) => Math.max(1, prev - hpCost));
          const shieldGranted = Math.round(hpCost * 2.5);
          addPlayerShield(shieldGranted);
          setLastCastWasDefensive(true);
          createSkillEffect('shield', 'player');
          triggerDamagePopup(`-${hpCost} HP 🩸`, 22, 50, '#ef4444');
          triggerDamagePopup(`+${shieldGranted} 🛡️`, 22, 42, '#38bdf8');
          addLog(`🪐 【炼体自解】自断血线：损耗了当前 20% (${hpCost} HP) 生命值，催生换提获得 ${shieldGranted} 点临时格挡盾！`, 'player-heal');
        }
      },
      //🪐 High Dimension Card 6: 「精气掠夺」
      btn_card_shield_steal: {
        id: 'btn_card_shield_steal',
        name: '精气掠夺',
        mpCost: 2,
        cooldown: customCardCooldowns['btn_card_shield_steal'] || 0,
        maxCooldown: 3,
        description: '【精气掠夺 · 资源转换】盾能汲化。摧毁敌方最多 40 点防御皮盾，将其 100% 转换为你自身的能量 MP。若敌身上没有护盾，偷其 4点 攻击两回合且治愈自身 15 HP。',
        icon: <Zap className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-lime-400" />,
        colorClasses: 'border-lime-900/60 hover:border-lime-450 bg-gradient-to-b from-stone-900 to-lime-950/25 text-lime-100 shadow-[0_8px_20px_rgba(132,204,22,0.15)]',
        iconContainerClass: 'bg-lime-950/45 border-lime-800 text-lime-405 group-hover:shadow-[0_0_12px_rgba(132,204,22,0.25)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 2) return;
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_shield_steal: 3 }));
          setPlayerMp((prev) => prev - 2);
          setLastCastWasDefensive(false);

          if (enemyShield > 0) {
            const stolen = Math.min(enemyShield, 40);
            setEnemyShield((prev) => prev - stolen);
            setPlayerMp((prev) => Math.min(playerStats.maxMp, prev + stolen));
            triggerDamagePopup(`-${stolen} 🛡️`, 76, 45, '#38bdf8');
            triggerDamagePopup(`+${stolen} MP ⚡`, 22, 45, '#38bdf8');
            addLog(`🪐 【精气掠夺】触发：你施展吸元真功，剥蚀掠夺了魔物 ${stolen} 点格挡护甲，灌输恢复了自己 ${stolen} 点 MP 能量！`, 'player-heal');
          } else {
            setEnemyAtkDebuffTurns(2);
            setPlayerHp((prev) => Math.min(playerStats.maxHp, prev + 15));
            triggerDamagePopup("+15 HP 💚", 22, 45, '#22c55e');
            triggerDamagePopup("-4 ATK 👾", 76, 45, '#ef4444');
            addLog(`🪐 【精气掠夺】保底：由于魔物此时没有格挡盾牌！你顺刀扣减并偷走其 4 点基础攻击属性（持续 2 轮），同时在战斗中本能自愈 +15 生命值！`, 'info');
          }
        }
      },
      //🪐 High Dimension Card 7: 「堕天狂意」
      btn_card_double_edged_atk: {
        id: 'btn_card_double_edged_atk',
        name: '堕天狂意',
        mpCost: 0,
        cooldown: customCardCooldowns['btn_card_double_edged_atk'] || 0,
        maxCooldown: 5,
        description: '【堕天狂意 · 双刃剑】献祭狂道。零消耗。使本局战斗中的基础攻击力永久 +12 点（支持高额无限叠加），但使主角立即陷入 3 回合“崩坏易伤”，受所有怪兽伤害增加 35%。',
        icon: <Skull className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-amber-500 animate-pulse" />,
        colorClasses: 'border-amber-950/70 hover:border-amber-500 bg-gradient-to-b from-stone-950 to-amber-950/40 text-amber-100 shadow-[0_8px_30px_rgba(245,158,11,0.3)]',
        iconContainerClass: 'bg-amber-950/45 border-amber-900 text-amber-400 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.4)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_double_edged_atk: 5 }));
          setDoubleEdgedAtkStacks((prev) => prev + 1);
          setRuinVulnerabilityTurns(3);
          setLastCastWasDefensive(false);
          createSkillEffect('fireball', 'player');
          triggerDamagePopup("+12 ATK 🌋", 22, 45, '#f59e0b');
          addLog(`🪐 【堕天狂意】堕神唤醒：你体中杀气永固剧升 +12 ATK（目前总计叠得 ${(doubleEdgedAtkStacks + 1)*12} 额外强袭攻值）！代偿苦果为接下来的 3 个回合你遭受所有怪兽重创加剧 35%！`, 'player-attack');
        }
      },
      //🪐 High Dimension Card 8: 「禁忌血契」
      btn_card_cooldown_reset: {
        id: 'btn_card_cooldown_reset',
        name: '禁忌血契',
        mpCost: 0,
        cooldown: customCardCooldowns['btn_card_cooldown_reset'] || 0,
        maxCooldown: 4,
        description: '【禁忌血契 · 双刃剑/大恢复】引灵血爆。零 MP 消耗。瞬间将除本卡外所有其他技能/卡牌的冷却 CD 清零，并补魔 25 MP。代价：你本场后续由于心火狂烧，每回合开始流血流失 5 点 HP。',
        icon: <Flame className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-red-500" />,
        colorClasses: 'border-red-950 hover:border-red-500 bg-gradient-to-b from-stone-900 to-red-950/50 text-red-100 shadow-[0_8px_25px_rgba(220,38,38,0.35)]',
        iconContainerClass: 'bg-red-950/50 border-red-800 text-red-405 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_cooldown_reset: 4 }));
          setIsBloodContractBleeding(true);
          setPlayerMp((prev) => Math.min(playerStats.maxMp, prev + 25));
          setLastCastWasDefensive(false);

          // Clear other cooldowns
          setSkill1Cooldown(0);
          setSkill2Cooldown(0);
          setCustomCardCooldowns((prev) => {
            const next = { ...prev };
            for (const key in next) {
              if (key !== 'btn_card_cooldown_reset') {
                next[key] = 0;
              }
            }
            return next;
          });
          createSkillEffect('poison', 'player');
          triggerDamagePopup("CD 重置 ⏱️", 22, 45, '#10b981');
          triggerDamagePopup("+25 MP 💎", 22, 52, '#38bdf8');
          addLog(`🪐 【禁忌血契】血崩点火：强洗体内所有战牌 CD 强制冷却重置（即刻能施），并淬取回复 25 MP！代价为你周身流血难消，回合开始流失 5 血！`, 'player-heal');
        }
      },
      //🪐 High Dimension Card 9: 「岁月逆溯」
      btn_card_time_stop: {
        id: 'btn_card_time_stop',
        name: '岁月逆溯',
        mpCost: 16,
        cooldown: customCardCooldowns['btn_card_time_stop'] || 0,
        maxCooldown: 4,
        description: '【岁月逆溯 · 延迟控制】时流错轴。高能消耗。强制延迟退后魔物当前的行动意图 1 轮（使其眩晕 1 轮无法动弹），为你换提珍贵而富含深度决策的战术整备时间。',
        icon: <Compass className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-indigo-400" />,
        colorClasses: 'border-indigo-900/60 hover:border-indigo-400 bg-gradient-to-b from-stone-900 to-indigo-950/20 text-indigo-101 shadow-[0_8px_20px_rgba(79,70,229,0.2)]',
        iconContainerClass: 'bg-indigo-950/45 border-indigo-850 text-indigo-400 group-hover:shadow-[0_0_12px_rgba(79,70,229,0.3)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (playerMp < 16) return;
          setCustomCardCooldowns(prev => ({ ...prev, btn_card_time_stop: 4 }));
          setPlayerMp((prev) => prev - 16);
          setEnemyStunnedTurns((prev) => prev + 1);
          setLastCastWasDefensive(false);
          createSkillEffect('holy', 'enemy');
          triggerDamagePopup("定格 ⏳", 76, 45, '#6366f1');
          addLog(`🪐 【岁月逆溯】岁月凋零，时河逆行！逆溯钟摆，敌人当前回合心神剧震、定格跳过本轮行动！` , 'player-attack');
        }
      },
      //🪐 High Dimension Card 10: 「完美幻影」
      btn_card_mimic_skill: {
        id: 'btn_card_mimic_skill',
        name: '完美幻影',
        mpCost: 6,
        cooldown: customCardCooldowns['btn_card_mimic_skill'] || 0,
        maxCooldown: 2,
        description: '【完美幻影 · 复制重现】幻灵重现。立即完全复制并释放你上一个施放过的自定义本源技能（不含普通劈砍与药水），法力换算享受半价倾斜，让你连续多连爆发。',
        icon: <Crown className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-purple-300 animate-pulse" />,
        colorClasses: 'border-purple-900/65 hover:border-purple-400 bg-gradient-to-b from-stone-900 to-purple-950/20 text-purple-105 shadow-[0_8px_20px_rgba(168,85,247,0.2)]',
        iconContainerClass: 'bg-purple-950/45 border-purple-800 text-purple-405 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.35)]',
        action: () => {
          if (isCombatFinished || !isPlayerTurn) return;
          if (!lastPlayedSkillId) {
            addLog(`❌ 你在此战斗之前没有使出过任何可以复制的自鸣武学，虚无幻面无法映射！`, 'info');
            return;
          }
          const targetCard = allCustomCards[lastPlayedSkillId];
          if (!targetCard) {
            addLog(`❌ 幻灵在冥空中感知不到这个旧法术的可复制引子。`, 'info');
            return;
          }
          const costDis = Math.max(0, Math.round(targetCard.mpCost / 2));
          if (playerMp < costDis) {
            addLog(`❌ 你意念中的魔能容量不足（复制「${targetCard.name}」需要 ${costDis} MP），幻像虚空化形碎裂！`, 'info');
            return;
          }
          setPlayerMp((prev) => prev - costDis);
          triggerDamagePopup("幻形 🪞", 22, 42, '#a855f7');
          addLog(`🪞 【完美幻影】大复制奥术触发！以半折能耗（-${costDis} MP）幻觉映射出你上一次用出的绝技「${targetCard.name}」！`, 'player-heal');
          targetCard.action();
        }
      }
    };

    // 5. ASSEMBLE DYNAMIC DECK
    let activeDeckList = playerStats.deck;
    if (!activeDeckList || activeDeckList.length === 0) {
      activeDeckList = ['btn_battle_use_atk', 'btn_class_skill_1', 'btn_class_skill_2'];
    }

    // Always guarantee Basic Attack is in the deck so player is never locked with 0 cards
    if (!activeDeckList.includes('btn_battle_use_atk')) {
      activeDeckList = ['btn_battle_use_atk', ...activeDeckList];
    }

    const finalCards: SkillCardData[] = [];

    activeDeckList.forEach((cardKey) => {
      if (cardKey === 'btn_battle_use_atk') {
        finalCards.push(basicCard);
      } else if (cardKey === 'btn_class_skill_1') {
        finalCards.push(classSkill1);
      } else if (cardKey === 'btn_class_skill_2') {
        finalCards.push(classSkill2);
      } else if (allCustomCards[cardKey]) {
        finalCards.push(allCustomCards[cardKey]);
      }
    });

    // Final bulletproof check: if somehow it compiles to 0 cards, fallback to starter hand
    if (finalCards.length === 0) {
      finalCards.push(basicCard, classSkill1, classSkill2);
    }

    return finalCards;
  };

  return (
    <div 
      className="flex flex-col min-h-screen font-sans text-stone-100 select-none pb-12 relative bg-cover bg-center" 
      id="battle_main_view"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(12, 10, 9, 0.75), rgba(12, 10, 9, 0.9)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')` 
      }}
    >
      {/* Visual flash modifier on screen when damaged */}
      <div className={`absolute inset-0 bg-red-600/10 opacity-0 pointer-events-none transition-opacity ${playerHurtAnimate ? 'opacity-100' : ''}`} />

      {/* Header bar */}
      <div className="bg-stone-900 border-b border-stone-800 p-4 sticky top-0 z-10 flex justify-between items-center" id="battle_hdr">
        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-mono text-xs">当前决斗:</span>
          <span className="text-rose-400 text-sm font-bold tracking-wider">{enemy.name}</span>
        </div>
        {!isCombatFinished && (
          <button 
            id="btn_escape_battle"
            onClick={onEscape}
            className="px-3 py-1 rounded text-stone-400 hover:text-white border border-stone-800 bg-stone-950 text-xs hover:bg-stone-900 transition-all cursor-pointer"
          >
            撤退逃跑 (放弃本奖励)
          </button>
        )}
      </div>

      <div className="max-w-3xl lg:max-w-4xl w-full mx-auto p-4 md:p-6 flex-1 flex flex-col justify-center" id="battle_split_box">
        
        {/* Playable Stage */}
        <div className="flex flex-col justify-between gap-6 bg-stone-900/85 backdrop-blur-lg border border-stone-850/60 rounded-3xl p-6 relative shadow-2xl" id="battle_stage_left">
          
          {/* Battlefield Visual Arena */}
          <div 
            className={`w-full rounded-2xl overflow-hidden relative shadow-2xl border border-stone-800/50 flex flex-col justify-between transition-all duration-100 ${
              shakeScreen ? 'shake-arena' : ''
            } ${
              flashScreen ? 'animate-flash-screen' : ''
            }`}
            style={{ 
              height: '350px',
              backgroundImage: `linear-gradient(to bottom, rgba(12, 10, 9, 0.4), rgba(12, 10, 9, 0.1) 60%, rgba(12, 10, 9, 0.6) 90%), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            id="battle_visual_arena"
          >
            {/* Top Row: Floating HUD panels */}
            <div className="flex justify-between items-start p-4 gap-4 bg-gradient-to-b from-black/85 to-transparent z-10" id="arena_hud">
              {/* Player UI Panel - Top Left */}
              <div className="flex-1 flex flex-col max-w-[220px]" id="hud_player_pnl">
                <div className="flex items-center gap-1.5 justify-start">
                  <span className="font-bold text-xs md:text-sm text-white tracking-wide">{playerStats.title}</span>
                  <span className="text-[9px] bg-stone-800 text-stone-300 px-1 py-0.2 rounded font-mono">Lv.{playerStats.level}</span>
                </div>
                
                {/* HP bar */}
                <div className="mt-1.5 w-full bg-stone-950/80 border border-stone-800/50 rounded-full h-3.5 overflow-hidden relative" id="hud_player_hp">
                  <div 
                    className="bg-red-650 h-full transition-all duration-300"
                    style={{ width: `${(playerHp / playerStats.maxHp) * 100}%` }}
                  />
                  {tempShield > 0 && (
                    <div 
                      className="absolute top-0 right-0 h-full bg-blue-500/80 transition-all duration-300"
                      style={{ width: `${Math.min(100, (tempShield / playerStats.maxHp) * 100)}%` }}
                    />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-stone-100 font-bold">
                    HP {playerHp}/{playerStats.maxHp} {tempShield > 0 ? `(+${tempShield})` : ''}
                  </span>
                </div>

                {/* MP/Mana bar */}
                <div className="mt-1 w-full bg-stone-950/80 border border-stone-800/50 rounded-full h-2.5 overflow-hidden relative" id="hud_player_mp">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${(playerMp / playerStats.maxMp) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-stone-200">
                    MP {playerMp}/{playerStats.maxMp}
                  </span>
                </div>

                {/* Buffs and defenses */}
                <div className="mt-1.5 flex flex-wrap gap-1 justify-start">
                  {tempDef > playerStats.def && (
                    <span className="bg-sky-950/95 border border-sky-500/20 text-sky-400 font-mono text-[8.5px] px-1 py-0.2 rounded leading-tight flex items-center gap-0.5" title="Defense buff active">
                      🛡️+{tempDef - playerStats.def}防
                    </span>
                  )}
                  {critMultiplier > 1 && (
                    <span className="bg-emerald-950/95 border border-emerald-500/20 text-emerald-400 font-mono text-[8.5px] px-1 py-0.2 rounded leading-tight flex items-center gap-0.5 animate-pulse" title="Critical strike chance high">
                      🗡️{critMultiplier}x暴击
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Element - Versus Badge */}
              <div className="flex flex-col items-center justify-center self-center" id="hud_vs_badge">
                <span className="font-mono font-black text-rose-500 text-xs tracking-widest bg-stone-950/95 px-2 py-0.5 rounded-md border border-stone-800 shadow-lg scale-90">VS</span>
              </div>

              {/* Enemy UI Panel - Top Right */}
              <div className="flex-1 flex flex-col items-end max-w-[220px]" id="hud_enemy_pnl">
                <div className="flex items-center gap-1.5 justify-end">
                  {enemy.isBoss && <span className="text-[9px] bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 px-1 py-0.2 rounded leading-none font-bold">楼之主</span>}
                  {enemy.isElite && <span className="text-[9px] bg-red-500/30 border border-red-500/50 text-red-00 px-1 py-0.2 rounded leading-none font-bold">深渊精锐</span>}
                  <span className="font-bold text-xs md:text-sm text-stone-100 tracking-wide">{enemy.name}</span>
                </div>

                {/* HP bar */}
                <div className="mt-1.5 w-full bg-stone-950/80 border border-stone-800/50 rounded-full h-3.5 overflow-hidden relative" id="hud_enemy_hp">
                  <div 
                    className="bg-rose-600 h-full transition-all duration-300"
                    style={{ width: `${(enemyHp / enemy.maxHp) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-stone-100 font-bold">
                    HP {enemyHp}/{enemy.maxHp}
                  </span>
                </div>

                {/* Intent placeholder inside top-right HUD to make it extremely clear */}
                <div className="mt-1 w-full flex justify-end" id="hud_enemy_intent">
                  {!isCombatFinished ? (
                    <div className="bg-stone-950/90 border border-stone-800 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 max-w-full truncate text-stone-300 leading-none" title="Next Intended Move">
                      <span className="text-[8px] text-stone-500 font-mono">技能意向:</span>
                      {enemy.intent === 'ATTACK' && <span className="text-red-400 font-bold flex items-center gap-0.5"><Sword className="w-2 h-2" /> 物理斩击 ({currentEnemyAttackValue})</span>}
                      {enemy.intent === 'DEFEND' && <span className="text-sky-400 font-bold flex items-center gap-0.5"><ShieldAlert className="w-2 h-2" /> 重装防御</span>}
                      {enemy.intent === 'HEAL' && <span className="text-emerald-400 font-bold flex items-center gap-0.5"><Heart className="w-2 h-2" /> 吸星引血 (+{enemy.intentValue})</span>}
                      {enemy.intent === 'BUFF' && <span className="text-amber-400 font-bold flex items-center gap-0.5"><Activity className="w-2 h-2" /> 咒术狂化</span>}
                    </div>
                  ) : (
                    <span className="text-[9px] text-stone-500">魔物已战败</span>
                  )}
                </div>

                {/* Debuffs */}
                <div className="mt-1 flex flex-wrap gap-1 justify-end">
                  {enemyWeakenedTurns > 0 && (
                    <span className="bg-purple-950/90 border border-purple-500/20 text-purple-400 font-mono text-[8px] px-1 py-0.2 rounded leading-tight flex items-center gap-0.5">
                      弱化 {enemyWeakenedTurns}回
                    </span>
                  )}
                  {enemyStunnedTurns > 0 && (
                    <span className="bg-amber-950/90 border border-amber-500/20 text-amber-500 font-mono text-[8px] px-1 py-0.2 rounded leading-tight animate-pulse flex items-center gap-0.5">
                      眩晕 {enemyStunnedTurns}回
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Combat Area: Avatar Standing Ground */}
            <div className="flex-1 w-full relative flex items-end justify-center px-6 pb-2" id="arena_ground">
              {/* CSS Scoped Style Tag for Premium Pixel Animations */}
              <style>{`
                @keyframes floatUpFade {
                  0% {
                    transform: translateY(0px) scale(0.6);
                    opacity: 0;
                  }
                  15% {
                    transform: translateY(-8px) scale(1.1);
                    opacity: 1;
                  }
                  100% {
                    transform: translateY(-40px) scale(0.9);
                    opacity: 0;
                  }
                }
                .animate-float-up-fade {
                  animation: floatUpFade 1.1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
                
                .pixel-particle {
                  image-rendering: pixelated;
                  box-shadow: inset -1.5px -1.5px 0px rgba(0,0,0,0.5);
                  border: 1px solid rgba(0,0,0,0.9);
                }

                @keyframes summonFlash {
                  0% { filter: brightness(3) saturate(2); transform: scale(0.5); opacity: 0.5; }
                  50% { filter: brightness(1.5) saturate(1.5); transform: scale(1.12); opacity: 0.9; }
                  100% { filter: none; transform: scale(1); opacity: 1; }
                }
                .animate-summon-emerge {
                  animation: summonFlash 0.5s ease-out forwards;
                }
              `}</style>

              {/* Retro Pixel Sparks Particle Overlays */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-30" id="particle_overlay_pane">
                {particles.map((p) => {
                  const isPixelParticle = !p.isSmoke && !p.isProjectile;
                  return (
                    <div
                      key={p.id}
                      className={`absolute ${isPixelParticle ? 'pixel-particle' : ''}`}
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.width !== undefined ? `${p.width}px` : `${p.size}px`,
                        height: p.height !== undefined ? `${p.height}px` : `${p.size}px`,
                        backgroundColor: p.color,
                        opacity: p.life,
                        borderRadius: isPixelParticle ? '0px' : p.borderRadius || (p.isSmoke ? '50%' : '2px'),
                        transform: p.rotate !== undefined ? `rotate(${p.rotate}deg)` : undefined,
                        boxShadow: isPixelParticle 
                          ? 'inset -1.5px -1.5px 0px rgba(0,0,0,0.45)' 
                          : p.boxShadow || (p.isSmoke ? 'none' : `0 0 ${p.size * 2}px ${p.color}`),
                        filter: p.filter || (p.isSmoke ? 'blur(1.5px)' : 'none'),
                        border: isPixelParticle ? '1px solid rgba(0,0,0,0.95)' : 'none',
                      }}
                    />
                  );
                })}

                {/* Floating Retro Damage Popups */}
                {damagePopups.map((p) => (
                  <div
                    key={p.id}
                    className="absolute font-mono font-extrabold text-base md:text-xl pointer-events-none select-none z-40 animate-float-up-fade text-center"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      color: p.color,
                      textShadow: '2.5px 2.5px 0 #000000, -1.5px -1.5px 0 #000000, 1.5px -1.5px 0 #000000, -1.5px 1.5px 0 #000000, 1.5px 1.5px 0 #000000',
                      transform: p.isCrit ? 'scale(1.4) rotate(-5deg)' : 'scale(1) rotate(0deg)',
                    }}
                  >
                    {p.text}
                    {p.isCrit && (
                      <div 
                        className="text-[8px] md:text-[9.5px] text-yellow-400 font-serif font-black uppercase tracking-wider text-center"
                        style={{ textShadow: '1.5px 1.5px 0 #000000' }}
                      >
                        💥 CRIT!
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Left Side: Player Character */}
              <div 
                className={`absolute left-[5%] bottom-[5%] md:left-[10%] flex flex-col items-center transition-all ${
                  winner === 'enemy' 
                    ? 'opacity-0 scale-[0.6] pointer-events-none duration-1000' 
                    : 'duration-300'
                } ${
                  playerAttackAnimate ? 'translate-x-[60px] scale-110 z-20' : 'z-10'
                } ${
                  playerHurtAnimate ? 'animate-bounce saturate-150 brightness-125' : ''
                }`}
                style={{ filter: playerHurtAnimate ? 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.9))' : 'none' }}
                id="viewport_player"
              >
                {/* Character standing presentation, completely NO BORDERS or BACKGROUNDS as requested */}
                <div className="w-32 h-32 md:w-44 md:h-44 relative flex items-center justify-center">
                  <PixelTransparentImage 
                    src={CLASS_IMAGES[playerStats.classType]} 
                    alt={playerStats.classType} 
                    className="w-[110%] h-[110%] object-contain max-h-[110%] max-w-[110%] drop-shadow-[0_12px_15px_rgba(0,0,0,0.65)] scale-115" 
                  />
                  {/* Subtle ground shadow */}
                  <div className="absolute bottom-1 w-24 h-2.5 bg-black/50 rounded-full filter blur-[2px] -z-10"></div>
                </div>

                {/* Tiny shield float indicator on top of character */}
                {tempShield > 0 && (
                  <span className="absolute -top-3 bg-blue-600 border border-blue-400 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full shadow-lg z-20 flex items-center gap-0.5 animate-bounce">
                    🛡️ {tempShield}
                  </span>
                )}
              </div>

              {/* Interactive summoned minions list - Beautiful diagonal cascade */}
              {minions.map((minion, mIdx) => {
                const isSelected = selectedTargetId === minion.id;
                const offsetClass = mIdx === 0 
                  ? 'right-[26%] bottom-[4%] md:right-[30%] z-15' 
                  : 'right-[44%] bottom-[10%] md:right-[48%] z-14';
                return (
                  <div
                    key={minion.id}
                    onClick={() => {
                      if (isCombatFinished) return;
                      setSelectedTargetId(minion.id);
                      sfx.playSelect();
                    }}
                    className={`absolute ${offsetClass} flex flex-col items-center transition-all duration-300 cursor-pointer ${
                      minion.hurtAnimate ? 'animate-bounce saturate-150 brightness-125' : ''
                    }`}
                    style={{ filter: minion.hurtAnimate ? 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.9))' : 'none' }}
                  >
                    {/* Targeting Dotted Red Ring over chosen minion */}
                    {isSelected && !isCombatFinished && (
                       <div className="absolute -inset-3.5 border-2 border-dashed border-rose-500 rounded-full animate-spin pointer-events-none z-20" />
                    )}

                    {/* Minion Stand with custom entry spawn animation */}
                    <div className="w-[84px] h-[84px] md:w-[115px] md:h-[115px] relative flex items-center justify-center hover:scale-105 transition-transform animate-summon-emerge">
                      <PixelTransparentImage
                        src={minion.image}
                        alt={minion.name}
                        className="w-[90%] h-[90%] object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.7)]"
                      />
                      {/* Shadow */}
                      <div className="absolute bottom-0 w-14 h-1.5 bg-black/60 rounded-full filter blur-[1.5px] -z-10"></div>
                    </div>

                    {/* Compact Retro HUD panel */}
                    <div className="bg-stone-950/95 border border-stone-850 rounded px-2 py-0.5 mt-1 select-none shadow-xl min-w-[75px] max-w-[95px]">
                      <div className="text-[8.5px] font-bold text-stone-300 truncate text-center leading-none">{minion.name}</div>
                      <div className="w-full bg-stone-900 border border-stone-805 h-1 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-red-500 h-full transition-all duration-200"
                          style={{ width: `${(minion.hp / minion.maxHp) * 100}%` }}
                        />
                      </div>
                      <div className="text-[7.5px] font-mono text-stone-400 mt-0.5 text-center leading-none">
                        HP {minion.hp}/{minion.maxHp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Right Side: Enemy Character */}
              <div 
                onClick={() => {
                  if (isCombatFinished) return;
                  setSelectedTargetId('main');
                  sfx.playSelect();
                }}
                className={`absolute right-[5%] bottom-[5%] md:right-[10%] flex flex-col items-center transition-all cursor-pointer ${
                  selectedTargetId === 'main' ? 'z-20 scale-102' : 'z-10 opacity-80'
                } ${
                  enemyHp <= 0 
                     ? 'opacity-0 scale-[50%] pointer-events-none duration-700' 
                     : winner === 'player' 
                       ? 'opacity-0 scale-[0.6] pointer-events-none duration-1000' 
                       : 'duration-300'
                } ${
                  enemyAttackAnimate ? '-translate-x-[60px] scale-110' : ''
                } ${
                  enemyHurtAnimate ? 'animate-bounce saturate-150 brightness-125' : ''
                }`}
                style={{ filter: enemyHurtAnimate ? 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.9))' : 'none' }}
                id="viewport_enemy"
              >
                {/* Targeting Dotted Red Ring over chosen main boss */}
                {selectedTargetId === 'main' && !isCombatFinished && (
                  <div className="absolute -inset-4 border-2 border-dashed border-rose-500 rounded-full animate-spin pointer-events-none z-20" />
                )}

                {/* Enemy standing presentation, completely NO BORDERS or BACKGROUNDS as requested */}
                <div className={`${enemy.isBoss || enemy.isElite ? 'w-32 h-32 md:w-44 md:h-44' : 'w-26 h-26 md:w-34 md:h-34'} relative flex items-center justify-center transition-all duration-300`}>
                  {enemy.image ? (
                    <PixelTransparentImage 
                      src={enemy.image} 
                      alt={enemy.name} 
                      className={`${enemy.isBoss || enemy.isElite ? 'w-full h-full scale-100' : 'w-[85%] h-[85%] scale-90'} object-contain max-h-full max-w-full drop-shadow-[0_12px_15px_rgba(0,0,0,0.65)]`}
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center text-rose-450">
                      {enemy.icon === 'Crown' && <Crown className="w-20 h-20 text-yellow-400 filter drop-shadow-[0_10px_12px_rgba(0,0,0,0.555)]" />}
                      {enemy.icon === 'Flame' && <Flame className="w-20 h-20 text-orange-500 filter drop-shadow-[0_10px_12px_rgba(0,0,0,0.555)]" />}
                      {enemy.icon === 'Skull' && <Activity className="w-20 h-20 text-purple-400 filter drop-shadow-[0_10px_12px_rgba(0,0,0,0.555)]" />}
                      {!['Crown', 'Flame', 'Skull'].includes(enemy.icon) && <Sword className="w-20 h-20 text-rose-500 filter drop-shadow-[0_10px_12px_rgba(0,0,0,0.555)]" />}
                    </div>
                  )}
                  {/* Subtle ground shadow */}
                  <div className={`absolute bottom-1 ${enemy.isBoss || enemy.isElite ? 'w-24' : 'w-16'} h-2 bg-black/50 rounded-full filter blur-[2px] -z-10`}></div>
                </div>
              </div>
            </div>

            {/* Bottom Row inside visual area: Brief status/actions scroll in combat or intent summary */}
            {!isCombatFinished && (
              <div className="bg-stone-950/85 border-t border-stone-900/60 px-4 py-2 flex justify-between items-center text-xs text-stone-400 font-sans z-10 select-none">
                <span className="flex items-center gap-1.5 text-stone-500 text-[10.5px]">
                  <Activity className="w-3 h-3 text-red-500" />
                  决斗动态:
                </span>
                <span className="text-[10.5px] text-stone-300 italic truncate max-w-[340px] md:max-w-[480px]">
                  {enemy.intent === 'ATTACK' ? `警惕！魔物正凝聚威能，本回合将打出物理重击并造成 ${currentEnemyAttackValue} 点伤害` : ''}
                  {enemy.intent === 'DEFEND' ? '魔物蓄势严防，准备在下一回合大幅度增加格挡值' : ''}
                  {enemy.intent === 'HEAL' ? `魔物魔吟环绕，意图引引灵能恢复 ${enemy.intentValue} HP` : ''}
                  {enemy.intent === 'BUFF' ? '魔物怒吼一声，激活远古血脉咒文以提升战斗伤害' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Bottom: Action Trigger buttons deck */}
          <div className="border-t border-stone-800 pt-6 mt-4" id="action_deck_pnl">
            {!isCombatFinished ? (
              <div className="flex flex-col gap-4">
                {/* Immersive Skill Card Hands accompanied by Energy Orb Badge - MATCHES IMAGE 2 */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 max-w-3xl mx-auto w-full px-1 justify-center relative" id="combat_deck_container">

                  {/* Glowing Energy Orb Shield - 3D Blue Light */}
                  <div className="flex flex-row md:flex-col items-center justify-center gap-2 select-none shrink-0" id="combat_energy_orb_wrap">
                    <div className="w-13 h-13 md:w-16 md:h-16 rounded-full border-2 border-amber-500/80 bg-stone-950 flex items-center justify-center relative shadow-[0_0_15px_rgba(59,130,246,0.6),0_0_25px_rgba(59,130,246,0.3)] animate-pulse" id="energy_orb_crest">
                      {/* Radial inner core */}
                      <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-blue-900 via-sky-600 to-indigo-850 opacity-90" />
                      <span className="text-xl md:text-2xl font-serif font-black text-stone-100 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {Math.max(0, Math.floor(playerMp / 6))}
                      </span>
                    </div>
                    <div className="text-center font-serif">
                      <div className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">能量 / 精准</div>
                      <div className="text-[9px] text-stone-400 font-mono mt-0.5">{playerMp}/{playerStats.maxMp} MP</div>
                    </div>
                  </div>

                  {/* Elegant Cards Fan Row (Overlapping poker layout with 3D hovered raises) */}
                  <div className="flex-1 flex flex-row items-center justify-center select-none overflow-visible py-5 px-4 min-h-[195px] sm:min-h-[225px] md:min-h-[285px] lg:min-h-[305px] w-full max-w-full" id="battle_skills_deck_cards">
                    {(() => {
                      const skillCards = getSkillCards();
                      const totalCards = skillCards.length;
                      return skillCards.map((card, idx) => {
                        const isDisabled = !isPlayerTurn || playerMp < card.mpCost || card.cooldown > 0;
                        const energyCostValue = Math.ceil(card.mpCost / 6);
                        
                        const isWarrior = playerStats.classType === CharacterClass.WARRIOR;
                        const isMage = playerStats.classType === CharacterClass.MAGE;
                        
                        const themeColor = isWarrior 
                          ? { border: 'border-red-900 group-hover:border-red-500', innerBorder: 'border-red-950/40', accent: 'border-red-500/30' }
                          : isMage 
                            ? { border: 'border-blue-900 group-hover:border-blue-500', innerBorder: 'border-blue-950/40', accent: 'border-blue-500/30' }
                            : { border: 'border-emerald-950 group-hover:border-emerald-600', innerBorder: 'border-emerald-950/40', accent: 'border-emerald-500/30' };

                        const borderClass = isDisabled 
                          ? 'border-4 border-stone-850 bg-stone-900/40 opacity-40 cursor-not-allowed text-stone-600 shadow-none' 
                          : `border-4 ${themeColor.border} bg-stone-950 text-amber-50 shadow-[4px_4px_0_0_rgba(0,0,0,0.85)] cursor-pointer active:translate-y-0.5 active:shadow-[2px_2px_0_0_rgba(0,0,0,0.85)] outline outline-2 outline-black`;

                        // Calculate dynamic poker fan overlap layout styles
                        const isHovered = hoveredCardId === card.id;
                        const isPlaying = playingCardId === card.id;

                        const centerOffset = idx - (totalCards - 1) / 2;
                        const rotateDeg = centerOffset * (totalCards > 4 ? 4 : 5.5); // fan rotation steps
                        const translateY = Math.abs(centerOffset) * (totalCards > 3 ? 3.5 : 2); // vertical drop arch
                        const translateX = centerOffset * (totalCards > 4 ? -16 : -11); // overlap compression step

                        // Interactive physical layout settings
                        const initialConfig = {
                          opacity: 0,
                          scale: 0.1,
                          y: 220,
                          x: 120,
                          rotate: 45
                        };

                        const animateConfig = isPlaying
                          ? {
                              opacity: [1, 1, 0],
                              scale: 1.35,
                              x: 0,
                              y: -240,
                              rotate: 0,
                              zIndex: 150
                            }
                          : isDisabled
                            ? {
                                opacity: 0.4,
                                scale: 1,
                                x: translateX,
                                y: translateY,
                                rotate: rotateDeg,
                                zIndex: 10 + idx
                              }
                            : isHovered
                              ? {
                                  opacity: 1,
                                  scale: 1.15,
                                  x: centerOffset * -5,
                                  y: -32,
                                  rotate: 0,
                                  zIndex: 60
                                }
                              : {
                                  opacity: 1,
                                  scale: 1,
                                  x: translateX,
                                  y: translateY,
                                  rotate: rotateDeg,
                                  zIndex: 10 + idx
                                };

                        const transitionConfig = isPlaying
                          ? { duration: 0.22, ease: "easeOut" }
                          : {
                              type: "spring",
                              stiffness: 180,
                              damping: 15,
                              mass: 1,
                              delay: idx * 0.05
                            };

                        return (
                          <motion.div
                            key={card.id}
                            id={card.id}
                            initial={initialConfig}
                            animate={animateConfig}
                            transition={transitionConfig}
                            onClick={() => {
                              if (!isDisabled && !playingCardId) {
                                setPlayingCardId(card.id);
                                if (card.id !== 'btn_battle_use_atk' && card.id !== 'btn_card_mimic_skill') {
                                  setLastPlayedSkillId(card.id);
                                }
                                // Slight 220ms delay allows the physical card throwing flip to render beautifully 
                                setTimeout(() => {
                                  card.action();
                                  setPlayingCardId(null);
                                }, 220);
                              }
                            }}
                            onMouseEnter={() => {
                              if (!isDisabled) {
                                setHoveredCardId(card.id);
                              }
                            }}
                            onMouseMove={(e) => {
                              if (!isDisabled) {
                                handleCardMouseMove(e, card.id);
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredCardId(null);
                              if (!isDisabled) {
                                handleCardMouseLeave(card.id);
                              }
                            }}
                            style={{
                              ...(tiltStyles[card.id] && isHovered && !isPlaying ? tiltStyles[card.id] : {}),
                              boxShadow: isPlaying
                                ? '0 30px 50px rgba(0,0,0,0.95), 0 0 35px rgba(245,158,11,0.75)'
                                : isHovered
                                  ? '0 25px 35px -5px rgba(0, 0, 0, 0.85), 0 15px 20px -8px rgba(0, 0, 0, 0.75), 0 0 25px rgba(245, 158, 11, 0.55)'
                                  : '4px 4px 0_0_rgba(0,0,0,0.85)'
                            }}
                            className={`w-[90px] xs:w-[100px] sm:w-[130px] md:w-[160px] lg:w-[175px] h-[155px] xs:h-[165px] sm:h-[195px] md:h-[240px] lg:h-[265px] shrink-0 rounded-none p-2 sm:p-2.5 md:p-4 flex flex-col justify-between text-center relative select-none group ${borderClass}`}
                          >
                            {/* Inner double-inset deluxe gold borders for medieval styling */}
                            {!isDisabled ? (
                              <>
                                {/* Fine inner dashed pixel border */}
                                <div className="absolute inset-1 pointer-events-none rounded-none border border-dashed border-amber-500/25 group-hover:border-amber-400/35 transition-colors duration-300" />
                                
                                {/* Fine medieval Corner Brackets */}
                                <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-600/75 pointer-events-none rounded-none group-hover:border-amber-300 transition-colors" />
                                <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-600/75 pointer-events-none rounded-none group-hover:border-amber-300 transition-colors" />
                                <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-600/75 pointer-events-none rounded-none group-hover:border-amber-300 transition-colors" />
                                <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-600/75 pointer-events-none rounded-none group-hover:border-amber-300 transition-colors" />
                                
                                {/* Centered holy radial background glow inside the card */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none" />
                              </>
                            ) : (
                              <div className="absolute inset-1 pointer-events-none rounded-none border border-dashed border-stone-800/40" />
                            )}

                            {/* Slay the Spire Top Red Curtain Border Decoration - MATCHES IMAGE 2 */}
                            <div className={`absolute top-0 inset-x-0 h-2 rounded-none bg-gradient-to-r ${isDisabled ? 'from-stone-800 to-stone-750' : 'from-red-850 via-rose-650 to-red-900'} border-b-2 border-black z-10`} />

                            {/* Top-Left Square Cost Badge - MATCHES IMAGE 2 in pixel art */}
                            <div className={`absolute -top-1.5 -left-1.5 sm:-top-3 sm:-left-3 w-5 h-5 sm:w-8 sm:h-8 rounded-none border-2 border-black text-stone-950 font-serif font-black flex items-center justify-center text-[9px] sm:text-xs shadow-[2px_2px_0_rgba(0,0,0,0.85)] z-30 transition-transform group-hover:scale-110 ${isDisabled ? 'bg-stone-750 text-stone-400 border-stone-850' : 'bg-amber-450 border-black text-stone-950'}`}>
                              <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.15)]">{energyCostValue}</span>
                            </div>

                            {/* Card Content */}
                            <div className="flex flex-col items-center flex-grow pt-1 xs:pt-1.5 relative z-10 overflow-hidden">
                              {/* Radial Glow Container for Icon */}
                              <div className={`w-6 h-6 sm:w-8 sm:h-8 md:w-11 md:h-11 rounded-none border-2 border-black flex items-center justify-center mx-auto mt-0.5 sm:mt-1 mb-0.5 sm:mb-2 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] bg-stone-900 group-hover:scale-105 transition-transform ${card.iconContainerClass}`}>
                                {React.cloneElement(card.icon, { className: 'w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-5.5 md:h-5.5' })}
                              </div>

                              {/* Skill Main Title */}
                              <h4 className="text-[8.5px] xs:text-[10px] sm:text-xs md:text-sm font-serif font-bold tracking-wide transition-colors duration-200 text-amber-100 group-hover:text-amber-300 truncate max-w-full">
                                {card.name}
                              </h4>

                              {/* Subtitle Badge */}
                              <span className={`hidden xs:inline-block text-[6.5px] sm:text-[8px] px-1 sm:px-1.5 py-0.5 rounded-none tracking-widest mt-0.5 sm:mt-1.5 uppercase font-serif border ${isDisabled ? 'text-stone-600 border-stone-800 bg-stone-900/30' : 'text-amber-500/90 border-amber-500/20 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors'}`}>
                                {card.mpCost === 0 ? '基础 · 行' : '秘奥 · 术'}
                              </span>

                              {/* Description Text */}
                              <p className="text-[7.5px] xs:text-[8.5px] sm:text-[9.5px] md:text-[11px] text-stone-450 leading-tight mt-1 sm:mt-2.5 font-serif flex-grow line-clamp-3 md:line-clamp-none pl-0.5 pr-0.5 text-center overflow-hidden">
                                {card.description}
                              </p>
                            </div>

                            {/* Bottom Status action indicator under the card */}
                            <div className="mt-0.5 pb-0.5 text-[7px] xs:text-[8px] sm:text-[10px] font-bold select-none border-t border-stone-900/60 pt-0.5 sm:pt-1.5 font-serif relative z-10">
                              {!isPlayerTurn ? (
                                <span className="text-stone-500">
                                  ⚠️ 敌方回合
                                </span>
                              ) : card.cooldown > 0 ? (
                                <span className="text-amber-500 flex items-center justify-center gap-0.5">
                                  ⏳ {card.cooldown}r
                                </span>
                              ) : playerMp < card.mpCost ? (
                                <span className="text-rose-450">
                                  ⚠️ 灵能不足
                                </span>
                              ) : (
                                <span className="text-[#c5a880] group-hover:text-amber-300 transition-colors uppercase">
                                  ⚡ 释放
                                </span>
                              )}
                            </div>

                            {/* Cooldown Overlay */}
                            {card.cooldown > 0 && (
                              <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-[0.5px] rounded-none flex flex-col items-center justify-center z-20">
                                <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-amber-500 font-mono tracking-tighter mb-0.5">
                                  {card.cooldown}
                                </div>
                                <span className="text-[6.5px] sm:text-[8px] md:text-[10px] font-bold text-stone-400 tracking-wider">
                                  冷却 (回合)
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      });
                    })()}
                  </div>

                  {/* Medieval-styled Slay the Spire End Turn Button */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-full md:w-28" id="end_turn_btn_container">
                    <button
                      id="btn_end_player_turn"
                      disabled={!isPlayerTurn}
                      onClick={handlePlayerEndTurn}
                      className={`w-full md:w-24 py-4 px-2 font-serif font-black text-xs tracking-wider cursor-pointer shadow-[4px_4px_0_0_rgba(0,0,0,0.85)] transition-all duration-200 active:scale-95 rounded-none border-4 outline outline-2 outline-black flex flex-col items-center justify-center gap-1.5 ${
                        isPlayerTurn
                          ? 'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 border-[#c5a880] hover:border-yellow-400 text-stone-950 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                          : 'bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <RotateCcw className={`w-4 h-4 ${isPlayerTurn ? 'animate-pulse' : ''}`} />
                      <span className="text-[11px] font-bold leading-none">{isPlayerTurn ? '结束回合' : '敌方回合'}</span>
                    </button>
                    <span className="text-[8px] text-stone-600 font-mono mt-1 tracking-widest uppercase">END ROUND</span>
                  </div>

                </div>

                {/* Potions list in battle */}
                <div className="flex flex-col items-center mt-2">
                  <span className="text-[10px] text-stone-500 tracking-wider">快捷魔具包 (生命水恢复)</span>
                  <div className="flex flex-wrap justify-center gap-2 mt-1.5" id="battle_potions_deck">
                    {getPotionList().length > 0 ? (
                      getPotionList().map((pot, idx) => (
                        <button
                          key={pot.instanceId || `${pot.id}-${idx}`}
                          id={`btn_drink_${pot.instanceId || pot.id}`}
                          onClick={() => handleDrinkPotion(pot)}
                          className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/20 text-red-300 text-xs flex items-center gap-1 hover:border-red-500 cursor-pointer transition-all"
                        >
                          🧪 {pot.name} (恢复物)
                        </button>
                      ))
                    ) : (
                      <span className="text-[10px] text-stone-600">魔法包裹中没有任何可用的恢复剂。</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Combat state finished containers */
              <div className="text-center p-6 bg-stone-950 rounded-2xl border border-stone-800" id="finished_overlay_box">
                {winner === 'player' ? (
                  <div id="combat_win_block">
                    <h3 className="text-2xl font-black text-yellow-400">⚔️ 宿命大捷！击退魔物</h3>
                    <p className="text-xs text-stone-400 mt-1">完成了本次节点的探索阻碍，成功获得本层的战利品功绩！</p>
                    
                    <div className="my-6 grid grid-cols-2 gap-4 max-w-xs mx-auto text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-emerald-400 relative">
                        <div className="text-stone-500">金币奖励</div>
                        <div className="text-xl font-bold">
                          +{enemy.goldValue}
                          {activatedTalents.includes('t_gold') && (
                            <span className="block text-[8px] text-amber-500 font-sans tracking-wide animate-pulse mt-0.5">
                              (+{Math.round(enemy.goldValue * 0.15)} 贪婪契印)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-sky-400">
                        <div className="text-stone-500">经验积累</div>
                        <div className="text-xl font-bold">+{enemy.xpValue} XP</div>
                      </div>
                    </div>

                    <button
                      id="btn_victory_continue"
                      onClick={handleVictoryConfirm}
                      className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 shadow-md text-sm transition-all animate-pulse cursor-pointer"
                    >
                      领取战果 &amp; 返回探索
                    </button>
                  </div>
                ) : (
                  <div id="combat_loss_block">
                    <h3 className="text-2.5xl font-black text-red-500 flex items-center justify-center gap-2">
                      <AlertCircle className="w-7 h-7 text-red-500 animate-bounce" /> 
                      英魂折戟，长眠迷宫
                    </h3>
                    <p className="text-xs text-stone-400 mt-2 max-w-sm mx-auto leading-relaxed">
                      地牢大门在嘲笑无畏者，你的血迹已风干在冰冷的石板上。重整意志，继承前人经验去开启全新的宿命誓约吧！
                    </p>

                    <button
                      id="btn_defeat_restart"
                      onClick={onDefeat}
                      className="mt-6 px-8 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 hover:text-rose-400 border border-rose-500/20 text-stone-200 font-bold text-sm transition-all cursor-pointer flex items-center gap-2 mx-auto justify-center"
                    >
                      <RotateCcw className="w-4 h-4" /> 
                      重塑宿命誓约 (重新复活)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
