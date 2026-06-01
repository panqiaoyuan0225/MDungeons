/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CharacterClass {
  WARRIOR = 'WARRIOR',
  MAGE = 'MAGE',
  ROGUE = 'ROGUE'
}

export interface PlayerStats {
  classType: CharacterClass;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  level: number;
  exp: number;
  expToNextLevel: number;
  gold: number;
  title: string; // 阶级/称号 e.g. 青铜冒险者, 白银先锋, 黄金战神...
}

export enum ItemTier {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  ACCESSORY = 'ACCESSORY',
  POTION = 'POTION'
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  tier: ItemTier;
  cost: number;
  hpBonus?: number;
  mpBonus?: number;
  atkBonus?: number;
  defBonus?: number;
  description: string;
  icon: string;
  isEquipped?: boolean;
  instanceId?: string;
}

export enum NodeType {
  START = 'START',
  COMBAT = 'COMBAT',
  ELITE = 'ELITE',
  BOSS = 'BOSS',
  SHOP = 'SHOP',
  EVENT = 'EVENT',
  TREASURE = 'TREASURE'
}

export interface DungeonNode {
  id: string;
  name: string;
  type: NodeType;
  floor: number; // For scaling difficulty
  x: number;     // Mapping coordinate
  y: number;     // Mapping coordinate
  connections: string[]; // Neighbor node IDs (outward paths)
  status: 'locked' | 'available' | 'completed';
  enemyId?: string; // Optional specifier of which monster
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  intent: 'ATTACK' | 'DEFEND' | 'HEAL' | 'BUFF';
  intentValue: number;
  intentTurns: number;
  xpValue: number;
  goldValue: number;
  icon: string;
  isBoss: boolean;
  isElite: boolean;
  image?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
  rewardType: 'gold' | 'stat' | 'item';
  rewardValue: number; // e.g. gold amount, stats upgrade percent
  rewardName: string;
}

export interface CombatLog {
  id: string;
  text: string;
  type: 'player-attack' | 'player-heal' | 'enemy-attack' | 'enemy-heal' | 'info' | 'victory' | 'defeat';
}

export interface GameState {
  playerStats: PlayerStats | null;
  equippedItems: Item[];
  inventory: Item[];
  dungeonFloor: number; // Currently on layer 1, 2, 3
  dungeonNodes: DungeonNode[];
  currentNodeId: string | null;
  achievements: Achievement[];
  highScore: number;
  goldSpent: number;
  monstersSlain: number;
  maxLevelReached: number;
}
