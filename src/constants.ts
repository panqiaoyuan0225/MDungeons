/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CharacterClass, PlayerStats, Item, ItemType, ItemTier, Achievement, Enemy, NodeType, DungeonNode } from './types';

export const INITIAL_PLAYER_STATS: Record<CharacterClass, PlayerStats> = {
  [CharacterClass.WARRIOR]: {
    classType: CharacterClass.WARRIOR,
    hp: 120,
    maxHp: 120,
    mp: 30,
    maxMp: 30,
    atk: 12,
    def: 6,
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    gold: 150,
    title: '亡誓骑士',
    activatedTalents: [],
    soulShards: 15,
    ascendedClass: ''
  },
  [CharacterClass.MAGE]: {
    classType: CharacterClass.MAGE,
    hp: 80,
    maxHp: 80,
    mp: 100,
    maxMp: 100,
    atk: 18,
    def: 2,
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    gold: 150,
    title: '魔法学徒',
    activatedTalents: [],
    soulShards: 15,
    ascendedClass: ''
  },
  [CharacterClass.ROGUE]: {
    classType: CharacterClass.ROGUE,
    hp: 95,
    maxHp: 95,
    mp: 50,
    maxMp: 50,
    atk: 15,
    def: 4,
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    gold: 180,
    title: '林影游荡者',
    activatedTalents: [],
    soulShards: 15,
    ascendedClass: ''
  }
};

export const CLASS_IMAGES: Record<CharacterClass, string> = {
  [CharacterClass.WARRIOR]: '/src/assets/images/clean_black_warrior_1780282776044.png',
  [CharacterClass.MAGE]: '/src/assets/images/clean_black_mage_1780282760267.png',
  [CharacterClass.ROGUE]: '/src/assets/images/clean_black_rogue_1780282793042.png'
};

export function getPlayerTitle(classType: CharacterClass, level: number): string {
  if (classType === CharacterClass.WARRIOR) {
    if (level <= 2) return '亡誓骑士 (T4)';
    if (level <= 4) return '誓言审判领主 (T3)';
    if (level <= 6) return '破晓守护者 (T2)';
    return '不朽英灵战神 (T1)';
  } else if (classType === CharacterClass.MAGE) {
    if (level <= 2) return '魔法学徒 (T4)';
    if (level <= 4) return '极光塑能学士 (T3)';
    if (level <= 6) return '混沌织梦贤者 (T2)';
    return '禁忌不灭大法皇 (T1)';
  } else {
    if (level <= 2) return '林影游荡者 (T4)';
    if (level <= 4) return '深渊隐刃刺客 (T3)';
    if (level <= 6) return '暗幽魅影行者 (T2)';
    return '暗夜瞬杀主宰 (T1)';
  }
}

