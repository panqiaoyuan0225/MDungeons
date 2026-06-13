/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameDifficulty = 'NORMAL' | 'HARD' | 'APOCALYPSE' | 'NIGHTMARE';

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
  activatedTalents?: string[]; // 激活的誓约命印 id 列表
  soulShards?: number; // 魂石碎片,用于洗炼和铁匠铺升级
  ascendedClass?: string; // 觉醒转职称号, e.g., '圣骑士', '残虐狂战', '混沌炼金'
  difficulty?: GameDifficulty;
  deck?: string[]; // 玩家当前的卡组/技能池
  starterSchool?: string; // 玩家初始流派选择
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
  forgeLevel?: number; // 铁匠强化等级 (+1, +2, +3)
  setName?: string; // 所属套装名, e.g. '亡誓骑士', '先锋合金', '深渊黑焰', '造物神话'
}

export enum NodeType {
  START = 'START',
  COMBAT = 'COMBAT',
  ELITE = 'ELITE',
  BOSS = 'BOSS',
  SHOP = 'SHOP',
  EVENT = 'EVENT',
  TREASURE = 'TREASURE',
  MIST_RUINS = 'MIST_RUINS',
  WANDERING_MERCHANT = 'WANDERING_MERCHANT',
  CAGE_CHALLENGE = 'CAGE_CHALLENGE',
  SOUL_ALTAR = 'SOUL_ALTAR',
  SANCTUARY = 'SANCTUARY',
  ARMORY = 'ARMORY',
  MINE = 'MINE',
  ABYSS = 'ABYSS',
  MIRROR = 'MIRROR',
  MIMIC = 'MIMIC'
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
  activatedTalents?: string[];
}
