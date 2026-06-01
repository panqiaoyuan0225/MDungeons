/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  Crown
} from 'lucide-react';

interface BattleProps {
  playerStats: PlayerStats;
  enemy: Enemy;
  inventory: Item[];
  onUsePotion: (potionId: string) => void;
  onVictory: (xp: number, gold: number) => void;
  onDefeat: () => void;
  onEscape: () => void;
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

export default function Battle({
  playerStats,
  enemy,
  inventory,
  onUsePotion,
  onVictory,
  onDefeat,
  onEscape
}: BattleProps) {
  // Combat Local States
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [playerHp, setPlayerHp] = useState(playerStats.hp);
  const [playerMp, setPlayerMp] = useState(playerStats.mp);
  const [tempShield, setTempShield] = useState(0); // Mage Shield
  const [tempDef, setTempDef] = useState(playerStats.def); // Warrior temporary armor
  const [critMultiplier, setCritMultiplier] = useState(1); // Rogue poison/critical multiplier
  const [enemyWeakenedTurns, setEnemyWeakenedTurns] = useState(0); // Rogue poison turns
  const [enemyStunnedTurns, setEnemyStunnedTurns] = useState(0); // Warrior stun turns
  const [skill1Cooldown, setSkill1Cooldown] = useState(0); // Cooldown for Skill 1 (heavy defense or primary spell)
  const [skill2Cooldown, setSkill2Cooldown] = useState(0); // Cooldown for Skill 2 (elite/ultimate level skill)
  
  const [logs, setLogs] = useState<CombatLog[]>([]);
  const [isCombatFinished, setIsCombatFinished] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  
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
  const currentEnemyAttackValue = Math.max(1, Math.round(
    enemy.intent === 'ATTACK' && enemyWeakenedTurns > 0 
      ? enemy.intentValue * 0.7 
      : enemy.intentValue
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

  // Turn management
  const endTurn = (finalEnemyHp: number) => {
    if (finalEnemyHp <= 0) {
      setWinner('player');
      setIsCombatFinished(true);
      createSmoke('enemy');
      addLog(`🏆 胜利！你彻底净化了魔物「${enemy.name}」!`, 'victory');
      return;
    }

    // Apply stun or monster turn
    if (enemyStunnedTurns > 0) {
      setEnemyStunnedTurns(prev => prev - 1);
      addLog(`✨ 「${enemy.name}」处于击晕失神状态，本回合无法行动！`, 'info');
      // Decrement player status turn lengths
      if (enemyWeakenedTurns > 0) setEnemyWeakenedTurns(prev => prev - 1);
      
      // Turn passes back to the player immediately
      setSkill1Cooldown(prev => Math.max(0, prev - 1));
      setSkill2Cooldown(prev => Math.max(0, prev - 1));
      return;
    }

    // Enemy Turn simulation
    setTimeout(() => {
      setEnemyAttackAnimate(true);
      setPlayerHurtAnimate(true);
      createSparks('player');
      
      let finalPlayerHp = playerHp;
      let finalTempShield = tempShield;

      if (enemy.intent === 'ATTACK') {
        const damage = Math.max(1, currentEnemyAttackValue - tempDef);
        
        if (finalTempShield > 0) {
          if (finalTempShield >= damage) {
            finalTempShield -= damage;
            addLog(`🛡️ 你的魔力奥术护盾阻挡了全部 ${damage} 点攻击！`, 'player-heal');
          } else {
            const remainder = damage - finalTempShield;
            finalTempShield = 0;
            finalPlayerHp = Math.max(0, finalPlayerHp - remainder);
            addLog(`💥 敌人的攻击粉碎了你的魔法奥术护盾并对你造成了 ${remainder} 点物理重击！`, 'enemy-attack');
          }
        } else {
          finalPlayerHp = Math.max(0, finalPlayerHp - damage);
          addLog(`💥 「${enemy.name}」对你发出咆哮撕咬，造成了 ${damage} 点物理伤害。`, 'enemy-attack');
        }
      } else if (enemy.intent === 'DEFEND') {
        addLog(`🛡️ 「${enemy.name}」伏地咆哮，展开坚骨防御，防御力获得大幅提升！`, 'info');
      } else if (enemy.intent === 'HEAL') {
        const healAmt = enemy.intentValue;
        setEnemyHp(prev => Math.min(enemy.maxHp, prev + healAmt));
        addLog(`💚 「${enemy.name}」贪婪地吸血魔气，自身恢复了 ${healAmt} 点生命。`, 'enemy-heal');
      } else {
        addLog(`🧪 「${enemy.name}」正在口吐深渊迷雾，战力状态增强。`, 'info');
      }

      setTempShield(finalTempShield);
      setPlayerHp(finalPlayerHp);

      // Decrement turn counters
      if (enemyWeakenedTurns > 0) setEnemyWeakenedTurns(prev => prev - 1);
      
      // Check if player died
      if (finalPlayerHp <= 0) {
        setWinner('enemy');
        setIsCombatFinished(true);
        createSmoke('player');
        addLog(`💀 败北... 你的灵魂逐渐消逝在深渊黑暗之中...`, 'defeat');
      }

      // Restore temp stats to base for next player turn
      setTempDef(playerStats.def);

      // Reset animation keys
      setTimeout(() => {
        setEnemyAttackAnimate(false);
        setPlayerHurtAnimate(false);
        
        // Turn transitions cleanly back to the player
        setSkill1Cooldown(prev => Math.max(0, prev - 1));
        setSkill2Cooldown(prev => Math.max(0, prev - 1));
      }, 400);

    }, 600);
  };

  // Basic Action Hook
  const handleBasicAttack = () => {
    if (isCombatFinished) return;
    setPlayerAttackAnimate(true);
    setEnemyHurtAnimate(true);
    createSkillEffect('slash', 'enemy');

    const dmg = Math.max(1, Math.round((playerStats.atk * critMultiplier) - enemy.def));
    const nextEnemyHp = Math.max(0, enemyHp - dmg);
    
    setEnemyHp(nextEnemyHp);
    addLog(`⚔️ 你施展普通斩击，对「${enemy.name}」造成了 ${dmg} 点物理打击！`, 'player-attack');

    // Reset crits
    if (critMultiplier > 1) {
      setCritMultiplier(1);
    }

    setTimeout(() => {
      setPlayerAttackAnimate(false);
      setEnemyHurtAnimate(false);
      endTurn(nextEnemyHp);
    }, 400);
  };

  // Skill Activations
  const handleCastSkill = (skillIndex: number) => {
    if (isCombatFinished) return;

    // Cooldown Validation Gate
    if (skillIndex === 1 && skill1Cooldown > 0) return;
    if (skillIndex === 2 && skill2Cooldown > 0) return;

    if (playerStats.classType === CharacterClass.WARRIOR) {
      if (skillIndex === 1) {
        // Skill 2: 重盾格挡 (8 MP)
        if (playerMp < 8) return;
        setSkill1Cooldown(2); // 2 turn cooldown
        setPlayerMp(prev => prev - 8);
        setTempDef(playerStats.def * 2);
        const healAmt = Math.round((playerStats.maxHp - playerHp) * 0.15);
        setPlayerHp(prev => Math.min(playerStats.maxHp, prev + healAmt));
        createSkillEffect('shield', 'player');
        addLog(`🛡️ 施展【重盾格挡】：防御防线翻倍达到 ${playerStats.def * 2}！额外恢复 ${healAmt} 点生命值。`, 'player-heal');
        endTurn(enemyHp);
      } else if (skillIndex === 2) {
        // Skill 3: 圣光裁决 (15 MP)
        if (playerMp < 15) return;
        setSkill2Cooldown(3); // 3 turn cooldown
        setPlayerMp(prev => prev - 15);
        setPlayerAttackAnimate(true);
        setEnemyHurtAnimate(true);
        createSkillEffect('holy', 'enemy');
        
        const dmg = Math.max(1, Math.round((playerStats.atk * 2.2) - enemy.def));
        const nextEnemyHp = Math.max(0, enemyHp - dmg);
        setEnemyHp(nextEnemyHp);
        setEnemyStunnedTurns(1);
        
        addLog(`✨ 吟唱圣歌！【圣光裁决】对「${enemy.name}」造成 ${dmg} 点辉耀惩戒！并震慑眩晕其 1 回合！`, 'player-attack');
        
        setTimeout(() => {
          setPlayerAttackAnimate(false);
          setEnemyHurtAnimate(false);
          endTurn(nextEnemyHp);
        }, 400);
      }
    } else if (playerStats.classType === CharacterClass.MAGE) {
      if (skillIndex === 1) {
        // Skill 2: 红莲火球 (12 MP)
        if (playerMp < 12) return;
        setSkill1Cooldown(2); // 2 turn cooldown
        setPlayerMp(prev => prev - 12);
        setPlayerAttackAnimate(true);
        setEnemyHurtAnimate(true);
        createSkillEffect('fireball', 'enemy');

        const dmg = Math.max(1, Math.round((playerStats.atk * 2.0) - enemy.def));
        const nextEnemyHp = Math.max(0, enemyHp - dmg);
        setEnemyHp(nextEnemyHp);

        addLog(`🔥 热量爆裂！【红莲火球】撞向「${enemy.name}」，引发轰鸣大爆炸，造成 ${dmg} 点毁灭性火伤！`, 'player-attack');

        setTimeout(() => {
          setPlayerAttackAnimate(false);
          setEnemyHurtAnimate(false);
          endTurn(nextEnemyHp);
        }, 400);
      } else if (skillIndex === 2) {
        // Skill 3: 奥术护盾 (20 MP)
        if (playerMp < 20) return;
        setSkill2Cooldown(3); // 3 turn cooldown
        setPlayerMp(prev => prev - 20);
        setTempShield(prev => prev + 50);
        createSkillEffect('arcane', 'player');
        addLog(`🔮 启动符文护盾！【奥术护盾】已生成 50 点临时生命屏障防御。`, 'player-heal');
        endTurn(enemyHp);
      }
    } else if (playerStats.classType === CharacterClass.ROGUE) {
      if (skillIndex === 1) {
        // Skill 2: 匿迹伏击 (10 MP)
        if (playerMp < 10) return;
        setSkill1Cooldown(2); // 2 turn cooldown
        setPlayerMp(prev => prev - 10);
        setCritMultiplier(2.5);
        createSkillEffect('shadow', 'player');
        addLog(`🌫️ 遁入虚空，施展【匿迹伏击】：下一击物理刀斩将获得 2.5 倍致命伤害倍率！`, 'info');
        endTurn(enemyHp);
      } else if (skillIndex === 2) {
        // Skill 3: 致残剧毒 (15 MP)
        if (playerMp < 15) return;
        setSkill2Cooldown(3); // 3 turn cooldown
        setPlayerMp(prev => prev - 15);
        setPlayerAttackAnimate(true);
        setEnemyHurtAnimate(true);
        createSkillEffect('poison', 'enemy');

        const dmg = Math.max(1, Math.round((playerStats.atk * 1.5) - enemy.def));
        const nextEnemyHp = Math.max(0, enemyHp - dmg);
        setEnemyHp(nextEnemyHp);
        setEnemyWeakenedTurns(2);

        addLog(`🧪 双刃流毒！对「${enemy.name}」打出【致残剧毒】，造成 ${dmg} 点毒素穿透伤害！其神经受损，伤害被重创削弱 30% 持续二回合！`, 'player-attack');

        setTimeout(() => {
          setPlayerAttackAnimate(false);
          setEnemyHurtAnimate(false);
          endTurn(nextEnemyHp);
        }, 400);
      }
    }
  };

  // Drink healing Potion during combat
  const handleDrinkPotion = (potion: Item) => {
    if (isCombatFinished) return;
    
    onUsePotion(potion.id);
    
    let healAmt = 30;
    if (potion.id === 's_pot_2') {
      healAmt = 60;
      setPlayerMp(prev => Math.min(playerStats.maxMp, prev + 40));
      addLog(`🧪 你喝下【中型全能恢复剂】，生命恢复 ${healAmt}，法力恢复 40！`, 'player-heal');
    } else if (potion.id === 's_pot_3') {
      healAmt = playerStats.maxHp - playerHp;
      setPlayerHp(playerStats.maxHp);
      addLog(`✨ 你喝下【古代不老泉永生汁】，瞬间恢复 100% 全部生命！获得极地祝福！`, 'player-heal');
      return;
    } else {
      addLog(`🧪 你喝下【小型生命药水】，生命值恢复 ${healAmt} 点。`, 'player-heal');
    }

    setPlayerHp(prev => Math.min(playerStats.maxHp, prev + healAmt));
  };

  // Post Combat Victors
  const handleVictoryConfirm = () => {
    onVictory(enemy.xpValue, enemy.goldValue);
  };

  const getPotionList = () => {
    return inventory.filter(i => i.type === ItemType.POTION);
  };

  // Generate immersive retro card deck dynamically based on character stats and class
  const getSkillCards = (): SkillCardData[] => {
    const basicCard: SkillCardData = {
      id: 'btn_battle_use_atk',
      name: '普通斩击',
      mpCost: 0,
      cooldown: 0,
      maxCooldown: 0,
      description: '运用手中武器对眼前的魔物发起普通挥砍斩击，造成物理基础伤害。',
      icon: <Sword className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-amber-400" />,
      colorClasses: 'border-zinc-700 hover:border-amber-500 bg-gradient-to-b from-stone-900 to-stone-950/45 text-amber-100 shadow-[0_8px_20px_rgba(0,0,0,0.4)]',
      iconContainerClass: 'bg-stone-850 border-stone-700 text-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      action: handleBasicAttack
    };

    if (playerStats.classType === CharacterClass.WARRIOR) {
      return [
        basicCard,
        {
          id: 'btn_warrior_skill_1',
          name: '重盾格挡',
          mpCost: 8,
          cooldown: skill1Cooldown,
          maxCooldown: 2,
          description: '举起沉重的金刚盾牌防御，使自身防御翻倍吸盾，并自愈恢复 15% 的损失生命值。',
          icon: <ShieldAlert className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-sky-400" />,
          colorClasses: 'border-sky-900/60 hover:border-sky-400 bg-gradient-to-b from-stone-900 to-sky-950/20 text-sky-100 shadow-[0_8px_20px_rgba(14,165,233,0.15)]',
          iconContainerClass: 'bg-sky-950/40 border-sky-800/40 text-sky-400 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.35)]',
          action: () => handleCastSkill(1)
        },
        {
          id: 'btn_warrior_skill_2',
          name: '圣光裁决',
          mpCost: 15,
          cooldown: skill2Cooldown,
          maxCooldown: 3,
          description: '召唤天界强耀圣光！对魔物重创造成 2.2 倍强幅伤害，并利用辉耀恐吓眩晕目标 1 回合！',
          icon: <Sparkles className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-purple-400" />,
          colorClasses: 'border-purple-900/60 hover:border-purple-400 bg-gradient-to-b from-stone-900 to-purple-950/20 text-purple-100 shadow-[0_8px_20px_rgba(168,85,247,0.15)]',
          iconContainerClass: 'bg-purple-950/40 border-purple-800/40 text-purple-400 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.35)]',
          action: () => handleCastSkill(2)
        }
      ];
    } else if (playerStats.classType === CharacterClass.MAGE) {
      return [
        basicCard,
        {
          id: 'btn_mage_skill_1',
          name: '红莲火球',
          mpCost: 12,
          cooldown: skill1Cooldown,
          maxCooldown: 2,
          description: '吟唱狂暴的爆烈炎能红莲投向对手，引发震耳大爆炸造成 2.0 倍致命魔法炎能轰击。',
          icon: <Flame className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-orange-400" />,
          colorClasses: 'border-orange-900/60 hover:border-orange-400 bg-gradient-to-b from-stone-900 to-orange-950/20 text-orange-100 shadow-[0_8px_20px_rgba(249,115,22,0.15)]',
          iconContainerClass: 'bg-orange-950/40 border-orange-800/40 text-orange-400 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.35)]',
          action: () => handleCastSkill(1)
        },
        {
          id: 'btn_mage_skill_2',
          name: '奥术护盾',
          mpCost: 20,
          cooldown: skill2Cooldown,
          maxCooldown: 3,
          description: '凭空塑构奥之粒子，凝聚远古奥术圣辉，立刻为己身形成 50 点承受伤害的虚实法术结界。',
          icon: <Zap className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-blue-400" />,
          colorClasses: 'border-blue-900/60 hover:border-blue-400 bg-gradient-to-b from-stone-900 to-blue-950/20 text-blue-100 shadow-[0_8px_20px_rgba(59,130,246,0.15)]',
          iconContainerClass: 'bg-blue-950/40 border-blue-800/40 text-blue-400 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.35)]',
          action: () => handleCastSkill(2)
        }
      ];
    } else {
      // ROGUE
      return [
        basicCard,
        {
          id: 'btn_rogue_skill_1',
          name: '匿迹伏击',
          mpCost: 10,
          cooldown: skill1Cooldown,
          maxCooldown: 2,
          description: '隐入尘俗暗影，潜行激发致命刀锋，使下一回合的挥斩利刃斩杀享有巨大的 2.5 倍暴伤伤害。',
          icon: <Compass className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-indigo-400" />,
          colorClasses: 'border-indigo-900/60 hover:border-indigo-400 bg-gradient-to-b from-stone-900 to-indigo-950/20 text-indigo-100 shadow-[0_8px_20px_rgba(99,102,241,0.15)]',
          iconContainerClass: 'bg-indigo-950/40 border-indigo-800/40 text-indigo-400 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.35)]',
          action: () => handleCastSkill(1)
        },
        {
          id: 'btn_rogue_skill_2',
          name: '致残剧毒',
          mpCost: 15,
          cooldown: skill2Cooldown,
          maxCooldown: 3,
          description: '在刺毒上施敷腐尸致残毒，穿刺造成 1.5 倍剧毒伤害，导致其气脉虚弱二回合，伤害输出降 30%。',
          icon: <Activity className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-teal-400" />,
          colorClasses: 'border-teal-900/60 hover:border-teal-400 bg-gradient-to-b from-stone-900 to-teal-950/20 text-teal-100 shadow-[0_8px_20px_rgba(20,184,166,0.15)]',
          iconContainerClass: 'bg-teal-950/40 border-teal-800/40 text-teal-400 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.35)]',
          action: () => handleCastSkill(2)
        }
      ];
    }
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
            className="w-full rounded-2xl overflow-hidden relative shadow-2xl border border-stone-800/50 flex flex-col justify-between transition-all duration-100"
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
              {/* Retro Pixel Sparks Particle Overlays */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-30" id="particle_overlay_pane">
                {particles.map((p) => (
                  <div
                    key={p.id}
                    className="absolute"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: p.width !== undefined ? `${p.width}px` : `${p.size}px`,
                      height: p.height !== undefined ? `${p.height}px` : `${p.size}px`,
                      backgroundColor: p.color,
                      opacity: p.life,
                      borderRadius: p.borderRadius || (p.isSmoke ? '50%' : '2px'),
                      transform: p.rotate !== undefined ? `rotate(${p.rotate}deg)` : undefined,
                      boxShadow: p.boxShadow || (p.isSmoke ? 'none' : `0 0 ${p.size * 2}px ${p.color}`),
                      filter: p.filter || (p.isSmoke ? 'blur(1.5px)' : 'none'),
                    }}
                  />
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

              {/* Right Side: Enemy Character */}
              <div 
                className={`absolute right-[5%] bottom-[5%] md:right-[10%] flex flex-col items-center transition-all ${
                  winner === 'player' 
                    ? 'opacity-0 scale-[0.6] pointer-events-none duration-1000' 
                    : 'duration-300'
                } ${
                  enemyAttackAnimate ? '-translate-x-[60px] scale-110 z-20' : 'z-10'
                } ${
                  enemyHurtAnimate ? 'animate-bounce saturate-150 brightness-125' : ''
                }`}
                style={{ filter: enemyHurtAnimate ? 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.9))' : 'none' }}
                id="viewport_enemy"
              >
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
                {/* Immersive Skill Card Hands */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-2xl mx-auto px-1 md:px-0 w-full" id="battle_skills_deck_cards">
                  {getSkillCards().map((card) => {
                    const isDisabled = playerMp < card.mpCost || card.cooldown > 0;
                    return (
                      <div
                        key={card.id}
                        id={card.id}
                        onClick={() => {
                          if (!isDisabled) {
                            card.action();
                          }
                        }}
                        className={`w-full min-h-[145px] md:min-h-[195px] rounded-xl border p-2 md:p-4 flex flex-col justify-between text-center relative select-none transition-all duration-300 md:hover:-translate-y-2 group ${card.colorClasses} ${isDisabled ? 'cursor-not-allowed opacity-50 shadow-none' : 'cursor-pointer active:scale-95'}`}
                      >
                        {/* Mana Cost Badge */}
                        {card.mpCost > 0 && (
                          <div className={`absolute top-1.5 right-1.5 md:top-2 md:right-2 border px-1 md:px-1.5 py-0.5 rounded-md font-mono text-[8px] md:text-[10px] font-bold z-10 ${playerMp >= card.mpCost ? 'bg-blue-950/80 border-blue-500/30 text-blue-300' : 'bg-red-950/80 border-red-500/30 text-red-300'}`}>
                            {card.mpCost} MP
                          </div>
                        )}

                        {/* Card Content */}
                        <div className="flex flex-col items-center flex-grow">
                          {/* Radial Glow Container for Icon */}
                          <div className={`w-8 h-8 md:w-11 md:h-11 rounded-full border flex items-center justify-center mx-auto mt-1 mb-1.5 md:mb-2 shadow-inner group-hover:scale-105 transition-transform ${card.iconContainerClass}`}>
                            {card.icon}
                          </div>

                          {/* Skill Main Title */}
                          <h4 className="text-[10px] md:text-xs lg:text-sm font-black tracking-wider transition-colors duration-200">
                            {card.name}
                          </h4>

                          {/* Subtitle Badge */}
                          <span className="text-[7.5px] md:text-[9px] text-stone-500 tracking-widest mt-0.5 uppercase">
                            {card.mpCost === 0 ? '「 基础 」' : '「 绝学 」'}
                          </span>

                          {/* Description Text */}
                          <p className="text-[8.5px] md:text-[11px] text-stone-400 leading-normal mt-1 md:mt-2 font-sans flex-grow line-clamp-3 md:line-clamp-none pl-0.5 pr-0.5">
                            {card.description}
                          </p>
                        </div>

                        {/* Bottom Status action indicator under the card */}
                        <div className="mt-1 pb-0.5 text-[8px] md:text-[10px] font-bold select-none border-t border-stone-850/50 pt-1 md:pt-1.5">
                          {card.cooldown > 0 ? (
                            <span className="text-amber-500 flex items-center justify-center gap-1">
                              ⏳ 冷却中 ({card.cooldown} 回放)
                            </span>
                          ) : playerMp < card.mpCost ? (
                            <span className="text-rose-450">
                              ⚠️ 灵能不足
                            </span>
                          ) : (
                            <span className="text-stone-500 group-hover:text-amber-400 transition-colors uppercase">
                              ⚡ 点击施印
                            </span>
                          )}
                        </div>

                        {/* Cooldown Overlay */}
                        {card.cooldown > 0 && (
                          <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-[0.5px] rounded-xl flex flex-col items-center justify-center z-20">
                            <div className="text-xl md:text-3xl font-extrabold text-amber-500 font-mono tracking-tighter mb-0.5">
                              {card.cooldown}
                            </div>
                            <span className="text-[7px] md:text-[10px] font-bold text-stone-400 tracking-wider">
                              冷却中 (回合)
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                      <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-emerald-400">
                        <div className="text-stone-500">金币奖励</div>
                        <div className="text-xl font-bold">+{enemy.goldValue}</div>
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