// Complete lists of buyable shop items
export const SHOP_ITEMS: Item[] = [
  {
    id: 's_wpn_1',
    name: '生锈的铁剑',
    type: ItemType.WEAPON,
    tier: ItemTier.COMMON,
    cost: 40,
    atkBonus: 4,
    description: '虽然锈迹斑斑，但总比赤手空拳好。',
    icon: 'Sword',
    setName: '亡誓骑士'
  },
  {
    id: 's_wpn_2',
    name: '先锋合金大剑',
    type: ItemType.WEAPON,
    tier: ItemTier.RARE,
    cost: 110,
    atkBonus: 10,
    defBonus: 2,
    description: '重型合金，适合劈砍与格挡。',
    icon: 'Sword',
    setName: '先锋合金'
  },
  {
    id: 's_wpn_3',
    name: '巨龙怒血利刃',
    type: ItemType.WEAPON,
    tier: ItemTier.EPIC,
    cost: 240,
    atkBonus: 22,
    hpBonus: 15,
    description: '注入了火龙沸腾之血，剑身隐隐发烫。',
    icon: 'Flame',
    setName: '深渊黑焰'
  },
  {
    id: 's_wpn_4',
    name: '阿斯加德誓约神之剑',
    type: ItemType.WEAPON,
    tier: ItemTier.LEGENDARY,
    cost: 450,
    atkBonus: 45,
    defBonus: 10,
    hpBonus: 30,
    description: '北欧神国领主的配剑，散发着夺目光辉与绝对神性威压。',
    icon: 'ShieldAlert',
    setName: '造物神话'
  },
  {
    id: 's_amr_1',
    name: '破旧的棉甲',
    type: ItemType.ARMOR,
    tier: ItemTier.COMMON,
    cost: 35,
    defBonus: 3,
    description: '多层棉线编织，提供最基础的手感保护。',
    icon: 'Shield',
    setName: '亡誓骑士'
  },
  {
    id: 's_amr_2',
    name: '轻量化锁子甲',
    type: ItemType.ARMOR,
    tier: ItemTier.RARE,
    cost: 100,
    defBonus: 7,
    hpBonus: 10,
    description: '金属环环环相扣，虽然重，但极其坚韧。',
    icon: 'Shield',
    setName: '先锋合金'
  },
  {
    id: 's_amr_3',
    name: '恶魔骨甲',
    type: ItemType.ARMOR,
    tier: ItemTier.EPIC,
    cost: 220,
    defBonus: 16,
    hpBonus: 25,
    description: '由深渊恶魔的脊椎骨打磨而成，穿上能听到低声咆哮。',
    icon: 'Shield',
    setName: '深渊黑焰'
  },
  {
    id: 's_amr_4',
    name: '永恒炽天使壁垒',
    type: ItemType.ARMOR,
    tier: ItemTier.LEGENDARY,
    cost: 420,
    defBonus: 30,
    hpBonus: 60,
    description: '受到大天使加持的神甲，阻断尘世所有物理与魔法伤害。',
    icon: 'Sparkles',
    setName: '造物神话'
  },
  {
    id: 's_acc_1',
    name: '古银吊坠',
    type: ItemType.ACCESSORY,
    tier: ItemTier.COMMON,
    cost: 50,
    mpBonus: 15,
    description: '陈旧的银戒指雕花吊坠，带有一丝丝微弱的魔力。',
    icon: 'Gem',
    setName: '亡誓骑士'
  },
  {
    id: 's_acc_2',
    name: '贤者之石怀表',
    type: ItemType.ACCESSORY,
    tier: ItemTier.RARE,
    cost: 120,
    mpBonus: 40,
    atkBonus: 3,
    description: '内含细碎的贤者之石粉末，魔法共鸣强烈。',
    icon: 'Clock',
    setName: '先锋合金'
  },
  {
    id: 's_acc_3',
    name: '深海亡灵海蓝之心',
    type: ItemType.ACCESSORY,
    tier: ItemTier.EPIC,
    cost: 250,
    mpBonus: 80,
    hpBonus: 20,
    atkBonus: 10,
    description: '来自无光深海，幽凉的魔力时刻洗涤契约者的灵魂。',
    icon: 'Gem',
    setName: '深渊黑焰'
  },
  {
    id: 's_acc_4',
    name: '造物主之混沌指环',
    type: ItemType.ACCESSORY,
    tier: ItemTier.LEGENDARY,
    cost: 480,
    mpBonus: 150,
    atkBonus: 20,
    defBonus: 15,
    description: '创世神留下的无上仙器，扭转空间，汇聚宇宙至理。',
    icon: 'Activity',
    setName: '造物神话'
  },
  {
    id: 's_pot_1',
    name: '小型生命药水',
    type: ItemType.POTION,
    tier: ItemTier.COMMON,
    cost: 15,
    description: '恢复30点生命值。地牢冒险常备物资。',
    icon: 'Heart'
  },
  {
    id: 's_pot_2',
    name: '中型全能恢复剂',
    type: ItemType.POTION,
    tier: ItemTier.RARE,
    cost: 40,
    description: '恢复60点生命值与40点法术值。',
    icon: 'Sparkles'
  },
  {
    id: 's_pot_3',
    name: '古代不老泉永生汁',
    type: ItemType.POTION,
    tier: ItemTier.EPIC,
    cost: 85,
    description: '完全恢复生命的100%并提供永久生命上限+5。',
    icon: 'HeartHandshake'
  },
  {
    id: 'g_void_scroll',
    name: '虚无法卷',
    type: ItemType.POTION,
    tier: ItemTier.EPIC,
    cost: 45,
    description: '【战术道具】使用后立即在战斗中获得 2 回合强大的虚无圣盾（+60点临时护甲屏障）。',
    icon: 'BookOpen'
  },
  {
    id: 'g_frost_bomb',
    name: '冰霜手雷',
    type: ItemType.POTION,
    tier: ItemTier.RARE,
    cost: 35,
    description: '【战术道具】投掷冰爆冰封冻结魔物 1 回合（使其无法行动，且护甲清零！）。',
    icon: 'ShieldX'
  },
  {
    id: 'g_rage_elixir',
    name: '怒血狂暴药剂',
    type: ItemType.POTION,
    tier: ItemTier.EPIC,
    cost: 50,
    description: '【战术道具】饮下怒血，极大地激发灵魂潜能，使接下来的 3 回合必定造成 2.5 倍物理与法术暴击伤害！',
    icon: 'Flame'
  }
];

