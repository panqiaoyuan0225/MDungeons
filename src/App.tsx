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
  ItemTier 
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
  SHOP_ITEMS
} from './constants';

import SetupScreen from './components/SetupScreen';
import MapRoute from './components/MapRoute';
import Battle from './components/Battle';
import Shop from './components/Shop';
import CharacterSheet from './components/CharacterSheet';
import TrophyRoom from './components/TrophyRoom';

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
  Trophy as TrophyIcon
} from 'lucide-react';

type ScreenState = 'SETUP' | 'MAP' | 'BATTLE' | 'SHOP' | 'CHARACTER' | 'TROPHY' | 'EVENT' | 'TREASURE' | 'CONQUEST';

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

  // Treasure modal state
  const [activeTreasureNode, setActiveTreasureNode] = useState<DungeonNode | null>(null);
  const [treasureRewardText, setTreasureRewardText] = useState<string>('');
  const [treasureRewardClaimed, setTreasureRewardClaimed] = useState<boolean>(false);

  // Level Up overlay message state
  const [levelUpMessage, setLevelUpMessage] = useState<string>('');

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
  const handleSelectClass = (classType: CharacterClass) => {
    const stats = { ...INITIAL_PLAYER_STATS[classType] };
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
    
    setScreen('MAP');
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
      enemyTemplate = dungeonFloor === 1 ? BOSS_F1 : (dungeonFloor === 2 ? BOSS_F2 : BOSS_F3);
    } else if (node.type === NodeType.ELITE) {
      const templates = dungeonFloor === 1 ? ELITE_MONSTERS_F1 : (dungeonFloor === 2 ? ELITE_MONSTERS_F2 : ELITE_MONSTERS_F3 || ELITE_MONSTERS_F1);
      enemyTemplate = templates[Math.floor(Math.random() * templates.length)];
    } else {
      // Normal combat
      const templates = dungeonFloor === 1 ? NORMAL_MONSTERS_F1 : (dungeonFloor === 2 ? NORMAL_MONSTERS_F2 : NORMAL_MONSTERS_F3);
      enemyTemplate = templates[Math.floor(Math.random() * templates.length)];
    }

    const battleEnemy: Enemy = {
      id: enemyTemplate.id || 'm_rnd',
      name: enemyTemplate.name || '怪兽哨卫',
      hp: enemyTemplate.hp || 40,
      maxHp: enemyTemplate.hp || 40,
      atk: enemyTemplate.atk || 8,
      def: enemyTemplate.def || 2,
      intent: 'ATTACK',
      intentValue: enemyTemplate.atk || 8,
      intentTurns: 1,
      xpValue: enemyTemplate.xpValue || 20,
      goldValue: enemyTemplate.goldValue || 15,
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

      return {
        ...prev,
        level: nextLvl,
        exp: nextExp,
        expToNextLevel: nextLvl * 100,
        gold: prev.gold + goldEarned,
        maxHp: nextMaxHp,
        maxMp: nextMaxMp,
        hp: didLvlUp ? nextMaxHp : prev.hp,
        mp: didLvlUp ? nextMaxMp : prev.mp,
        atk: nextAtk,
        def: nextDef,
        title: getPlayerTitle(prev.classType, nextLvl)
      };
    });

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
        if (dungeonFloor === 3) {
          updateAchievementsProgress('floor', 3);
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
            playerLevel={playerStats.level}
            playerGold={playerStats.gold}
            playerHp={playerStats.hp}
            playerMaxHp={playerStats.maxHp}
            playerTitle={playerStats.title}
          />

          {/* Level up / Boss beaten floating overlay alert notices */}
          {levelUpMessage && (
            <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="lvlup_alert_frame">
              <div className="bg-gradient-to-b from-purple-950 to-stone-900 border-2 border-purple-500 rounded-3xl p-6 md:p-8 max-w-md text-center shadow-2xl relative" id="lvlup_box">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-500/20 rounded-full text-purple-400 mb-4 animate-bounce" id="lvlup_icon">
                  <ArrowRight className="w-8 h-8 rotate-270" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-widest uppercase">境界破空，实力飞跃</h3>
                <p className="text-xs text-stone-300 mt-3.5 leading-relaxed">{levelUpMessage}</p>
                <button
                  id="btn_dismiss_lvlup"
                  onClick={() => setLevelUpMessage('')}
                  className="mt-6 px-6 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs tracking-wider hover:bg-purple-500 cursor-pointer"
                >
                  确认升级 &amp; 继续登峰
                </button>
              </div>
            </div>
          )}

          {/* Sibling Boss conquered ascend prompt */}
          {getActiveBossStatus() && dungeonFloor < 3 && (
            <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50" id="floor_ascend_overlay">
              <div className="bg-gradient-to-b from-emerald-950 to-stone-900 border border-emerald-500 rounded-3xl p-8 max-w-md text-center shadow-2xl" id="ascend_box">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/20 rounded-full text-emerald-400 mb-4 animate-ping" id="ascend_anim">
                  <Compass className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">踏破层关通途！</h3>
                <p className="text-xs text-stone-350 mt-3 leading-relaxed">
                  你彻底碾碎了第 {dungeonFloor} 层的终极守门领主！深邃的底舱发出齿轮轰鸣，前往下一层更可怕极地神域的星门已向你开启。
                </p>

                <button
                  id="btn_ascend_floor"
                  onClick={handleAscendFloor}
                  className="mt-6 w-full py-3 rounded-xl bg-emerald-600 font-bold text-sm text-white hover:bg-emerald-550 shadow-lg tracking-wider animate-bounce cursor-pointer"
                >
                  筑行契约：踏入第 {dungeonFloor + 1} 层地牢大门 ▶
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
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="event_modal_frame">
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center shadow-2xl relative flex flex-col items-center" id="event_modal_box">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-xl mb-3 flex items-center justify-center animate-pulse" id="event_monument_portrait">
              <img 
                src="/src/assets/images/pixel_event_monument_img_1780280572164.png" 
                alt="Event Monument" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[10px] text-teal-400 tracking-widest font-mono font-bold uppercase">RANDOM EVENT SCENE</span>
            
            <h3 className="text-xl font-bold text-white mt-1">{activeEventNode.name}</h3>
            
            <p className="text-xs text-stone-400 mt-3 leading-relaxed">
              这里布满尘灰与古老的荧光，空气中泛着潮湿。一块高达十米的宿命混沌石碑耸立在深草蔓延的废墟中，隐隐传来三个虚幻的声音在诱惑着你的灵魂。你决定如何对待？
            </p>

            <div className="mt-6 flex flex-col gap-3 text-xs" id="event_options_deck">
              {!eventChoiceClaimed ? (
                <>
                  <button
                    id="btn_event_opt_spring"
                    onClick={() => handleEventChoice('spring')}
                    className="p-3 rounded-xl border border-stone-800 bg-stone-900 text-stone-200 text-left hover:border-teal-500/40 hover:bg-teal-950/10 cursor-pointer hover:scale-101 transition-all"
                  >
                    ⛲ <span className="font-bold text-white">痛饮不老圣泉</span>:
                    <span className="text-stone-400 block mt-0.5">净化伤口血痕。恢复 45 点生命生命值。</span>
                  </button>

                  <button
                    id="btn_event_opt_obelisk"
                    onClick={() => handleEventChoice('obelisk')}
                    className="p-3 rounded-xl border border-stone-800 bg-stone-900 text-stone-200 text-left hover:border-orange-500/40 hover:bg-orange-950/10 cursor-pointer hover:scale-101 transition-all"
                  >
                    🌋 <span className="font-bold text-white">接受混沌重铸</span>:
                    <span className="text-stone-400 block mt-0.5">触碰符文巨剑。损耗 20 HP 灵魂，但永久提升 +4 面板攻击力！</span>
                  </button>

                  <button
                    id="btn_event_opt_crack"
                    onClick={() => handleEventChoice('crack')}
                    className="p-3 rounded-xl border border-stone-800 bg-stone-900 text-stone-200 text-left hover:border-yellow-500/40 hover:bg-yellow-950/10 cursor-pointer hover:scale-101 transition-all"
                  >
                    💎 <span className="font-bold text-white">摸索碎石秘宝</span>:
                    <span className="text-stone-400 block mt-0.5">撬开巨碑下的黄金裂缝，额外获得 45枚 地牢金币奖励。</span>
                  </button>
                </>
              ) : (
                <div className="p-4 rounded-xl border border-teal-500/25 bg-teal-950/15 text-left text-teal-300 font-medium">
                  {eventLogText}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-900">
              <button
                id="btn_event_complete_dismiss"
                disabled={!eventChoiceClaimed}
                onClick={handleConfirmEventComplete}
                className={`w-full py-2.5 rounded-xl font-bold font-sans text-xs transition-all ${eventChoiceClaimed ? 'bg-teal-600 text-white hover:bg-teal-500 cursor-pointer' : 'bg-stone-900 border border-stone-850 text-stone-600 cursor-not-allowed'}`}
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
          <div className="bg-gradient-to-b from-purple-950 to-stone-950 border border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl relative" id="treasure_modal_box">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-500/10 rounded-full text-purple-400 mb-2 animate-bounce" id="chest_icon_wrapper">
              <Gift className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-white mt-2">破损的黄金防守密卡</h3>
            <p className="text-xs text-stone-500 my-2">你找到了一个沾满灰尘的金色宝箱，轻轻推动，卡条咬合发出锁盘断裂的音效。</p>
            
            <div className="p-4 rounded-xl border border-purple-500/25 bg-purple-950/10 text-xs text-purple-300 font-medium leading-relaxed my-4 text-left">
              {treasureRewardText}
            </div>

            <button
              id="btn_claim_treasure_chest"
              onClick={handleClaimChestTreasure}
              className="mt-2 w-full py-2.5 rounded-xl bg-purple-600 font-extrabold text-sm text-white hover:bg-purple-550 shadow-md cursor-pointer transition-all active:scale-95"
            >
              收纳宝贝 &amp; 带回包裹柜
            </button>
          </div>
        </div>
      )}

      {/* 9. CONQUEST EPIC GAME OVER / VICTORY CREDITS PAGE */}
      {screen === 'CONQUEST' && playerStats && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-stone-100 font-sans p-6 text-center select-none relative" id="conquest_view">
          {/* Confetti or spark lines decor particles */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1),transparent_60%)] pointer-events-none" />

          <div className="max-w-xl z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full border-2 border-yellow-500 text-yellow-405 mb-6 animate-pulse" id="conquest_trophy_glow">
              <TrophyIcon className="w-10 h-10" />
            </div>

            <h1 className="text-4xl font-extrabold text-white tracking-widest uppercase">
              宏伟神迹：深渊破空通关！
            </h1>
            <p className="text-rose-450 font-bold font-mono text-sm tracking-widest mt-1">
              CHAMPION CONQUEST COMPLETE
            </p>

            <div className="my-8 p-6 bg-stone-900 border border-stone-850 rounded-2xl text-left text-xs font-mono max-w-sm mx-auto space-y-4" id="conquest_scorecard">
              <h3 className="text-stone-400 text-center font-bold pb-2 border-b border-stone-800 uppercase tracking-widest">
                🏆 无畏者历险记事本
              </h3>
              <div className="flex justify-between">
                <span className="text-stone-500">最终职业等级:</span>
                <span className="text-white font-bold">{playerStats.title} (Lv.{playerStats.level})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">净化战祸魔物:</span>
                <span className="text-red-400 font-bold">{monstersSlain} 个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">黑市金沙开销:</span>
                <span className="text-emerald-400 font-bold">{goldSpent} 金币</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-800 font-bold">
                <span className="text-stone-300">终焉威名积分:</span>
                <span className="text-yellow-400 text-sm font-extrabold">{highScore} pts</span>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto mb-8">
              「你彻底剿灭了灭世黑曜堕落龙帝！大陆再次迎来了破晓的光辉。吟游诗人们正在酒馆中高歌你的史诗称号，你已被铸写在不朽圣碑之林！」
            </p>

            <button
              id="btn_conquest_restart_setup"
              onClick={handleDefeatReset}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-stone-950 font-bold text-sm tracking-wider shadow-xl animate-bounce cursor-pointer"
            >
              🎖️ 重塑史诗：签订新职业誓约
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
