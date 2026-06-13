/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GameState, 
  PlayerStats, 
  Item, 
  DungeonNode, 
  NodeType, 
  Enemy, 
  CharacterClass, 
  Achievement, 
  ItemType, 
  ItemTier,
  GameDifficulty
} from './types';
import { 
  INITIAL_PLAYER_STATS, 
  getPlayerTitle, 
  INITIAL_ACHIEVEMENTS, 
  generateFloorMap,
  NORMAL_MONSTERS_F1,
  ELITE_MONSTERS_F1,
  BOSS_F1,
  NORMAL_MONSTERS_F2,
  ELITE_MONSTERS_F2,
  BOSS_F2,
  NORMAL_MONSTERS_F3,
  ELITE_MONSTERS_F3,
  BOSS_F3,
  NORMAL_MONSTERS_F4,
  ELITE_MONSTERS_F4,
  BOSS_F4,
  NORMAL_MONSTERS_F5,
  ELITE_MONSTERS_F5,
  BOSS_F5,
  SHOP_ITEMS
} from './constants';

import SetupScreen from './components/SetupScreen';
import DungeonPreviewPage from './components/DungeonPreviewPage';
import MapRoute from './components/MapRoute';
import Battle from './components/Battle';
import Shop from './components/Shop';
import CharacterSheet from './components/CharacterSheet';
import TrophyRoom from './components/TrophyRoom';
import { audio } from './lib/audio';

import { 
  Compass, 
  Skull, 
  Coins, 
  ArrowRight, 
  Award, 
  Gift, 
  HelpCircle, 
  RotateCcw, 
  Sparkles,
  Trophy as TrophyIcon,
  CloudFog,
  Flame,
  ChevronLeft,
  Shield,
  Sword
} from 'lucide-react';