export const NORMAL_MONSTERS_F1: Partial<Enemy>[] = [
  { id: 'm_f1_1', name: '尸僧', hp: 27, maxHp: 27, atk: 5, def: 1, icon: 'Ghost', xpValue: 15, goldValue: 12, image: '/src/assets/images/pixel_skeleton_img_1780280517629.png' },
  { id: 'm_f1_2', name: '游荡骨弓兵', hp: 35, maxHp: 35, atk: 7, def: 2, icon: 'Ghost', xpValue: 15, goldValue: 12, image: '/src/assets/images/pixel_skeleton_img_1780280517629.png' },
  { id: 'm_f1_3', name: '地牢红眼角蝠', hp: 30, maxHp: 30, atk: 5, def: 1, icon: 'Plane', xpValue: 12, goldValue: 10, image: '/src/assets/images/clean_black_bat_1780282808183.png' }
];

export const ELITE_MONSTERS_F1: Partial<Enemy>[] = [
  { id: 'e_f1_1', name: '幽冥重锤精锐骑士', hp: 60, maxHp: 60, atk: 10, def: 4, icon: 'ShieldAlert', xpValue: 35, goldValue: 30, isElite: true, image: '/src/assets/images/pixel_elite_knight_img_1780280530399.png' },
  { id: 'e_f1_2', name: '邪焰骷髅法师', hp: 50, maxHp: 50, atk: 13, def: 1, icon: 'Zap', xpValue: 30, goldValue: 28, isElite: true, image: '/src/assets/images/pixel_skull_mage_1780281728292.png' }
];

export const BOSS_F1: Enemy = {
  id: 'b_f1',
  name: '熔岩审判地狱犬 (第一层守领)',
  hp: 130,
  maxHp: 130,
  atk: 16,
  def: 6,
  intent: 'ATTACK',
  intentValue: 16,
  intentTurns: 1,
  xpValue: 150,
  goldValue: 100,
  icon: 'Flame',
  isBoss: true,
  isElite: false,
  image: '/src/assets/images/pixel_cerberus_1780281698380.png'
};

export const NORMAL_MONSTERS_F2: Partial<Enemy>[] = [
  { id: 'm_f2_1', name: '无头死士僵尸', hp: 65, maxHp: 65, atk: 12, def: 4, icon: 'Ghost', xpValue: 30, goldValue: 20, image: '/src/assets/images/pixel_zombie_1780281395636.png' },
  { id: 'm_f2_2', name: '毒藤伏地兽', hp: 58, maxHp: 58, atk: 10, def: 5, icon: 'Leaf', xpValue: 25, goldValue: 18, image: '/src/assets/images/pixel_ivy_beast_1780281743749.png' },
  { id: 'm_f2_3', name: '嗜血穴蛛灵', hp: 55, maxHp: 55, atk: 11, def: 3, icon: 'Activity', xpValue: 22, goldValue: 22, image: '/src/assets/images/pixel_cave_spider_1780281759329.png' }
];

export const ELITE_MONSTERS_F2: Partial<Enemy>[] = [
  { id: 'e_f2_1', name: '诅咒巨岩傀儡', hp: 95, maxHp: 95, atk: 18, def: 10, icon: 'Dices', xpValue: 60, goldValue: 45, isElite: true, image: '/src/assets/images/pixel_golem_1780281411284.png' },
  { id: 'e_f2_2', name: '噬魂红莲妖姬', hp: 80, maxHp: 80, atk: 22, def: 5, icon: 'Zap', xpValue: 55, goldValue: 40, isElite: true, image: '/src/assets/images/pixel_fire_demon_1780281425523.png' }
];

export const BOSS_F2: Enemy = {
  id: 'b_f2',
  name: '幽海死灵巫师之王 (第二层守领)',
  hp: 240,
  maxHp: 240,
  atk: 25,
  def: 12,
  intent: 'ATTACK',
  intentValue: 25,
  intentTurns: 1,
  xpValue: 300,
  goldValue: 200,
  icon: 'Skull',
  isBoss: true,
  isElite: false,
  image: '/src/assets/images/pixel_lich_king_1780281712730.png'
};

export const NORMAL_MONSTERS_F3: Partial<Enemy>[] = [
  { id: 'm_f3_1', name: '遗迹充能兵马俑', hp: 100, maxHp: 100, atk: 18, def: 8, icon: 'Shield', xpValue: 50, goldValue: 35, image: '/src/assets/images/pixel_terracotta_1780281773838.png' },
  { id: 'm_f3_2', name: '地狱熔火恶魔', hp: 90, maxHp: 90, atk: 22, def: 6, icon: 'Flame', xpValue: 45, goldValue: 32, image: '/src/assets/images/pixel_fire_demon_1780281425523.png' },
  { id: 'm_f3_3', name: '深渊飞空掠夺者', hp: 85, maxHp: 85, atk: 20, def: 7, icon: 'Plane', xpValue: 40, goldValue: 30, image: '/src/assets/images/pixel_red_bat_1780281378507.png' }
];

export const ELITE_MONSTERS_F3: Partial<Enemy>[] = [
  { id: 'e_f3_1', name: '堕落审判长骑士', hp: 130, maxHp: 130, atk: 22, def: 12, icon: 'ShieldAlert', xpValue: 70, goldValue: 50, isElite: true, image: '/src/assets/images/pixel_elite_knight_img_1780280530399.png' },
  { id: 'e_f3_2', name: '炼狱突变吞噬兽', hp: 125, maxHp: 125, atk: 25, def: 10, icon: 'Flame', xpValue: 65, goldValue: 48, isElite: true, image: '/src/assets/images/pixel_devourer_1780281788013.png' }
];

export const BOSS_F3: Enemy = {
  id: 'b_f3',
  name: '古墓圣心大裁决者 (第三层守领)',
  hp: 320,
  maxHp: 320,
  atk: 32,
  def: 18,
  intent: 'ATTACK',
  intentValue: 32,
  intentTurns: 1,
  xpValue: 450,
  goldValue: 300,
  icon: 'Crown',
  isBoss: true,
  isElite: false,
  image: '/src/assets/images/pixel_lich_king_1780281712730.png'
};

export const NORMAL_MONSTERS_F4: Partial<Enemy>[] = [
  { id: 'm_f4_1', name: '重装生化守护机甲', hp: 120, maxHp: 120, atk: 24, def: 14, icon: 'Shield', xpValue: 60, goldValue: 40, image: '/src/assets/images/pixel_golem_1780281411284.png' },
  { id: 'm_f4_2', name: '核磁高频微光蛛', hp: 110, maxHp: 110, atk: 26, def: 10, icon: 'Activity', xpValue: 55, goldValue: 38, image: '/src/assets/images/pixel_cave_spider_1780281759329.png' },
  { id: 'm_f4_3', name: '星流飞焰自适应者', hp: 115, maxHp: 115, atk: 25, def: 12, icon: 'Flame', xpValue: 58, goldValue: 36, image: '/src/assets/images/pixel_fire_demon_1780281425523.png' }
];

export const ELITE_MONSTERS_F4: Partial<Enemy>[] = [
  { id: 'e_f4_1', name: '星空黑刃重甲卫士', hp: 180, maxHp: 180, atk: 35, def: 22, icon: 'ShieldAlert', xpValue: 110, goldValue: 80, isElite: true, image: '/src/assets/images/pixel_elite_knight_img_1780280530399.png' },
  { id: 'e_f4_2', name: '赤焰核聚裂变犬', hp: 170, maxHp: 170, atk: 38, def: 16, icon: 'Flame', xpValue: 100, goldValue: 75, isElite: true, image: '/src/assets/images/pixel_cerberus_1780281698380.png' }
];

export const BOSS_F4: Enemy = {
  id: 'b_f4',
  name: '前锋重装熔炉巨无霸 (第四层守领)',
  hp: 440,
  maxHp: 440,
  atk: 42,
  def: 25,
  intent: 'ATTACK',
  intentValue: 42,
  intentTurns: 1,
  xpValue: 700,
  goldValue: 450,
  icon: 'Crown',
  isBoss: true,
  isElite: false,
  image: '/src/assets/images/pixel_terracotta_1780281773838.png'
};

export const NORMAL_MONSTERS_F5: Partial<Enemy>[] = [
  { id: 'm_f5_1', name: '混沌万神侍魔', hp: 155, maxHp: 155, atk: 32, def: 18, icon: 'Ghost', xpValue: 80, goldValue: 50, image: '/src/assets/images/pixel_zombie_1780281395636.png' },
  { id: 'm_f5_2', name: '深渊审判红莲龙爪', hp: 145, maxHp: 145, atk: 35, def: 15, icon: 'Flame', xpValue: 75, goldValue: 48, image: '/src/assets/images/pixel_fire_demon_1780281425523.png' }
];