type ScreenState = 'SETUP' | 'PREVIEW' | 'MAP' | 'BATTLE' | 'SHOP' | 'CHARACTER' | 'TROPHY' | 'EVENT' | 'TREASURE' | 'CONQUEST' | 'MIST_RUINS' | 'WANDERING_MERCHANT' | 'CAGE_CHALLENGE';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('SETUP');
  
  // Game Central States
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [equippedItems, setEquippedItems] = useState<Item[]>([]);
  const [dungeonFloor, setDungeonFloor] = useState<number>(1);
  const [dungeonNodes, setDungeonNodes] = useState<DungeonNode[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [activeEnemy, setActiveEnemy] = useState<Enemy | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  
  const [highScore, setHighScore] = useState<number>(0);
  const [goldSpent, setGoldSpent] = useState<number>(0);
  const [monstersSlain, setMonstersSlain] = useState<number>(0);
  const [maxLevelReached, setMaxLevelReached] = useState<number>(1);

  // Event modal temporary node & choices
  const [activeEventNode, setActiveEventNode] = useState<DungeonNode | null>(null);
  const [eventLogText, setEventLogText] = useState<string>('');
  const [eventChoiceClaimed, setEventChoiceClaimed] = useState<boolean>(false);

  // New NodeTypes State
  const [activeMistRuinsNode, setActiveMistRuinsNode] = useState<DungeonNode | null>(null);
  const [mistRuinsChoiceClaimed, setMistRuinsChoiceClaimed] = useState<boolean>(false);
  const [mistRuinsLogText, setMistRuinsLogText] = useState<string>('');

  const [activeWanderingMerchantNode, setActiveWanderingMerchantNode] = useState<DungeonNode | null>(null);
  const [wanderingMerchantItems, setWanderingMerchantItems] = useState<Item[]>([]);

  const [activeCageChallengeNode, setActiveCageChallengeNode] = useState<DungeonNode | null>(null);
  const [cageChallengeTier, setCageChallengeTier] = useState<'BRONZE' | 'SILVER' | 'GOLD' | null>(null);
  const [pendingCageReward, setPendingCageReward] = useState<{ gold: number; tier: ItemTier; } | null>(null);

  // Treasure modal state
  const [activeTreasureNode, setActiveTreasureNode] = useState<DungeonNode | null>(null);
  const [treasureRewardText, setTreasureRewardText] = useState<string>('');
  const [treasureRewardClaimed, setTreasureRewardClaimed] = useState<boolean>(false);

  // Level Up overlay message state
  const [levelUpMessage, setLevelUpMessage] = useState<string>('');

  // AI-Driven Fate Event States
  const [aiEventData, setAiEventData] = useState<{
    title: string;
    story: string;
    choices: Array<{
      id: string;
      text: string;
      desc: string;
      limit_desc?: string;
      cost: { hp: number; gold: number; };
      gain: { hp: number; gold: number; atk: number; def: number; item: boolean; };
    }>;
  } | null>(null);
  const [loadingAiEvent, setLoadingAiEvent] = useState<boolean>(false);

  // 1. LocalStorage Autoload on mount
  useEffect(() => {
    const savedState = localStorage.getItem('dungeon_climber_state_v1');
    if (savedState) {
      try {
        const parsed: GameState = JSON.parse(savedState);
        if (parsed.playerStats) {
          setPlayerStats(parsed.playerStats);
          setInventory(parsed.inventory || []);
          setEquippedItems(parsed.equippedItems || []);
          setDungeonFloor(parsed.dungeonFloor || 1);
          setDungeonNodes(parsed.dungeonNodes || []);
          setCurrentNodeId(parsed.currentNodeId);
          setAchievements(parsed.achievements || INITIAL_ACHIEVEMENTS);
          setHighScore(parsed.highScore || 0);
          setGoldSpent(parsed.goldSpent || 0);
          setMonstersSlain(parsed.monstersSlain || 0);
          setMaxLevelReached(parsed.maxLevelReached || 1);
          
          setScreen('MAP');
        }
      } catch (e) {
        console.error('Error loading saved game progress', e);
      }
    }
  }, []);

  // 2. State Auto-save hook
  useEffect(() => {
    if (playerStats) {
      const stateObj: GameState = {
        playerStats,
        equippedItems,
        inventory,
        dungeonFloor,
        dungeonNodes,
        currentNodeId,
        achievements,
        highScore,
        goldSpent,
        monstersSlain,
        maxLevelReached
      };
      localStorage.setItem('dungeon_climber_state_v1', JSON.stringify(stateObj));
    }
  }, [
    playerStats, equippedItems, inventory, dungeonFloor, 
    dungeonNodes, currentNodeId, achievements, highScore, 
    goldSpent, monstersSlain, maxLevelReached
  ]);

  // Sync high score with experience earned
  useEffect(() => {
    if (playerStats) {
      const points = playerStats.level * 1000 + playerStats.exp + playerStats.gold;
      if (points > highScore) {
        setHighScore(points);
      }
      if (playerStats.level > maxLevelReached) {
        setMaxLevelReached(playerStats.level);
      }
    }
  }, [playerStats, highScore, maxLevelReached]);

  // Helper to dynamically calculate base achievements stats tracking
  const updateAchievementsProgress = (
    type: 'slay' | 'spend' | 'level' | 'floor',
    valueIncrease: number
  ) => {
    setAchievements((prev) => 
      prev.map((ach) => {
        let currentVal = ach.current;
        if (ach.id === 'ach_1' && type === 'slay') currentVal = monstersSlain + valueIncrease;
        if (ach.id === 'ach_3' && type === 'slay') currentVal = monstersSlain + valueIncrease;
        if (ach.id === 'ach_2' && type === 'spend') currentVal = goldSpent + valueIncrease;
        if (ach.id === 'ach_4' && type === 'level') currentVal = valueIncrease; // valueIncrease is the exact level
        if (ach.id === 'ach_5' && type === 'floor' && valueIncrease >= 1) currentVal = 1;
        if (ach.id === 'ach_6' && type === 'floor' && valueIncrease >= 2) currentVal = 1;
        if (ach.id === 'ach_7' && type === 'floor' && valueIncrease >= 3) currentVal = 1;
        if (ach.id === 'ach_8' && type === 'floor' && valueIncrease >= 4) currentVal = 1;
        if (ach.id === 'ach_9' && type === 'floor' && valueIncrease >= 5) currentVal = 1;

        const isNowCompleted = currentVal >= ach.target;

        return {
          ...ach,
          current: currentVal,
          completed: ach.completed ? true : isNowCompleted
        };
      })
    );
  };

  // Class Selection Initiates Game Flow
  const handleSelectClass = (classType: CharacterClass, difficulty: GameDifficulty, starterSchool: string) => {
    // Generate starter deck list based on chosen school and class's standard skills
    let initialDeck: string[] = ['btn_battle_use_atk']; // Basic Attack is always in the deck
    
    // Add custom starting cards based on starterSchool selection
    if (starterSchool === 'bastion') {
      // 圣誓之守：圣印反蚀、不动如山、不破不立
      initialDeck.push('btn_card_sigil_backblow', 'btn_card_steadfast', 'btn_card_ascension_retrib');
    } else if (starterSchool === 'chaos_echo') {
      // 混沌余音：虚绽合击、神圣律令、血能炼制
      initialDeck.push('btn_card_vulnerable_link', 'btn_card_holy_decree', 'btn_card_blood_refinery');
    } else if (starterSchool === 'shadow_strike') {
      // 死神夜刺：破败斩杀、同归于尽、命轮狂赌
      initialDeck.push('btn_card_ruined_exec', 'btn_card_mutual_destruct', 'btn_card_fated_gamble');
    }
    
    // Also add the character's core starting class skills
    initialDeck.push('btn_class_skill_1', 'btn_class_skill_2');

    const stats: PlayerStats = { 
      ...INITIAL_PLAYER_STATS[classType],
      difficulty: difficulty,
      deck: initialDeck,
      starterSchool: starterSchool
    };
    const initialMap = generateFloorMap(1);
    
    setPlayerStats(stats);
    setInventory([]);
    setEquippedItems([]);
    setDungeonFloor(1);
    setDungeonNodes(initialMap);
    setCurrentNodeId(null);
    setMonstersSlain(0);
    setGoldSpent(0);
    setAchievements(INITIAL_ACHIEVEMENTS);
    
    setScreen('PREVIEW');
  };

  // Node Click handler inside MapRoute
  const handleSelectNode = (node: DungeonNode) => {
    if (node.status === 'locked' || node.status === 'completed') return;

    if (node.type === NodeType.START) {
      // Starting gate node auto completion
      markNodeCompleted(node.id);
      return;
    }

    if (node.type === NodeType.SHOP) {
      setCurrentNodeId(node.id);
      setScreen('SHOP');
      return;
    }

    if (node.type === NodeType.EVENT) {
      setCurrentNodeId(node.id);
      setActiveEventNode(node);
      setEventChoiceClaimed(false);
      setEventLogText('');
      setScreen('EVENT');
      fetchAiEvent(node);
      return;
    }

    if (node.type === NodeType.MIST_RUINS) {
      setCurrentNodeId(node.id);
      setActiveMistRuinsNode(node);
      setMistRuinsChoiceClaimed(false);
      setMistRuinsLogText('');
      setScreen('MIST_RUINS');
      return;
    }

    if (node.type === NodeType.WANDERING_MERCHANT) {
      setCurrentNodeId(node.id);
      setActiveWanderingMerchantNode(node);
      
      // Select 4 random items from SHOP_ITEMS, heavily discounted!
      const shuffled = [...SHOP_ITEMS].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4).map(item => {
        const discountFactor = 0.4 + Math.random() * 0.2;
        const newCost = Math.max(15, Math.round(item.cost * discountFactor));
        return {
          ...item,
          cost: newCost,
          description: `【行脚客商特惠折上折】 ${item.description}`
        };
      });
      setWanderingMerchantItems(selected);
      setScreen('WANDERING_MERCHANT');
      return;
    }

    if (node.type === NodeType.CAGE_CHALLENGE) {
      setCurrentNodeId(node.id);
      setActiveCageChallengeNode(node);
      setCageChallengeTier(null);
      setPendingCageReward(null);
      setScreen('CAGE_CHALLENGE');
      return;
    }

    if (node.type === NodeType.TREASURE) {
      setCurrentNodeId(node.id);
      setActiveTreasureNode(node);
      setTreasureRewardClaimed(false);
      // Pick random treasure item reward
      const roll = Math.random();
      let treasureMsg = '';
      if (roll < 0.35) {
        treasureMsg = '🎁 你在金宝箱里听到碎裂声响，获得了「中型全能恢复剂」x1 与 50枚地牢金币！';
      } else if (roll < 0.70) {
        treasureMsg = '🎁 地牢上古遗卷散发余温，你获得了「小型生命药水」x1 与 120枚大额地牢金币！';
      } else {
        treasureMsg = '🎁 箱中赫然陈旧，古朴的符文吊坠亮起：你免费获得了史诗装饰「古银吊坠」！已藏入包裹柜。';
      }
      setTreasureRewardText(treasureMsg);
      setScreen('TREASURE');
      return;
    }

    // Otherwise, COMBAT, ELITE, or BOSS
    let enemyTemplate: Partial<Enemy> = {};
    if (node.type === NodeType.BOSS) {
      enemyTemplate = 
        dungeonFloor === 1 
          ? BOSS_F1 
          : dungeonFloor === 2 
          ? BOSS_F2 
          : dungeonFloor === 3 
          ? BOSS_F3 
          : dungeonFloor === 4 
          ? BOSS_F4 
          : BOSS_F5;
    } else if (node.type === NodeType.ELITE) {
      const templates = 
        dungeonFloor === 1 
          ? ELITE_MONSTERS_F1 
          : dungeonFloor === 2 
          ? ELITE_MONSTERS_F2 
          : dungeonFloor === 3 
          ? ELITE_MONSTERS_F3 
          : dungeonFloor === 4 
          ? ELITE_MONSTERS_F4 
          : ELITE_MONSTERS_F5;
      enemyTemplate = templates[Math.floor(Math.random() * templates.length)];
    } else {
      // Normal combat
      const templates = 
        dungeonFloor === 1 
          ? NORMAL_MONSTERS_F1 
          : dungeonFloor === 2 
          ? NORMAL_MONSTERS_F2 
          : dungeonFloor === 3 
          ? NORMAL_MONSTERS_F3 
          : dungeonFloor === 4 
          ? NORMAL_MONSTERS_F4 
          : NORMAL_MONSTERS_F5;
      enemyTemplate = templates[Math.floor(Math.random() * templates.length)];
    }

    const difficulty = playerStats?.difficulty || 'NORMAL';
    let hpMultiplier = 1.0;
    let atkMultiplier = 1.0;
    let defAdd = 0;
    let goldXpMultiplier = 1.0;
    let difficultyPrefix = '';

    if (difficulty === 'HARD') {
      hpMultiplier = 1.45;
      atkMultiplier = 1.3;
      defAdd = 2;
      goldXpMultiplier = 1.25;
      difficultyPrefix = '【炼狱】';
    } else if (difficulty === 'APOCALYPSE') {
      hpMultiplier = 2.1;
      atkMultiplier = 1.7;
      defAdd = 5;
      goldXpMultiplier = 1.6;
      difficultyPrefix = '【混沌】';
    } else if (difficulty === 'NIGHTMARE') {
      hpMultiplier = 2.9;
      atkMultiplier = 2.3;
      defAdd = 15;
      goldXpMultiplier = 2.0;
      difficultyPrefix = '【噩梦】';
    }

    const baseEnemyHp = enemyTemplate.hp || 40;
    const baseEnemyAtk = enemyTemplate.atk || 8;
    const baseEnemyDef = enemyTemplate.def || 2;

    const scaledHp = Math.round(baseEnemyHp * hpMultiplier);
    const scaledAtk = Math.round(baseEnemyAtk * atkMultiplier);
    const scaledDef = Math.round(baseEnemyDef + defAdd);
    const scaledXp = Math.round((enemyTemplate.xpValue || 20) * goldXpMultiplier);
    const scaledGold = Math.round((enemyTemplate.goldValue || 15) * goldXpMultiplier);

    const battleEnemy: Enemy = {
      id: enemyTemplate.id || 'm_rnd',
      name: difficultyPrefix + (enemyTemplate.name || '怪兽哨卫'),
      hp: scaledHp,
      maxHp: scaledHp,
      atk: scaledAtk,
      def: scaledDef,
      intent: 'ATTACK',
      intentValue: scaledAtk,
      intentTurns: 1,
      xpValue: scaledXp,
      goldValue: scaledGold,
      icon: enemyTemplate.icon || 'Sword',
      isBoss: enemyTemplate.isBoss || false,
      isElite: enemyTemplate.isElite || false,
      image: enemyTemplate.image
    };

    setCurrentNodeId(node.id);
    setActiveEnemy(battleEnemy);
    setScreen('BATTLE');
  };

  // Mark node as completed & unlock downstream connections
  const markNodeCompleted = (nodeId: string) => {
    setDungeonNodes((prevNodes) => {
      // Find completed node to discover connected sibling paths
      const targetNode = prevNodes.find(n => n.id === nodeId);
      if (!targetNode) return prevNodes;

      return prevNodes.map((n) => {
        // Mark current completed
        if (n.id === nodeId) {
          return { ...n, status: 'completed' as const };
        }
        // Unlock connected adjacent nodes
        if (targetNode.connections.includes(n.id) && n.status === 'locked') {
          return { ...n, status: 'available' as const };
        }
        return n;
      });
    });
  };

  // Drink potion from custom container
  const handleDrinkPotion = (potionId: string) => {
    if (!playerStats) return;

    let healAmt = 30;
    let mpRest = 0;
    let permHp = 0;

    if (potionId === 's_pot_2') {
      healAmt = 60;
      mpRest = 40;
    } else if (potionId === 's_pot_3') {
      healAmt = playerStats.maxHp;
      mpRest = playerStats.maxMp;
      permHp = 5;
    }

    setPlayerStats(prev => {
      if (!prev) return null;
      const nextHp = Math.min(prev.maxHp + permHp, prev.hp + healAmt);
      const nextMp = Math.min(prev.maxMp, prev.mp + mpRest);
      return {
        ...prev,
        hp: nextHp,
        mp: nextMp,
        maxHp: prev.maxHp + permHp
      };
    });

    // Remove from inventory
    setInventory(prev => {
      const index = prev.findIndex(item => item.id === potionId);
      if (index > -1) {
        const next = [...prev];
        next.splice(index, 1);
        return next;
      }
      return prev;
    });
  };

  // Equip gears
  const handleEquipItem = (itemToEquip: Item) => {
    if (!playerStats) return;

    // Remove previous equipped gear stats, add new gear stats
    const prevEquipped = equippedItems.find(i => i.type === itemToEquip.type);
    
    let statsModifierAtk = itemToEquip.atkBonus || 0;
    let statsModifierDef = itemToEquip.defBonus || 0;
    let statsModifierHp = itemToEquip.hpBonus || 0;
    let statsModifierMp = itemToEquip.mpBonus || 0;

    if (prevEquipped) {
      statsModifierAtk -= prevEquipped.atkBonus || 0;
      statsModifierDef -= prevEquipped.defBonus || 0;
      statsModifierHp -= prevEquipped.hpBonus || 0;
      statsModifierMp -= prevEquipped.mpBonus || 0;
    }

    // Apply modification to player stats
    setPlayerStats(prev => {
      if (!prev) return null;
      const nextMaxHp = prev.maxHp + statsModifierHp;
      const nextMaxMp = prev.maxMp + statsModifierMp;
      return {
        ...prev,
        atk: prev.atk + statsModifierAtk,
        def: prev.def + statsModifierDef,
        maxHp: nextMaxHp,
        maxMp: nextMaxMp,
        hp: Math.min(nextMaxHp, prev.hp + (statsModifierHp > 0 ? statsModifierHp : 0)),
        mp: Math.min(nextMaxMp, prev.mp + (statsModifierMp > 0 ? statsModifierMp : 0))
      };
    });

    // Update equips list
    setEquippedItems(prev => {
      const filtered = prev.filter(i => i.type !== itemToEquip.type);
      return [...filtered, { ...itemToEquip, isEquipped: true }];
    });

    // Mirror updates in inventory marks
    setInventory(prev => 
      prev.map(i => {
        if (i.id === itemToEquip.id) return { ...i, isEquipped: true };
        if (i.type === itemToEquip.type && i.id !== itemToEquip.id) return { ...i, isEquipped: false };
        return i;
      })
    );
  };

  // Unequip gears
  const handleUnequipItem = (itemToUnequip: Item) => {
    if (!playerStats) return;

    // Deduct stats
    setPlayerStats(prev => {
      if (!prev) return null;
      const nextMaxHp = Math.max(20, prev.maxHp - (itemToUnequip.hpBonus || 0));
      const nextMaxMp = Math.max(10, prev.maxMp - (itemToUnequip.mpBonus || 0));
      return {
        ...prev,
        atk: Math.max(1, prev.atk - (itemToUnequip.atkBonus || 0)),
        def: Math.max(0, prev.def - (itemToUnequip.defBonus || 0)),
        maxHp: nextMaxHp,
        maxMp: nextMaxMp,
        hp: Math.min(nextMaxHp, prev.hp),
        mp: Math.min(nextMaxMp, prev.mp)
      };
    });

    setEquippedItems(prev => prev.filter(i => i.id !== itemToUnequip.id));

    setInventory(prev => 
      prev.map(i => {
        if (i.id === itemToUnequip.id) return { ...i, isEquipped: false };
        return i;
      })
    );
  };
  
  // Activate safe talent node from Character sheet
  const handleActivateTalent = (talentId: string) => {
    if (!playerStats) return;
    const activeList = playerStats.activatedTalents || [];

    if (activeList.includes(talentId)) return;

    // Point calculations
    const cost = talentId === 't_special' ? 2 : 1;
    const totalPoints = playerStats.level - 1;
    const spentPoints = activeList.reduce((acc, tid) => acc + (tid === 't_special' ? 2 : 1), 0);
    const availablePoints = totalPoints - spentPoints;

    if (availablePoints < cost) return;

    setPlayerStats(prev => {
      if (!prev) return null;
      const prevActive = prev.activatedTalents || [];
      const nextActive = [...prevActive, talentId];

      let nextMaxHp = prev.maxHp;
      let nextMaxMp = prev.maxMp;
      let nextAtk = prev.atk;
      let nextDef = prev.def;
      let nextGold = prev.gold;

      if (talentId === 't_hp') {
        nextMaxHp += 25;
      } else if (talentId === 't_mp') {
        nextMaxMp += 15;
      } else if (talentId === 't_atk') {
        nextAtk += 3;
      } else if (talentId === 't_def') {
        nextDef += 2;
      } else if (talentId === 't_gold') {
        // Flat gold reward on activation!
        nextGold += 80;
      } else if (talentId === 't_special') {
        if (prev.classType === CharacterClass.WARRIOR) {
          nextMaxHp += 30;
        } else if (prev.classType === CharacterClass.MAGE) {
          nextMaxMp += 30;
        } else {
          nextAtk += 5;
        }
      }

      return {
        ...prev,
        maxHp: nextMaxHp,
        maxMp: nextMaxMp,
        atk: nextAtk,
        def: nextDef,
        gold: nextGold,
        hp: Math.min(nextMaxHp, prev.hp + (talentId === 't_hp' || (talentId === 't_special' && prev.classType === CharacterClass.WARRIOR) ? 25 : 0)),
        mp: Math.min(nextMaxMp, prev.mp + (talentId === 't_mp' || (talentId === 't_special' && prev.classType === CharacterClass.MAGE) ? 15 : 0)),
        activatedTalents: nextActive
      };
    });
  };

  // Reset activated talent points
  const handleResetTalents = () => {
    if (!playerStats) return;
    const activeList = playerStats.activatedTalents || [];
    if (activeList.length === 0) return;

    const washCost = 20;
    if (playerStats.gold < washCost) return;

    setPlayerStats(prev => {
      if (!prev) return null;
      const prevActive = prev.activatedTalents || [];
      
      let nextMaxHp = prev.maxHp;
      let nextMaxMp = prev.maxMp;
      let nextAtk = prev.atk;
      let nextDef = prev.def;

      for (const talentId of prevActive) {
        if (talentId === 't_hp') {
          nextMaxHp -= 25;
        } else if (talentId === 't_mp') {
          nextMaxMp -= 15;
        } else if (talentId === 't_atk') {
          nextAtk -= 3;
        } else if (talentId === 't_def') {
          nextDef -= 2;
        } else if (talentId === 't_special') {
          if (prev.classType === CharacterClass.WARRIOR) {
            nextMaxHp -= 30;
          } else if (prev.classType === CharacterClass.MAGE) {
            nextMaxMp -= 30;
          } else {
            nextAtk -= 5;
          }
        }
      }

      const postMaxHp = Math.max(10, nextMaxHp);
      const postMaxMp = Math.max(10, nextMaxMp);

      return {
        ...prev,
        maxHp: postMaxHp,
        maxMp: postMaxMp,
        atk: Math.max(1, nextAtk),
        def: Math.max(0, nextDef),
        hp: Math.min(postMaxHp, prev.hp),
        mp: Math.min(postMaxMp, prev.mp),
        gold: Math.max(0, prev.gold - washCost),
        activatedTalents: []
      };
    });
  };

  // Dismantle equipped/inventory items to obtain soul shards
  const handleDismantleItem = (itemToDismantle: Item) => {
    if (!playerStats) return;
    
    // Unequip first if it's currently equipped
    if (itemToDismantle.isEquipped) {
      handleUnequipItem(itemToDismantle);
    }
    
    // Remove item from inventory
    setInventory(prev => prev.filter(i => i.id !== itemToDismantle.id));
    
    // Award soul shards (e.g., 5-15 based on tiers)
    let tierVal = 1;
    if (itemToDismantle.tier === ItemTier.RARE) tierVal = 2;
    else if (itemToDismantle.tier === ItemTier.EPIC) tierVal = 3;
    else if (itemToDismantle.tier === ItemTier.LEGENDARY) tierVal = 5;
    const tierBonus = tierVal * 5;
    const shardGain = 5 + Math.floor(Math.random() * 5) + tierBonus;
    
    setPlayerStats(prev => {
      if (!prev) return null;
      return {
        ...prev,
        soulShards: (prev.soulShards || 0) + shardGain
      };
    });
  };

  // Upgrade equipment stats by spending soul shards with limit up to +3 max
  const handleForgeUpgradeItem = (itemToUpgrade: Item) => {
    if (!playerStats) return;
    const currentForgeLevel = itemToUpgrade.forgeLevel || 0;
    if (currentForgeLevel >= 3) return; // limit to +3 max
    
    const shardCost = (currentForgeLevel + 1) * 10;
    const currentShards = playerStats.soulShards || 0;
    if (currentShards < shardCost) return;
    
    // Deduct cost and upgrade stats of the item
    setPlayerStats(prev => {
      if (!prev) return null;
      return {
        ...prev,
        soulShards: Math.max(0, currentShards - shardCost)
      };
    });
    
    const upgradeAtk = itemToUpgrade.type === ItemType.WEAPON ? 4 : 0;
    const upgradeDef = itemToUpgrade.type === ItemType.ARMOR ? 3 : 0;
    const upgradeHp = itemToUpgrade.type === ItemType.ARMOR ? 15 : 0;
    const upgradeMp = itemToUpgrade.type === ItemType.WEAPON ? 8 : 0;
    
    const upgradedItem: Item = {
      ...itemToUpgrade,
      forgeLevel: currentForgeLevel + 1,
      atkBonus: (itemToUpgrade.atkBonus || 0) + upgradeAtk,
      defBonus: (itemToUpgrade.defBonus || 0) + upgradeDef,
      hpBonus: (itemToUpgrade.hpBonus || 0) + upgradeHp,
      mpBonus: (itemToUpgrade.mpBonus || 0) + upgradeMp
    };
    
    // Update the item list inside inventory and equipped gear to reflect new stats
    setInventory(prev => prev.map(i => i.id === itemToUpgrade.id ? upgradedItem : i));
    if (itemToUpgrade.isEquipped) {
      setEquippedItems(prev => prev.map(i => i.id === itemToUpgrade.id ? upgradedItem : i));
      
      // Since it's equipped, we must dynamically increase player active stats
      setPlayerStats(prev => {
        if (!prev) return null;
        return {
          ...prev,
          atk: prev.atk + upgradeAtk,
          def: prev.def + upgradeDef,
          maxHp: prev.maxHp + upgradeHp,
          maxMp: prev.maxMp + upgradeMp,
          hp: prev.hp + upgradeHp,
          mp: prev.mp + upgradeMp
        };
      });
    }
  };

  // Perform permanent prestigious class ascension with stats boosts and skills
  const handleAscendClass = (ascendedClassName: string) => {
    if (!playerStats) return;
    setPlayerStats(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ascendedClass: ascendedClassName,
        // High prestige stats multiplier
        atk: prev.atk + 12,
        def: prev.def + 8,
        maxHp: prev.maxHp + 45,
        maxMp: prev.maxMp + 25,
        hp: prev.hp + 45,
        mp: prev.mp + 25
      };
    });
  };

  // Buy item from shop shelf
  const handleBuyItem = (item: Item) => {
    if (!playerStats || playerStats.gold < item.cost) return;

    // Deduct Gold and register
    setPlayerStats(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gold: prev.gold - item.cost
      };
    });

    setGoldSpent(prev => {
      const next = prev + item.cost;
      updateAchievementsProgress('spend', item.cost);
      return next;
    });

    // Put into inventory
    const boughtItem: Item = { 
      ...item, 
      isEquipped: false,
      instanceId: `${item.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };
    setInventory(prev => [...prev, boughtItem]);
  };

  // Battle Combat victor callback
  const handleVictory = (xpEarned: number, goldEarned: number) => {
    if (!playerStats) return;

    // Apply cage challenge bonuses if any
    let extraLootMsg = '';
    let bonusGold = 0;
    let challengeLoot: Item | null = null;

    if (pendingCageReward) {
      bonusGold = pendingCageReward.gold;
      
      const validItems = SHOP_ITEMS.filter(item => 
        item.type !== ItemType.POTION && 
        item.tier === pendingCageReward.tier
      );

      if (validItems.length > 0) {
        const itemReward = validItems[Math.floor(Math.random() * validItems.length)];
        challengeLoot = {
          ...itemReward,
          isEquipped: false,
          instanceId: `${itemReward.id}_${Date.now()}_cage`
        };
      }
    }

    let nextExp = playerStats.exp + xpEarned;
    let nextLvl = playerStats.level;
    let didLvlUp = false;

    // Check Level Up threshold
    if (nextExp >= playerStats.expToNextLevel) {
      nextExp -= playerStats.expToNextLevel;
      nextLvl += 1;
      didLvlUp = true;
    }

    // Slaying state
    const nextSlayed = monstersSlain + 1;
    setMonstersSlain(nextSlayed);

    // Apply level statistics gains
    setPlayerStats(prev => {
      if (!prev) return null;
      let nextMaxHp = prev.maxHp;
      let nextMaxMp = prev.maxMp;
      let nextAtk = prev.atk;
      let nextDef = prev.def;

      if (didLvlUp) {
        nextMaxHp += 20;
        nextMaxMp += 15;
        nextAtk += 4;
        nextDef += 2;
        setLevelUpMessage(`🎨 境界冲破！你的等级提升至 Lv.${nextLvl}！最大生命+20, 攻击+4，防御+2！状态已全面完全恢复！`);
      }

      const activeList = prev.activatedTalents || [];
      const talentGoldBonus = activeList.includes('t_gold') ? Math.round(goldEarned * 0.15) : 0;

      return {
        ...prev,
        level: nextLvl,
        exp: nextExp,
        expToNextLevel: nextLvl * 100,
        gold: prev.gold + goldEarned + bonusGold + talentGoldBonus,
        maxHp: nextMaxHp,
        maxMp: nextMaxMp,
        hp: didLvlUp ? nextMaxHp : prev.hp,
        mp: didLvlUp ? nextMaxMp : prev.mp,
        atk: nextAtk,
        def: nextDef,
        title: getPlayerTitle(prev.classType, nextLvl)
      };
    });

    const hasGoldTalent = (playerStats.activatedTalents || []).includes('t_gold');
    const talentGoldAmt = hasGoldTalent ? Math.round(goldEarned * 0.15) : 0;

    if (challengeLoot) {
      setInventory(prev => [...prev, challengeLoot as Item]);
      extraLootMsg = `🏆 【囚笼大捷】：你彻底粉碎了牢宿禁制，额外获得碎银 +${bonusGold} 枚 & 【${challengeLoot.tier}】级传说装备【${challengeLoot.name}】！已藏入行囊柜。`;
      if (talentGoldAmt > 0) {
        extraLootMsg += `\n💰 命印【守财贪婪】精进：贪欲红利爆发，额外赠予 +${talentGoldAmt} 金币！`;
      }
      if (didLvlUp) {
        setLevelUpMessage(prev => `${prev}\n\n${extraLootMsg}`);
      } else {
        setLevelUpMessage(extraLootMsg);
      }
    } else if (bonusGold > 0) {
      extraLootMsg = `🏆 【囚笼大捷】：你额外拔除牢晶，获得碎银 +${bonusGold} 枚！`;
      if (talentGoldAmt > 0) {
        extraLootMsg += `\n💰 命印【守财贪婪】精进：额外入账 +${talentGoldAmt} 金币！`;
      }
      if (didLvlUp) {
        setLevelUpMessage(prev => `${prev}\n\n${extraLootMsg}`);
      } else {
        setLevelUpMessage(extraLootMsg);
      }
    } else if (talentGoldAmt > 0) {
      extraLootMsg = `💰 命印【守财贪婪】精进：由于你对财富怀有强烈渴求，此役贪欲魂格共鸣额外斩落 +${talentGoldAmt} 碎银金币！`;
      if (didLvlUp) {
        setLevelUpMessage(prev => `${prev}\n\n${extraLootMsg}`);
      } else {
        setLevelUpMessage(extraLootMsg);
      }
    }

    // Reset cage reward status
    setPendingCageReward(null);

    // Sync achievements lists
    updateAchievementsProgress('slay', 1);
    if (didLvlUp) {
      updateAchievementsProgress('level', nextLvl);
    }

    // Complete active node exploration on map
    if (currentNodeId) {
      markNodeCompleted(currentNodeId);
      
      // If the boss of the active floor is defeated, check if complete Conquest Win
      const activeNode = dungeonNodes.find(n => n.id === currentNodeId);
      if (activeNode && activeNode.type === NodeType.BOSS) {
        if (dungeonFloor === 5) {
          updateAchievementsProgress('floor', 5);
          setScreen('CONQUEST'); // Fully Beat the whole game!
          return;
        } else {
          // Unlocking transition option to advanced floor maps!
          updateAchievementsProgress('floor', dungeonFloor);
        }
      }
    }

    setActiveEnemy(null);
    setScreen('MAP');
  };

  // Death / Defeat option triggers fresh wipe setup class selection
  const handleDefeatReset = () => {
    localStorage.removeItem('dungeon_climber_state_v1');
    setPlayerStats(null);
    setInventory([]);
    setEquippedItems([]);
    setDungeonFloor(1);
    setDungeonNodes([]);
    setMonstersSlain(0);
    setGoldSpent(0);
    setScreen('SETUP');
  };

  // Claim achievement reward and gift corresponding items/values
  const handleClaimReward = (id: string) => {
    const ach = achievements.find(a => a.id === id);
    if (!ach || !isCompletedAndUnclaimed(ach) || !playerStats) return;

    setAchievements((prev) => 
      prev.map((a) => (a.id === id ? { ...a, claimed: true } : a))
    );

    // Apply reward based on spec
    if (ach.rewardType === 'gold') {
      setPlayerStats(prev => {
        if (!prev) return null;
        return { ...prev, gold: prev.gold + ach.rewardValue };
      });
    } else if (ach.rewardType === 'stat') {
      // Dynamic Permanent boosts!
      setPlayerStats(prev => {
        if (!prev) return null;
        if (ach.id === 'ach_2') {
          return {
            ...prev,
            maxHp: prev.maxHp + 15,
            hp: prev.hp + 15
          };
        } else {
          return {
            ...prev,
            atk: prev.atk + ach.rewardValue
          };
        }
      });
    } else if (ach.rewardType === 'item') {
      // Give the high-tier magical ring directly!
      const ringItem = SHOP_ITEMS.find(i => i.id === 's_acc_4');
      if (ringItem) {
        setInventory(prev => [...prev, { 
          ...ringItem, 
          isEquipped: false,
          instanceId: `${ringItem.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        }]);
      }
    }
  };

  const isCompletedAndUnclaimed = (ach: Achievement) => {
    return ach.completed && !ach.claimed;
  };

  // Fetch AI Gothic story narrations with graceful fallback
  const fetchAiEvent = async (node: DungeonNode) => {
    if (!playerStats) return;
    setLoadingAiEvent(true);
    setAiEventData(null);
    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeType: node.type,
          nodeName: node.name,
          floor: dungeonFloor,
          playerStats
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.choices && data.choices.length === 3) {
          setAiEventData(data);
          setLoadingAiEvent(false);
          return;
        }
      }
    } catch (e) {
      console.warn("⚠️ AI Event fetch error or API key missing, running in local fallback.", e);
    }
    setLoadingAiEvent(false);
    setAiEventData(null);
  };

  // Next Floor climb setup mapping
  const handleAscendFloor = () => {
    const nextFloor = dungeonFloor + 1;
    setDungeonFloor(nextFloor);
    const nextMap = generateFloorMap(nextFloor);
    setDungeonNodes(nextMap);
    setCurrentNodeId(null);
    setLevelUpMessage('');
    setScreen('MAP');
  };

  // Handle AI Narrated Fate choices
  const handleAiEventChoice = (choice: {
    id: string;
    text: string;
    desc: string;
    limit_desc?: string;
    cost: { hp: number; gold: number; };
    gain: { hp: number; gold: number; atk: number; def: number; item: boolean; };
  }) => {
    if (!playerStats) return;
    setEventChoiceClaimed(true);

    let logs: string[] = [];
    let updatedStats = { ...playerStats };

    // Apply Cost
    if (choice.cost.hp > 0) {
      updatedStats.hp = Math.max(1, updatedStats.hp - choice.cost.hp);
      logs.push(`流失了 ${choice.cost.hp} 点生命值`);
    }
    if (choice.cost.gold > 0) {
      updatedStats.gold = Math.max(0, updatedStats.gold - choice.cost.gold);
      logs.push(`耗费了 ${choice.cost.gold} 颗金币`);
    }

    // Apply Gain
    if (choice.gain.hp > 0) {
      updatedStats.hp = Math.min(updatedStats.maxHp, updatedStats.hp + choice.gain.hp);
      logs.push(`恢复了 ${choice.gain.hp} 点生命`);
    }
    if (choice.gain.gold > 0) {
      updatedStats.gold = updatedStats.gold + choice.gain.gold;
      logs.push(`收获了 +${choice.gain.gold} 金币`);
    }
    if (choice.gain.atk > 0) {
      updatedStats.atk = updatedStats.atk + choice.gain.atk;
      logs.push(`永久获取了 +${choice.gain.atk} 攻击力`);
    }
    if (choice.gain.def > 0) {
      updatedStats.def = updatedStats.def + choice.gain.def;
      logs.push(`永久获取了 +${choice.gain.def} 防御力`);
    }

    // Give a cool high-tier random item
    if (choice.gain.item) {
      const candidates = SHOP_ITEMS.filter(item => item.type !== ItemType.POTION);
      const chosenItem = candidates[Math.floor(Math.random() * candidates.length)];
      if (chosenItem) {
        setInventory(prev => [...prev, {
          ...chosenItem,
          isEquipped: false,
          instanceId: `${chosenItem.id}_${Date.now()}_ai`
        }]);
        logs.push(`获得了超凡至宝【${chosenItem.name}】`);
      }
    }

    setPlayerStats(updatedStats);

    const detailText = logs.length > 0 ? `战绩结果：在你做出命运契约后，你 ${logs.join('，')}！` : '宿命仪式完成，未发生面板剧烈变动。';
    setEventLogText(`📜 【${choice.text}】\n\n「${choice.limit_desc || '神明悄然注视着你。'}」\n\n${detailText}`);
  };

  // Interactive Choices inside Event (宿命石碑奇遇)
  const handleEventChoice = (choice: 'spring' | 'obelisk' | 'crack') => {
    if (!playerStats) return;

    setEventChoiceClaimed(true);
    let logMsg = '';

    if (choice === 'spring') {
      const healAmt = 45;
      setPlayerStats(prev => {
        if (!prev) return null;
        return { ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmt) };
      });
      logMsg = `⛲ 你捧起神殿冰凉的泉水大口喝下。温润的神圣力量修补全身，你恢复了 ${healAmt} 点生命生命值！`;
    } else if (choice === 'obelisk') {
      const harm = 20;
      const atkBoost = 4;
      setPlayerStats(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          hp: Math.max(1, prev.hp - harm),
          atk: prev.atk + atkBoost
        };
      });
      logMsg = `🌋 接受狂热洗礼！一柱烈焰穿心，你忍受剧烈虚脱流失 ${harm} HP，作为代价神威永塑，永久获得 +${atkBoost} 攻击力！`;
    } else if (choice === 'crack') {
      const coins = 45;
      setPlayerStats(prev => {
        if (!prev) return null;
        return { ...prev, gold: prev.gold + coins };
      });
      logMsg = `💎 你费劲拨开裂缝碎石，撬出一件精美的古物倒卖，获得了额外的 +${coins} 地牢金币！`;
    }

    setEventLogText(logMsg);
  };

  // Event modal exit confirm
  const handleConfirmEventComplete = () => {
    if (activeEventNode) {
      markNodeCompleted(activeEventNode.id);
    }
    setActiveEventNode(null);
    setScreen('MAP');
  };

  // interactive choices inside Mist Ruins (迷雾遗迹)
  const handleMistRuinsChoice = (choice: 'sacrifice' | 'absorb' | 'mist_potion' | 'leave') => {
    if (!playerStats) return;

    setMistRuinsChoiceClaimed(true);
    let logMsg = '';

    if (choice === 'sacrifice') {
      setPlayerStats(prev => {
        if (!prev) return null;
        return { ...prev, hp: Math.max(1, prev.hp - 40) };
      });
      const candidates = SHOP_ITEMS.filter(item => item.type !== ItemType.POTION && (item.tier === ItemTier.EPIC || item.tier === ItemTier.LEGENDARY || item.tier === ItemTier.RARE));
      const chosenItem = candidates[Math.floor(Math.random() * candidates.length)];
      const rewardItem: Item = {
        ...chosenItem,
        isEquipped: false,
        instanceId: `${chosenItem.id}_${Date.now()}_mist`
      };
      setInventory(prev => [...prev, rewardItem]);
      logMsg = `🩸 你向血迷雾遗迹献祭了自己 40 点生命值作为血引，强行将废墟祭坛上封印的古老神器「${chosenItem.name}」带走！物品已放入背包。`;
    } else if (choice === 'absorb') {
      const hpCost = Math.floor(playerStats.hp * 0.5);
      setPlayerStats(prev => {
        if (!prev) return null;
        return {
          ...prev,
          hp: Math.max(1, prev.hp - hpCost),
          atk: prev.atk + 7,
          def: prev.def + 7
        };
      });
      logMsg = `🌀 你席地而坐吸纳废墟中的星尘迷雾，将经络浸泡在撕裂灵魂的寒风中。你失去了 ${hpCost} 点生命值，但肉体得到超脱，永久获得【攻击力 +7】与【防御力 +7】！`;
    } else if (choice === 'mist_potion') {
      if (playerStats.gold < 80) {
        logMsg = `🧪 你试图向神秘魔井投入金币，可你的钱包空荡荡。神灵不屑于向穷苦之人赐福... (折回，什么都没发生)`;
      } else {
        setPlayerStats(prev => {
          if (!prev) return null;
          return {
            ...prev,
            gold: Math.max(0, prev.gold - 80),
            hp: prev.maxHp,
            mp: prev.maxMp
          };
        });
        logMsg = `🧪 你将 80 枚地牢金币投入混沌井中，金币般的光芒被魔井吞噬。下一瞬，莹莹圣泉水喷薄而出！你的生命值与魔法值恢复至 100% 的充沛巅峰！`;
      }
    } else if (choice === 'leave') {
      setPlayerStats(prev => {
        if (!prev) return null;
        return { ...prev, gold: prev.gold + 25 };
      });
      logMsg = `🚶‍♂️ 你对迷雾中若隐若现的低语时刻保持着警醒，决定稳健行事。你在遗迹边缘谨慎探索，安全折回，并顺手捡到了 +25 枚地牢碎币。`;
    }

    setMistRuinsLogText(logMsg);
  };

  const handleConfirmMistRuinsComplete = () => {
    if (activeMistRuinsNode) {
      markNodeCompleted(activeMistRuinsNode.id);
    }
    setActiveMistRuinsNode(null);
    setScreen('MAP');
  };

  // Buy item from Wandering Merchant
  const handleWanderingBuy = (item: Item) => {
    if (!playerStats || playerStats.gold < item.cost) return;

    setPlayerStats(prev => {
      if (!prev) return null;
      return { ...prev, gold: prev.gold - item.cost };
    });

    const bought: Item = {
      ...item,
      isEquipped: false,
      instanceId: `${item.id}_${Date.now()}_wand`
    };
    setInventory(prev => [...prev, bought]);
    setGoldSpent(prev => prev + item.cost);

    // Remove bought item from lists
    setWanderingMerchantItems(prev => prev.filter(i => i.id !== item.id));
  };

  // Start Cage Challenge battles
  const handleStartCageChallenge = (tier: 'BRONZE' | 'SILVER' | 'GOLD') => {
    if (!playerStats || !activeCageChallengeNode) return;

    setCageChallengeTier(tier);

    const difficulty = playerStats.difficulty || 'NORMAL';
    let difficultyHpMult = 1.0;
    let difficultyAtkMult = 1.0;
    let difficultyDefAdd = 0;
    let goldXpMult = 1.0;
    let difficultyPrefix = '';

    if (difficulty === 'HARD') {
      difficultyHpMult = 1.45;
      difficultyAtkMult = 1.3;
      difficultyDefAdd = 2;
      goldXpMult = 1.25;
      difficultyPrefix = '【炼狱】';
    } else if (difficulty === 'APOCALYPSE') {
      difficultyHpMult = 2.1;
      difficultyAtkMult = 1.7;
      difficultyDefAdd = 5;
      goldXpMult = 1.6;
      difficultyPrefix = '【混沌】';
    } else if (difficulty === 'NIGHTMARE') {
      difficultyHpMult = 2.9;
      difficultyAtkMult = 2.3;
      difficultyDefAdd = 15;
      goldXpMult = 2.0;
      difficultyPrefix = '【噩梦】';
    }

    let baseEnemy: Enemy;
    const isGold = tier === 'GOLD';
    const isSilver = tier === 'SILVER';

    if (isGold) {
      const templates = 
        dungeonFloor === 1 
          ? ELITE_MONSTERS_F1 
          : dungeonFloor === 2 
          ? ELITE_MONSTERS_F2 
          : ELITE_MONSTERS_F3;
      const t = templates[Math.floor(Math.random() * templates.length)];

      const cageHp = Math.round(t.hp * 1.5 * difficultyHpMult);
      const cageAtk = Math.round(t.atk * 1.3 * difficultyAtkMult);
      const cageDef = Math.round((t.def || 0) * 1.25 + difficultyDefAdd);
      const cageXp = Math.round((t.xpValue || 45) * goldXpMult);
      const cageGold = Math.round((t.goldValue || 45) * goldXpMult);

      baseEnemy = {
        ...t,
        id: `${t.id}_gold_challenge`,
        name: difficultyPrefix + `【狂怒生死囚笼】${t.name}`,
        hp: cageHp,
        maxHp: cageHp,
        atk: cageAtk,
        def: cageDef,
        intent: t.intent || 'ATTACK',
        intentValue: cageAtk,
        intentTurns: t.intentTurns || 1,
        xpValue: cageXp,
        goldValue: cageGold,
        icon: t.icon || 'Skull',
        isBoss: t.isBoss || false,
        isElite: true
      };
      setPendingCageReward({
        gold: Math.round(320 * goldXpMult),
        tier: ItemTier.LEGENDARY
      });
    } else if (isSilver) {
      const templates = 
        dungeonFloor === 1 
          ? ELITE_MONSTERS_F1 
          : dungeonFloor === 2 
          ? ELITE_MONSTERS_F2 
          : ELITE_MONSTERS_F3;
      const t = templates[Math.floor(Math.random() * templates.length)];

      const cageHp = Math.round(t.hp * 1.25 * difficultyHpMult);
      const cageAtk = Math.round(t.atk * 1.15 * difficultyAtkMult);
      const cageDef = Math.round((t.def || 0) + difficultyDefAdd);
      const cageXp = Math.round((t.xpValue || 25) * goldXpMult);
      const cageGold = Math.round((t.goldValue || 25) * goldXpMult);

      baseEnemy = {
        ...t,
        id: `${t.id}_silver_challenge`,
        name: difficultyPrefix + `【炽热极刑囚笼】${t.name}`,
        hp: cageHp,
        maxHp: cageHp,
        atk: cageAtk,
        def: cageDef,
        intent: t.intent || 'ATTACK',
        intentValue: cageAtk,
        intentTurns: t.intentTurns || 1,
        xpValue: cageXp,
        goldValue: cageGold,
        icon: t.icon || 'Skull',
        isBoss: t.isBoss || false,
        isElite: true
      };
      setPendingCageReward({
        gold: Math.round(150 * goldXpMult),
        tier: ItemTier.EPIC
      });
    } else { // BRONZE
      const templates = 
        dungeonFloor === 1 
          ? NORMAL_MONSTERS_F1 
          : dungeonFloor === 2 
          ? NORMAL_MONSTERS_F2 
          : NORMAL_MONSTERS_F3;
      const t = templates[Math.floor(Math.random() * templates.length)];

      const cageHp = Math.round(t.hp * 1.1 * difficultyHpMult);
      const cageAtk = Math.round(t.atk * 1.1 * difficultyAtkMult);
      const cageDef = Math.round((t.def || 0) + difficultyDefAdd);
      const cageXp = Math.round((t.xpValue || 15) * goldXpMult);
      const cageGold = Math.round((t.goldValue || 15) * goldXpMult);

      baseEnemy = {
        ...t,
        id: `${t.id}_bronze_challenge`,
        name: difficultyPrefix + `【精钢试炼囚笼】${t.name}`,
        hp: cageHp,
        maxHp: cageHp,
        atk: cageAtk,
        def: cageDef,
        intent: t.intent || 'ATTACK',
        intentValue: cageAtk,
        intentTurns: t.intentTurns || 1,
        xpValue: cageXp,
        goldValue: cageGold,
        icon: t.icon || 'Skull',
        isBoss: t.isBoss || false,
        isElite: false
      };
      setPendingCageReward({
        gold: Math.round(60 * goldXpMult),
        tier: ItemTier.RARE
      });
    }

    setActiveEnemy(baseEnemy);
    setScreen('BATTLE');
  };

  // Claim chest treasure box callback
  const handleClaimChestTreasure = () => {
    if (!playerStats || !activeTreasureNode) return;
    
    // Grant items based on parsed reward message
    if (treasureRewardText.includes('中型全能恢复剂')) {
      const pot2 = SHOP_ITEMS.find(i => i.id === 's_pot_2');
      if (pot2) {
        setInventory(prev => [...prev, { 
          ...pot2, 
          isEquipped: false,
          instanceId: `${pot2.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        }]);
      }
      setPlayerStats(prev => prev ? { ...prev, gold: prev.gold + 50 } : null);
    } else if (treasureRewardText.includes('小型生命药水')) {
      const pot1 = SHOP_ITEMS.find(i => i.id === 's_pot_1');
      if (pot1) {
        setInventory(prev => [...prev, { 
          ...pot1, 
          isEquipped: false,
          instanceId: `${pot1.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        }]);
      }
      setPlayerStats(prev => prev ? { ...prev, gold: prev.gold + 120 } : null);
    } else {
      const necklace = SHOP_ITEMS.find(i => i.id === 's_acc_1');
      if (necklace) {
        setInventory(prev => [...prev, { 
          ...necklace, 
          isEquipped: false,
          instanceId: `${necklace.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        }]);
      }
    }

    markNodeCompleted(activeTreasureNode.id);
    setActiveTreasureNode(null);
    setScreen('MAP');
  };

  const getActiveBossStatus = () => {
    if (!currentNodeId) return false;
    const node = dungeonNodes.find(n => n.id === currentNodeId);
    return node ? (node.type === NodeType.BOSS && node.status === 'completed') : false;
  };

  return (
    <div className="bg-stone-950 min-h-screen text-stone-100 font-sans" id="game_root_wrapper">
      
      {/* 1. SETUP CLASS SELECTOR PAGE */}
      {screen === 'SETUP' && (
        <SetupScreen onSelectClass={handleSelectClass} />
      )}

      {/* 1.5. COVENANT ALMANAC DUAL-AXIS PREVIEW */}
      {screen === 'PREVIEW' && playerStats && (
        <DungeonPreviewPage 
          playerStats={playerStats}
          onStartExpedition={() => setScreen('MAP')}
        />
      )}

      {/* 2. MAIN MAP NODE ROUTE EXPLORER PAGE */}
      {screen === 'MAP' && playerStats && (
        <div className="relative">
          <MapRoute 
            floor={dungeonFloor}
            nodes={dungeonNodes}
            onSelectNode={handleSelectNode}
            onEnterShop={() => setScreen('SHOP')}
            onEnterCharacter={() => setScreen('CHARACTER')}
            onEnterTrophy={() => setScreen('TROPHY')}
            onEnterPreview={() => setScreen('PREVIEW')}
            playerLevel={playerStats.level}
            playerGold={playerStats.gold}
            playerHp={playerStats.hp}
            playerMaxHp={playerStats.maxHp}
            playerTitle={playerStats.title}
            difficulty={playerStats.difficulty}
          />

          {/* Level up / Boss beaten floating overlay alert notices */}
          {levelUpMessage && (
            <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="lvlup_alert_frame">
              <div className="gothic-box max-w-sm w-full p-6 text-center relative flex flex-col items-center bg-stone-950 shadow-[0_0_30px_rgba(168,85,247,0.25)]" id="lvlup_box">
                {/* Ribbon border banner */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-800 to-indigo-500" />
                
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-950/50 border border-[#c5a880]/30 rounded text-[#c5a880] mb-4 animate-bounce" id="lvlup_icon">
                  <ArrowRight className="w-6 h-6 rotate-270" />
                </div>
                <h3 className="text-xl font-bold font-serif text-[#c5a880] tracking-wider uppercase">命轮惊变 · 境界大辟！</h3>
                
                <div className="bg-stone-900/60 p-4 rounded text-center border border-stone-850 my-4 text-xs font-serif text-stone-300 leading-relaxed shadow-inner">
                  {levelUpMessage}
                </div>

                <button
                  id="btn_dismiss_lvlup"
                  onClick={() => setLevelUpMessage('')}
                  className="w-full py-2 bg-gradient-to-b from-[#c5a880] to-[#a38052] hover:from-amber-400 hover:to-[#c5a880] text-stone-950 font-serif font-bold text-xs tracking-widest rounded transition-all duration-200 cursor-pointer"
                >
                  确认升级 &amp; 继续登临
                </button>
              </div>
            </div>
          )}

          {/* Sibling Boss conquered ascend prompt */}
          {getActiveBossStatus() && dungeonFloor < 5 && (
            <div className="fixed inset-0 bg-stone-950/92 backdrop-blur-md flex items-center justify-center p-4 z-50" id="floor_ascend_overlay">
              <div className="gothic-box max-w-md w-full p-8 text-center relative flex flex-col items-center bg-stone-950 shadow-[0_0_40px_rgba(16,185,129,0.2)]" id="ascend_box">
                {/* Accent band */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-800 to-teal-500" />

                <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-950/60 border border-[#c5a880]/30 rounded text-emerald-400 mb-4 animate-pulse" id="ascend_anim">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-[#c5a880] tracking-wider uppercase">踏破守关 · 功成通途！</h3>
                <p className="text-xs text-stone-400 mt-3 leading-relaxed font-sans">
                  你彻底碾碎了第 {dungeonFloor} 层的终极契约兽主！宿命底舱发出齿轮怒鸣，通往下一层未知极地神域的星界之门已向你豁然大开。
                </p>

                <button
                  id="btn_ascend_floor"
                  onClick={handleAscendFloor}
                  className="mt-6 w-full py-3 bg-gradient-to-b from-[#c5a880] to-[#a38052] hover:from-amber-400 hover:to-[#c5a880] text-stone-950 font-serif font-bold text-[12.5px] uppercase tracking-widest rounded shadow-xl animate-bounce cursor-pointer flex items-center justify-center gap-1.5"
                >
                  签订誓约：潜行下一层神域 ({dungeonFloor + 1} 层) ▶
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. COMBAT INTERACTIVE STAGE */}
      {screen === 'BATTLE' && playerStats && activeEnemy && (
        <Battle 
          playerStats={playerStats}
          enemy={activeEnemy}
          inventory={inventory}
          onUsePotion={handleDrinkPotion}
          onVictory={handleVictory}
          onDefeat={handleDefeatReset}
          onEscape={() => setScreen('MAP')}
          activatedTalents={playerStats.activatedTalents || []}
        />
      )}

      {/* 4. BLACK MARKET STORE PAGE */}
      {screen === 'SHOP' && playerStats && (
        <Shop 
          playerGold={playerStats.gold}
          inventory={inventory}
          onBuyItem={handleBuyItem}
          onLeaveShop={() => setScreen('MAP')}
        />
      )}

      {/* 5. PLAYER SHEET MANAGEMENT INVENTORY PAGE */}
      {screen === 'CHARACTER' && playerStats && (
        <CharacterSheet 
          playerStats={playerStats}
          inventory={inventory}
          equippedItems={equippedItems}
          onEquipItem={handleEquipItem}
          onUnequipItem={handleUnequipItem}
          onDrinkPotion={handleDrinkPotion}
          onLeaveCharacter={() => setScreen('MAP')}
          onActivateTalent={handleActivateTalent}
          onResetTalents={handleResetTalents}
          onDismantleItem={handleDismantleItem}
          onForgeUpgradeItem={handleForgeUpgradeItem}
          onAscendClass={handleAscendClass}
        />
      )}

      {/* 6. TROPHY ROOM AWARDS CLAIM CENTER */}
      {screen === 'TROPHY' && (
        <TrophyRoom 
          achievements={achievements}
          onClaimReward={handleClaimReward}
          onLeaveTrophy={() => setScreen('MAP')}
          highScore={highScore}
        />
      )}

      {/* 7. EVENT NODES DIALOG POPUP MOCK */}
      {screen === 'EVENT' && playerStats && activeEventNode && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="event_modal_frame">
          <div className="gothic-box max-w-lg w-full p-6 md:p-8 text-center relative flex flex-col items-center bg-stone-950 shadow-[0_0_35px_rgba(20,184,166,0.15)]" id="event_modal_box">
            {/* Accent band */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-800 to-emerald-500" />

            <div className="w-20 h-20 rounded overflow-hidden bg-stone-900 border-2 border-[#c5a880]/40 shadow-xl mb-4 flex items-center justify-center animate-pulse" id="event_monument_portrait">
              <img 
                src="/src/assets/images/pixel_event_monument_img_1780280572164.png" 
                alt="Event Monument" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {loadingAiEvent ? (
              <div className="py-8 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-500 animate-spin" />
                <span className="text-xs text-teal-400 font-mono tracking-widest uppercase animate-pulse">🔮 织命宿命灵轨在测算因果星盘...</span>
                <p className="text-[10.5px] text-stone-500 max-w-xs leading-relaxed font-sans">
                  Gemini 正在根据您的职业、战斗力与当前状态，私人定制极富代入感的暗黑哥特冒险剧本。
                </p>
              </div>
            ) : (
              <>
                <span className="text-[9px] text-teal-400 tracking-widest font-mono font-bold uppercase select-none">
                  {aiEventData ? '—— GENERATIVE FATE EVENT · 织命星盘随机奇见 ——' : '—— RANDOM EVENT · 灵龛奇遇 (极限保底) ——'}
                </span>
                
                <h3 className="text-xl font-bold font-serif text-[#c5a880] mt-1.5">{aiEventData?.title || activeEventNode.name}</h3>
                
                <p className="text-xs text-stone-400 mt-2.5 leading-relaxed font-sans text-left bg-stone-950 px-3 py-2 border border-stone-900/60 rounded select-none max-h-48 overflow-y-auto">
                  {aiEventData?.story || '这里布满尘灰与古老的荧光，空气中泛着潮湿。一块高达十米的宿命混沌石碑耸立在深草蔓延的废墟中，隐隐传来三个虚幻的声音在诱惑着你的灵魂。你决定如何对待？'}
                </p>

                <div className="mt-5 flex flex-col gap-2.5 text-xs w-full max-h-64 overflow-y-auto font-sans" id="event_options_deck">
                  {!eventChoiceClaimed ? (
                    <>
                      {aiEventData ? (
                        aiEventData.choices.map((choice) => {
                          const cannotAffordGold = choice.cost.gold > 0 && playerStats.gold < choice.cost.gold;
                          const cannotAffordHp = choice.cost.hp > 0 && playerStats.hp <= choice.cost.hp;
                          const isDisabled = cannotAffordGold || cannotAffordHp;

                          return (
                            <button
                              key={choice.id}
                              disabled={isDisabled}
                              onClick={() => {
                                audio.playUpgrade();
                                handleAiEventChoice(choice);
                              }}
                              className={`p-2.5 rounded border text-left cursor-pointer transition-all flex flex-col gap-1 text-xs select-none ${isDisabled ? 'bg-stone-920 border-stone-900/40 opacity-45 cursor-not-allowed text-stone-500' : 'bg-stone-950 border-stone-850 text-stone-200 hover:border-teal-500/40 hover:bg-teal-950/10'}`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className={`font-bold text-xs ${isDisabled ? 'text-stone-500' : 'text-stone-100'}`}>🌌 {choice.text}</span>
                                {choice.cost.hp > 0 || choice.cost.gold > 0 ? (
                                  <span className="text-[10px] text-red-400 font-mono font-bold">
                                    代价: {choice.cost.hp > 0 ? `${choice.cost.hp}HP ` : ''}{choice.cost.gold > 0 ? `${choice.cost.gold}金` : ''}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold tracking-widest">无代价</span>
                                )}
                              </div>
                              <span className="text-stone-400 text-[11px] leading-relaxed">{choice.desc}</span>
                              {choice.limit_desc && (
                                <span className="text-[10px] text-stone-500 italic mt-0.5">「{choice.limit_desc}」</span>
                              )}
                              {isDisabled && (
                                <span className="text-[10px] text-red-500 font-serif italic mt-0.5">【你目前的面部状态或财富无法承受此代价】</span>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <>
                          <button
                            key="btn_event_opt_spring"
                            id="btn_event_opt_spring"
                            onClick={() => {
                              audio.playHeal();
                              handleEventChoice('spring');
                            }}
                            className="p-3 rounded border border-stone-850 bg-stone-950 text-stone-200 text-left hover:border-teal-500/40 hover:bg-teal-950/10 cursor-pointer transition-all"
                          >
                            奠定契约 ⛲ <span className="font-bold text-white">痛饮不老圣泉</span>:
                            <span className="text-stone-400 block mt-0.5">净化伤口血痕。恢复 45 点生命生命值。</span>
                          </button>

                          <button
                            key="btn_event_opt_obelisk"
                            id="btn_event_opt_obelisk"
                            onClick={() => {
                              audio.playUpgrade();
                              handleEventChoice('obelisk');
                            }}
                            className="p-3 rounded border border-stone-850 bg-stone-950 text-stone-200 text-left hover:border-[#c5a880]/40 hover:bg-[#c5a880]/5 cursor-pointer transition-all"
                          >
                            奠定契约 🌋 <span className="font-bold text-white">接受混沌重铸</span>:
                            <span className="text-stone-400 block mt-0.5">触碰符文巨剑。损耗 20 HP 灵魂，但永久提升 +4 面板攻击力！</span>
                          </button>

                          <button
                            key="btn_event_opt_crack"
                            id="btn_event_opt_crack"
                            onClick={() => {
                              audio.playCoin();
                              handleEventChoice('crack');
                            }}
                            className="p-3 rounded border border-stone-850 bg-stone-950 text-stone-200 text-left hover:border-yellow-500/40 hover:bg-yellow-950/10 cursor-pointer transition-all"
                          >
                            奠定契约 💎 <span className="font-bold text-white">摸索碎石秘宝</span>:
                            <span className="text-stone-400 block mt-0.5">撬开巨碑下的黄金裂缝，额外获得 45枚 地牢金币奖励。</span>
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="p-4 rounded border border-teal-500/25 bg-stone-950 text-left text-teal-300 font-medium font-sans whitespace-pre-line leading-relaxed text-[11px] shadow-inner select-text">
                      {eventLogText}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="mt-6 pt-4 border-t border-stone-900 w-full font-serif">
              <button
                id="btn_event_complete_dismiss"
                disabled={!eventChoiceClaimed || loadingAiEvent}
                onClick={handleConfirmEventComplete}
                className={`w-full py-2.5 rounded font-bold text-xs tracking-widest transition-all ${eventChoiceClaimed && !loadingAiEvent ? 'bg-[#c5a880] text-stone-950 hover:bg-[#a38052] cursor-pointer' : 'bg-stone-900 border border-stone-850 text-stone-600 cursor-not-allowed'}`}
              >
                {eventChoiceClaimed ? '事件处理完毕，继续前行' : '签订抉择契约后才可以通行'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. TREASURE NODE GOLDEN CHEST DIALOG */}
      {screen === 'TREASURE' && activeTreasureNode && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="treasure_modal_frame">
          <div className="gothic-box max-w-sm w-full p-6 md:p-8 text-center relative flex flex-col items-center bg-stone-950 shadow-[0_0_35px_rgba(168,85,247,0.15)]" id="treasure_modal_box">
            {/* Accent band */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-800 to-purple-600" />

            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-950/50 border border-purple-500/30 rounded text-[#c5a880] mb-2 animate-bounce" id="chest_icon_wrapper">
              <Gift className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold font-serif text-[#c5a880] tracking-wider">破损的远古鎏金重箱</h3>
            <p className="text-xs text-stone-500 my-2 font-sans">你找到了一个沾满灰尘的金色宝箱，轻轻推动，卡条咬合发出锁盘断裂的音效。</p>
            
            <div className="p-4 rounded border border-[#c5a880]/20 bg-[#c5a880]/5 text-xs text-[#c5a880] font-serif leading-relaxed my-4 text-left shadow-inner w-full">
              {treasureRewardText}
            </div>

            <button
              id="btn_claim_treasure_chest"
              onClick={handleClaimChestTreasure}
              className="mt-2 w-full py-2.5 bg-gradient-to-b from-[#c5a880] to-[#a38052] text-stone-950 font-serif font-bold text-xs tracking-widest rounded hover:from-amber-400 hover:to-[#c5a880] cursor-pointer shadow-lg active:scale-95 duration-200 animate-pulse"
            >
              收纳宝贝 &amp; 带回包裹柜
            </button>
          </div>
        </div>
      )}

      {/* 9. CONQUEST EPIC GAME OVER / VICTORY CREDITS PAGE */}
      {screen === 'CONQUEST' && playerStats && (
        <div 
          className="flex flex-col items-center justify-center min-h-screen text-stone-100 font-serif p-6 text-center select-none relative overflow-hidden bg-cover bg-center" 
          id="conquest_view"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(16, 12, 10, 0.94), rgba(4, 3, 3, 0.98)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
            backgroundAttachment: 'fixed'
          }}
        >
          {/* Immersive vignette system */}
          <div className="vignette-ambient" />

          {/* Atmospheric dual gold flicker spotlights */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-950/20 blur-3xl animate-torch pointer-events-none z-0" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-yellow-950/20 blur-3xl animate-torch pointer-events-none z-0" />

          <div className="max-w-xl z-10 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-950 border border-[#c5a880] shadow-[0_0_15px_rgba(197,168,128,0.4)] text-[#c5a880] rounded mb-6 animate-pulse" id="conquest_trophy_glow">
              <TrophyIcon className="w-8 h-8 animate-bounce mt-1" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-[#c5a880] tracking-widest uppercase font-serif drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              宏伟神迹 · 深渊通关！
            </h1>
            <p className="text-amber-500 font-bold font-mono text-xs tracking-widest mt-1.5 uppercase">
              ★ CHAMPION CONQUEST COMPLETE ★
            </p>

            <div className="my-8 p-6 gothic-box text-left max-w-sm w-full space-y-4 font-serif bg-stone-950/65 shadow-[0_0_25px_rgba(0,0,0,0.9)]" id="conquest_scorecard">
              <h3 className="text-[#c5a880] text-center font-bold pb-2 border-b border-[#c5a880]/20 uppercase tracking-widest text-sm">
                🎖️ 圣碑功勋记事契订
              </h3>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-sans">最终职业尊位:</span>
                <span className="text-stone-100 font-bold font-serif">{playerStats.title} <span className="text-amber-400 font-mono">(Lv.{playerStats.level})</span></span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-sans">净化战祸邪崇:</span>
                <span className="text-[#c5a880] font-bold font-mono">{monstersSlain} 个目</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-sans">黑市金沙纳贡:</span>
                <span className="text-stone-300 font-semibold font-mono">{goldSpent} 颗</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-stone-900 font-bold text-xs">
                <span className="text-stone-400 font-sans">终焉威名积分:</span>
                <span className="text-yellow-405 text-sm font-extrabold font-mono">{highScore} pts</span>
              </div>
            </div>

            <p className="text-xs text-stone-405 leading-relaxed max-w-md mx-auto mb-8 font-sans">
              「你已彻底剿灭盘踞底舱古墓的灭世黑曜巨龙！整片深渊再次升腾破晓的神圣曦光。游吟诗人们在黑市酒馆里高声诵唱属于你的史诗圣名，万古圣碑林中自此增刻你的誓言！」
            </p>

            <button
              id="btn_conquest_restart_setup"
              onClick={handleDefeatReset}
              className="px-10 py-3 text-xs uppercase tracking-widest btn-pixel-gothic font-serif cursor-pointer font-black animate-bounce rounded"
            >
              🎖️ 重塑法则 · 签订新职业契约
            </button>
          </div>
        </div>
      )}

      {/* MIST RUINS POPUP */}
      {screen === 'MIST_RUINS' && playerStats && activeMistRuinsNode && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="mist_ruins_modal_frame">
          <div className="gothic-box max-w-lg w-full p-6 md:p-8 text-center relative flex flex-col items-center bg-stone-950 border border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] animate-scale-up" id="mist_ruins_modal_box">
            {/* Accent band */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-700 via-teal-500 to-cyan-500" />

            <div className="w-20 h-20 rounded bg-stone-900 border-2 border-cyan-400/40 shadow-xl mb-4 flex items-center justify-center animate-pulse" id="mist_portrait">
              <CloudFog className="w-10 h-10 text-cyan-400" />
            </div>
            <span className="text-[9px] text-cyan-400 tracking-widest font-mono font-bold uppercase">—— ANCIENT MIST RUINS · 迷雾深海遗迹 ——</span>
            
            <h3 className="text-xl font-bold font-serif text-cyan-100 mt-1.5">{activeMistRuinsNode.name}</h3>
            
            <p className="text-xs text-stone-400 mt-3 leading-relaxed font-sans">
              寒冷而泛绿的迷雾如潮水般涌来，淹没了眼前的废墟圣坛。低语声在脑海中炸响，诱导你奉献生命或是金币：探险家，你是否愿意接受浓雾深处的高风险抉择，来谋取足以逆天改命的神圣至宝？
            </p>

            <div className="mt-6 flex flex-col gap-3 text-xs w-full" id="mist_options_deck">
              {!mistRuinsChoiceClaimed ? (
                <>
                  <button
                    key="btn_mist_opt_sacrifice"
                    id="btn_mist_opt_sacrifice"
                    onClick={() => handleMistRuinsChoice('sacrifice')}
                    className="p-3 rounded border border-stone-850 bg-stone-950 text-stone-200 text-left hover:border-red-500/40 hover:bg-red-950/10 cursor-pointer transition-all flex items-center gap-3"
                  >
                    <span className="text-xl">🩸</span>
                    <div>
                      <span className="font-bold text-white">舍命祭献 (高风险高回报)</span>
                      <span className="text-stone-400 block mt-0.5 text-[11px]">消耗当前安全的 <span className="text-red-400 font-bold">40 点生命值</span> (强力保底1血)，获得1件随机专属珍物装备 (稀有、史诗或传说装备)！</span>
                    </div>
                  </button>

                  <button
                    key="btn_mist_opt_absorb"
                    id="btn_mist_opt_absorb"
                    onClick={() => handleMistRuinsChoice('absorb')}
                    className="p-3 rounded border border-stone-850 bg-stone-950 text-stone-200 text-left hover:border-cyan-500/50 hover:bg-cyan-950/10 cursor-pointer transition-all flex items-center gap-3"
                  >
                    <span className="text-xl">🌀</span>
                    <div>
                      <span className="font-bold text-white">冥河迷雾同化 (高风险)</span>
                      <span className="text-stone-400 block mt-0.5 text-[11px]">损耗当前生命极限的 <span className="text-cyan-400 font-bold">50% 生命值</span> 注入迷雾，永久获得 <span className="text-yellow-500 font-bold">【攻击力+7、防御力+7】</span> 的超凡神格永久强化！</span>
                    </div>
                  </button>

                  <button
                    key="btn_mist_opt_potion"
                    id="btn_mist_opt_potion"
                    onClick={() => handleMistRuinsChoice('mist_potion')}
                    className="p-3 rounded border border-stone-850 bg-stone-950 text-stone-200 text-left hover:border-amber-500/40 hover:bg-amber-950/10 cursor-pointer transition-all flex items-center gap-3"
                  >
                    <span className="text-xl">🧪</span>
                    <div>
                      <span className="font-bold text-white">祭拜圣井神水 (金币兑换)</span>
                      <span className="text-stone-400 block mt-0.5 text-[11px]">花费行囊里的 <span className="text-yellow-400 font-bold">80 枚金币</span>。井水瞬息被超自然极速唤醒，<span className="text-green-400 font-bold">生命值与魔力值全数恢复 100% 满状态！</span></span>
                    </div>
                  </button>

                  <button
                    key="btn_mist_opt_leave"
                    id="btn_mist_opt_leave"
                    onClick={() => handleMistRuinsChoice('leave')}
                    className="p-3 rounded border border-stone-850 bg-stone-950 text-stone-300 text-left hover:border-stone-500 hover:bg-stone-900 cursor-pointer transition-all flex items-center gap-3"
                  >
                    <span className="text-xl">🚶‍♂️</span>
                    <div>
                      <span className="font-bold text-stone-200">谨慎避开迷域 (安全)</span>
                      <span className="text-stone-400 block mt-0.5 text-[11px]">不冒任何重伤险，仅在遗迹草堆搜寻捡起并收获 <span className="text-yellow-500 font-bold">+25 金币</span> 奖励后安全地撤离。</span>
                    </div>
                  </button>
                </>
              ) : (
                <div className="p-4 rounded border border-cyan-500/25 bg-stone-950 text-left text-cyan-300 font-medium font-sans text-xs leading-relaxed shadow-inner">
                  {mistRuinsLogText}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-900 w-full font-serif">
              <button
                id="btn_mist_complete_dismiss"
                disabled={!mistRuinsChoiceClaimed}
                onClick={handleConfirmMistRuinsComplete}
                className={`w-full py-2.5 rounded font-bold text-xs tracking-widest transition-all ${mistRuinsChoiceClaimed ? 'bg-[#22d3ee] text-stone-950 hover:bg-cyan-400 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-stone-900 border border-stone-850 text-stone-600 cursor-not-allowed'}`}
              >
                {mistRuinsChoiceClaimed ? '迷雾飘散，整理行头继续前行' : '必须向古老誓约做出抉择'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WANDERING MERCHANT SUPER REWARD SHOP */}
      {screen === 'WANDERING_MERCHANT' && playerStats && (
        <div 
          className="flex flex-col min-h-screen text-stone-100 font-serif bg-cover bg-center bg-no-repeat relative overflow-hidden" 
          id="wandering_merchant_view_container"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(12, 10, 9, 0.94), rgba(4, 2, 2, 0.99)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
            backgroundAttachment: 'fixed'
          }}
        >
          {/* Torch light projection with amber pulse */}
          <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-950/20 blur-3xl pointer-events-none" />

          {/* Top Header */}
          <header className="z-20 bg-stone-950/95 border-b-4 border-amber-500/20 p-4 sticky top-0 shadow-lg" id="wand_top_header">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-amber-500/30 bg-stone-900 rounded">
                  <Coins className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-md font-bold tracking-widest text-[#c5a880]">「 行行脚奇珍 · 绝世特惠站 」</h1>
                  <p className="text-[10px] text-stone-400 font-sans mt-0.5">随机刷出折上折神装，走过路过切勿错过！</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Gold Display */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-stone-800 rounded font-mono text-sm shadow-inner mt-0" id="wand_gold_tag">
                  <span className="text-yellow-400 font-sans">🪙</span>
                  <span id="wand_gold_amt" className="font-bold text-yellow-101">{playerStats.gold}</span>
                </div>

                <button
                  id="btn_leave_wandering_merchant"
                  onClick={() => {
                    if (activeWanderingMerchantNode) {
                      markNodeCompleted(activeWanderingMerchantNode.id);
                    }
                    setActiveWanderingMerchantNode(null);
                    setScreen('MAP');
                  }}
                  className="px-4 py-1.5 bg-yellow-600 text-stone-950 hover:bg-[#c5a880] font-bold text-xs tracking-wider transition-all duration-200 cursor-pointer select-none rounded flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>整理行装继续前进</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 z-10 flex flex-col md:flex-row gap-6 items-center">
            {/* Merchant Poster Area */}
            <div className="w-full md:w-1/3 flex flex-col items-center text-center p-5 rounded-xl bg-stone-950/80 border border-stone-850 shadow-2xl relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-amber-500/40 rounded-t-xl" />
              <div className="w-32 h-32 rounded bg-stone-900 border-2 border-yellow-500/20 shadow-xl overflow-hidden mb-3">
                <img 
                  src="/src/assets/images/pixel_event_monument_img_1780280572164.png" 
                  alt="Wandering Merchant" 
                  className="w-full h-full object-cover scale-110 saturate-150"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-md font-bold text-amber-200">行脚游商 · 卡洛斯</h2>
              <p className="text-xs text-stone-400 leading-relaxed font-sans px-2 mt-2">
                “呼……这深幽地牢危机四伏，我好不容易才搜刮出这几件遗失孤品。看你是大帝之姿，算你折上折！购买了你可千万别亏待了它们！”
              </p>
            </div>

            {/* Merchant Stock */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wanderingMerchantItems.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center p-12 text-center bg-stone-950/80 border border-stone-850 rounded-xl">
                  <Sparkles className="w-12 h-12 text-stone-600 mb-2" />
                  <p className="text-sm text-stone-400">卡洛斯挑起扁担：“商品已被抢购一空！多谢捧场，咱们山高水长，后会有期！”</p>
                </div>
              ) : (
                wanderingMerchantItems.map(item => {
                  const getTierBadgeColor = (tier: ItemTier) => {
                    switch (tier) {
                      case ItemTier.COMMON: return 'bg-stone-800 text-stone-300 border-stone-700';
                      case ItemTier.RARE: return 'bg-blue-950/50 text-blue-400 border-blue-900/40';
                      case ItemTier.EPIC: return 'bg-purple-950/50 text-purple-400 border-purple-900/40';
                      case ItemTier.LEGENDARY: return 'bg-yellow-950/50 text-yellow-500 border-yellow-900/40 animate-pulse';
                    }
                  };

                  return (
                    <div 
                      key={item.instanceId || item.id} 
                      className="group p-4 bg-stone-950 border border-stone-850 hover:border-amber-500/40 hover:bg-stone-900/40 transition-all rounded-lg flex flex-col justify-between shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded border ${getTierBadgeColor(item.tier)} font-mono font-bold uppercase`}>
                          ★ {item.tier}
                        </span>
                        
                        <span className="text-[9px] font-bold text-red-100 bg-red-600/90 px-2 py-0.5 rounded font-sans">
                          半价抢购 🔥
                        </span>
                      </div>

                      <div className="flex items-center gap-3 my-2">
                        <div className="w-12 h-12 bg-stone-900 border border-stone-800 flex items-center justify-center rounded shrink-0">
                          {item.type === ItemType.WEAPON && <Sword className="w-5 h-5 text-amber-400 animate-spin-slow" />}
                          {item.type === ItemType.ARMOR && <Shield className="w-5 h-5 text-cyan-400" />}
                          {item.type === ItemType.ACCESSORY && <Sparkles className="w-5 h-5 text-purple-400" />}
                          {item.type === ItemType.POTION && <span className="text-xl">🧪</span>}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-stone-100">{item.name}</h4>
                          <span className="text-[10px] text-stone-400 font-sans block mt-0.5 leading-normal">{item.description}</span>
                        </div>
                      </div>

                      {/* Stat summary */}
                      <div className="my-2.5 flex flex-wrap gap-2 text-[10px] font-sans pb-2 border-b border-stone-900">
                        {item.atkBonus && <span className="text-red-400">⚔️ 攻击 +{item.atkBonus}</span>}
                        {item.defBonus && <span className="text-cyan-400">🛡️ 防御 +{item.defBonus}</span>}
                        {item.hpBonus && <span className="text-green-400">❤️ 生命上限 +{item.hpBonus}</span>}
                        {item.mpBonus && <span className="text-purple-400">🔮 魔法上限 +{item.mpBonus}</span>}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="font-mono text-xs text-yellow-405 font-bold flex items-center gap-1">
                          售价: 🪙 {item.cost}
                        </span>

                        <button
                          onClick={() => handleWanderingBuy(item)}
                          disabled={playerStats.gold < item.cost}
                          className={`px-3 py-1.5 rounded text-xs select-none cursor-pointer font-bold transition-all ${
                            playerStats.gold >= item.cost 
                              ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95' 
                              : 'bg-stone-900 text-stone-500 cursor-not-allowed border border-stone-850'
                          }`}
                        >
                          {playerStats.gold >= item.cost ? '立刻买下 🤝' : '金币筹码不够'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>
      )}

      {/* CAGE CHALLENGE PREPARATION POPUP */}
      {screen === 'CAGE_CHALLENGE' && activeCageChallengeNode && playerStats && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="cage_challenge_frame">
          <div className="gothic-box max-w-2xl w-full p-6 md:p-8 text-center relative flex flex-col items-center bg-stone-950 border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)]" id="cage_challenge_box">
            {/* Accent band */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-800 via-rose-600 to-red-500" />

            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-950/40 border border-red-500/30 rounded text-red-500 mb-3 animate-pulse">
              <Flame className="w-8 h-8" />
            </div>

            <span className="text-[10px] text-red-500 tracking-widest font-mono font-bold uppercase">—— CHAOTIC ARENA CHALLENGE · 地牢生死囚笼 ——</span>
            <h3 className="text-xl font-bold font-serif text-stone-100 tracking-wider mt-1">{activeCageChallengeNode.name}</h3>
            
            <p className="text-xs text-stone-400 my-3 font-sans leading-relaxed max-w-md">
              在你面前横亘着三座流淌着血与熔岩的战栗钢魂囚笼。封印在此的地牢狱卒将根据契约强行响应复苏。选择挑战囚笼，通关将获得绝顶的圣器与丰厚赏金！
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-5">
              {/* Bronze Tier */}
              <div className="border border-stone-850 bg-stone-900/30 rounded p-4 hover:border-stone-700 hover:bg-stone-900/60 transition-all flex flex-col justify-between" id="cage_bronze_pnl">
                <div>
                  <div className="text-stone-400 font-bold mb-1 border-b border-stone-800 pb-1 text-sm">【精钢试炼笼】</div>
                  <div className="text-[10px] text-stone-400 leading-normal font-sans text-left mt-1">
                    • 敌方强度: <span className="text-amber-500 font-semibold">1.1倍</span> HP/ATK<br/>
                    • 守备模板: 地牢禁卫军副官<br/>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded font-serif mb-3">
                    附赠: 🪙60金币 &amp; RARE装备
                  </div>
                  <button
                    onClick={() => handleStartCageChallenge('BRONZE')}
                    className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100 px-3 py-1.5 rounded text-xs cursor-pointer font-serif font-semibold border border-stone-700"
                  >
                    接受契约 ⚔️
                  </button>
                </div>
              </div>

              {/* Silver Tier */}
              <div className="border border-purple-900/40 bg-purple-950/5 rounded p-4 hover:border-purple-500/40 hover:bg-purple-950/10 transition-all flex flex-col justify-between" id="cage_silver_pnl">
                <div>
                  <div className="text-purple-400 font-bold mb-1 border-b border-purple-900/60 pb-1 text-sm">【极刑熔岩笼】</div>
                  <div className="text-[10px] text-stone-400 leading-normal font-sans text-left mt-1">
                    • 敌方强度: <span className="text-amber-500 font-semibold">1.25倍</span> 生命 / <span className="text-amber-500 font-semibold">1.15倍</span> 攻击力<br/>
                    • 守备模板: 狂暴岩浆死灵骑士<br/>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] text-purple-401 bg-purple-950/30 px-2 py-1 rounded font-serif mb-3 border border-purple-900/50">
                    附赠: 🪙150金币 &amp; EPIC装备
                  </div>
                  <button
                    onClick={() => handleStartCageChallenge('SILVER')}
                    className="w-full bg-purple-950/80 hover:bg-purple-900 text-purple-200 px-3 py-1.5 rounded text-xs cursor-pointer font-serif font-semibold border border-purple-800"
                  >
                    挑战炼狱 ⚔️
                  </button>
                </div>
              </div>

              {/* Gold Tier */}
              <div className="border border-red-900 bg-red-950/10 rounded p-4 hover:border-red-500/50 hover:bg-red-950/20 transition-all flex flex-col justify-between" id="cage_gold_pnl">
                <div>
                  <div className="text-red-500 font-bold mb-1 border-b border-red-900/60 pb-1 text-sm">【黑曜极耀笼】</div>
                  <div className="text-[10px] text-stone-400 leading-normal font-sans text-left mt-1">
                    • 敌方强度: <span className="text-rose-500 font-semibold">1.50倍</span> 生命 / <span className="text-rose-500 font-semibold">1.3X</span> 伤害攻速<br/>
                    • 守备模板: 战魔天主神格化身<br/>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] text-yellow-501 bg-red-950 color-red border border-red-700/40 px-2 py-1 rounded font-serif mb-3">
                    附赠: 🪙320金币 &amp; LEGENDARY武器
                  </div>
                  <button
                    onClick={() => handleStartCageChallenge('GOLD')}
                    className="w-full bg-red-700 text-stone-950 font-bold hover:bg-red-600 px-3 py-1.5 rounded text-xs cursor-pointer font-serif flex items-center justify-center gap-1"
                  >
                    生死大捷 ☠️
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-900 w-full font-serif flex justify-center">
              <button
                id="btn_cage_exit"
                onClick={() => {
                  setScreen('MAP');
                }}
                className="px-8 py-2 bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs tracking-wider transition-all rounded hover:bg-stone-900 cursor-pointer"
              >
                暂不应战，返回寻道 ◀
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