export const ELITE_MONSTERS_F5: Partial<Enemy>[] = [
  { id: 'e_f5_1', name: '万神圣门暗影行者', hp: 220, maxHp: 220, atk: 45, def: 25, icon: 'ShieldAlert', xpValue: 150, goldValue: 100, isElite: true, image: '/src/assets/images/pixel_elite_knight_img_1780280530399.png' }
];

export const BOSS_F5: Enemy = {
  id: 'b_f5',
  name: '灭世黑曜堕落龙帝 (终深万神之宰)',
  hp: 600,
  maxHp: 600,
  atk: 56,
  def: 32,
  intent: 'ATTACK',
  intentValue: 56,
  intentTurns: 1,
  xpValue: 2000,
  goldValue: 800,
  icon: 'Crown',
  isBoss: true,
  isElite: false,
  image: '/src/assets/images/pixel_boss_dragon_img_1780280543600.png'
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_1',
    name: '初出茅庐的第一血',
    description: '在危险的地牢中击败第1个魔物。',
    condition: '击杀 1 个怪物',
    target: 1,
    current: 0,
    completed: false,
    claimed: false,
    rewardType: 'gold',
    rewardValue: 50,
    rewardName: '50金币'
  },
  {
    id: 'ach_2',
    name: '地牢小富翁',
    description: '消费也是一种艺术。累积消费达到200枚地牢金币。',
    condition: '买卖金币累计 200',
    target: 200,
    current: 0,
    completed: false,
    claimed: false,
    rewardType: 'stat',
    rewardValue: 5,
    rewardName: '全状态生命增幅 (+5 HP)'
  },
  {
    id: 'ach_3',
    name: '地牢屠夫',
    description: '净化地牢深处的污秽！击败 10 个战斗节点的魔物。',
    condition: '击杀 10 个怪物',
    target: 10,
    current: 0,
    completed: false,
    claimed: false,
    rewardType: 'gold',
    rewardValue: 150,
    rewardName: '150金币'
  },
  {
    id: 'ach_4',
    name: '百炼之主',
    description: '等级提升到 5 级。你的实力让怪物们颤抖！',
    condition: '人物等级达到 5 级',
    target: 5,
    current: 1,
    completed: false,
    claimed: false,
    rewardType: 'stat',
    rewardValue: 2,
    rewardName: '力量洗礼 (+2 攻击力)'
  },
  {
    id: 'ach_5',
    name: '通关第一层',
    description: '击败熔岩地狱犬，完成第一层地图的开拓。',
    condition: '通过第 1 层地牢',
    target: 1,
    current: 0,
    completed: false,
    claimed: false,
    rewardType: 'gold',
    rewardValue: 100,
    rewardName: '100金币'
  },
  {
    id: 'ach_6',
    name: '通关第二层',
    description: '击败死灵巫师之王，踏入终焉深海。',
    condition: '通过第 2 层地牢',
    target: 1,
    current: 0,
    completed: false,
    claimed: false,
    rewardType: 'gold',
    rewardValue: 200,
    rewardName: '200金币'
  },
  {
    id: 'ach_7',
    name: '通关第三层',
    description: '击败古墓大裁决者，踏破圣墓王座。',
    condition: '通过第 3 层裂缝',
    target: 1,
    current: 0,
    completed: false,
    claimed: false,
    rewardType: 'gold',
    rewardValue: 250,
    rewardName: '250金币'
  },
  {
    id: 'ach_8',
    name: '通关第四层',
    description: '拆毁重装熔炉，踏平机械控制主脑。',
    condition: '通过第 4 层天堑',
    target: 1,
    current: 0,
    completed: false,
    claimed: false,
    rewardType: 'gold',
    rewardValue: 300,
    rewardName: '300金币'
  },
  {
    id: 'ach_9',
    name: '终焉主宰：弑龙神迹',
    description: '击败至高灭世黑曜堕落龙帝，重塑大陆破碎神契！',
    condition: '通过第 5 层终章星门并弑神龙',
    target: 1,
    current: 0,
    completed: false,
    claimed: false,
    rewardType: 'item',
    rewardValue: 12,
    rewardName: '造物主之混沌指环 (神印级首饰)'
  }
];

// Helper to generate coordinates and layout for Floor map nodes
export function generateFloorMap(floor: number): DungeonNode[] {
  // Structure: tree or grid with connections
  const nodes: DungeonNode[] = [];
  
  // Format coordinates to make sure the paths render in a highly readable, gorgeous bento or Slay-The-Spire grid.
  // There will be standard tiers: Start -> Level 1 column -> Level 2 column... -> Boss
  // Node 1: Start
  nodes.push({
    id: `node_f${floor}_start`,
    name: '契约始宿之门',
    type: NodeType.START,
    floor: floor,
    x: 10,
    y: 50,
    connections: [`node_f${floor}_c1_1`, `node_f${floor}_c1_2`, `node_f${floor}_c1_3`],
    status: 'available'
  });

  // Layer 1 column (3 nodes)
  nodes.push({
    id: `node_f${floor}_c1_1`,
    name: '幽暗先锋哨所',
    type: NodeType.COMBAT,
    floor: floor,
    x: 25,
    y: 25,
    connections: [`node_f${floor}_c2_1`, `node_f${floor}_c2_2`],
    status: 'locked'
  });
  nodes.push({
    id: `node_f${floor}_c1_2`,
    name: '古圣所迷雾遗迹',
    type: NodeType.MIST_RUINS,
    floor: floor,
    x: 25,
    y: 50,
    connections: [`node_f${floor}_c2_2`, `node_f${floor}_c2_3`],
    status: 'locked'
  });
  nodes.push({
    id: `node_f${floor}_c1_3`,
    name: '暗界黑市驿站',
    type: NodeType.SHOP,
    floor: floor,
    x: 25,
    y: 75,
    connections: [`node_f${floor}_c2_3`, `node_f${floor}_c2_4`],
    status: 'locked'
  });

  // Layer 2 column (4 nodes)
  nodes.push({
    id: `node_f${floor}_c2_1`,
    name: '遗留史诗金宝箱',
    type: NodeType.TREASURE,
    floor: floor,
    x: 45,
    y: 20,
    connections: [`node_f${floor}_c3_1`],
    status: 'locked'
  });
  nodes.push({
    id: `node_f${floor}_c2_2`,
    name: '魔岩炽热地狱囚笼',
    type: NodeType.CAGE_CHALLENGE,
    floor: floor,
    x: 45,
    y: 40,
    connections: [`node_f${floor}_c3_1`, `node_f${floor}_c3_2`],
    status: 'locked'
  });
  nodes.push({
    id: `node_f${floor}_c2_3`,
    name: '恶灵低语突袭战',
    type: NodeType.COMBAT,
    floor: floor,
    x: 45,
    y: 60,
    connections: [`node_f${floor}_c3_2`, `node_f${floor}_c3_3`],
    status: 'locked'
  });
  nodes.push({
    id: `node_f${floor}_c2_4`,
    name: '宿命轮回圣碑',
    type: NodeType.EVENT,
    floor: floor,
    x: 45,
    y: 80,
    connections: [`node_f${floor}_c3_3`],
    status: 'locked'
  });

  // Layer 3 column (3 nodes)
  nodes.push({
    id: `node_f${floor}_c3_1`,
    name: '炼狱狂暴精英魔物',
    type: NodeType.ELITE,
    floor: floor,
    x: 70,
    y: 25,
    connections: [`node_f${floor}_boss`],
    status: 'locked'
  });
  nodes.push({
    id: `node_f${floor}_c3_2`,
    name: '行脚奇珍神秘商人',
    type: NodeType.WANDERING_MERCHANT,
    floor: floor,
    x: 70,
    y: 50,
    connections: [`node_f${floor}_boss`],
    status: 'locked'
  });
  nodes.push({
    id: `node_f${floor}_c3_3`,
    name: '幽影低语迷雾遗迹',
    type: NodeType.MIST_RUINS,
    floor: floor,
    x: 70,
    y: 75,
    connections: [`node_f${floor}_boss`],
    status: 'locked'
  });

  // Floor Boss node
  nodes.push({
    id: `node_f${floor}_boss`,
    name: floor === 1 
      ? '审判犬熔岩巢穴' 
      : floor === 2 
      ? '死灵主祭法阵' 
      : floor === 3 
      ? '圣石古墓王座' 
      : floor === 4 
      ? '机械机甲主控室' 
      : '终焉深渊星门',
    type: NodeType.BOSS,
    floor: floor,
    x: 90,
    y: 50,
    connections: [],
    status: 'locked'
  });

  return nodes;
}
