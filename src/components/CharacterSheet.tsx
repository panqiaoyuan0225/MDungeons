/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerStats, Item, ItemType, ItemTier } from '../types';
import { getPlayerTitle, CLASS_IMAGES } from '../constants';
import { PixelTransparentImage } from './PixelTransparentImage';
import { 
  ChevronLeft, 
  Sword, 
  Shield, 
  Gem, 
  Heart, 
  Zap, 
  User, 
  Compass, 
  Sparkles,
  Trophy,
  ArrowUpCircle
} from 'lucide-react';

interface CharacterSheetProps {
  playerStats: PlayerStats;
  inventory: Item[];
  equippedItems: Item[];
  onEquipItem: (item: Item) => void;
  onUnequipItem: (item: Item) => void;
  onDrinkPotion: (potionId: string) => void;
  onLeaveCharacter: () => void;
}

export default function CharacterSheet({
  playerStats,
  inventory,
  equippedItems,
  onEquipItem,
  onUnequipItem,
  onDrinkPotion,
  onLeaveCharacter
}: CharacterSheetProps) {
  
  const getAvatarIcon = () => {
    const iconSize = "w-5 h-5 text-white";
    const imgUrl = CLASS_IMAGES[playerStats.classType];
    
    let iconEl = <Sword className={iconSize} id="char_avatar_war" />;
    let gradient = "from-amber-600 to-amber-500 shadow-amber-900/30";
    if (playerStats.classType === 'MAGE') {
      iconEl = <Sparkles className={iconSize} id="char_avatar_mage" />;
      gradient = "from-purple-600 to-purple-500 shadow-purple-900/30";
    } else if (playerStats.classType === 'ROGUE') {
      iconEl = <Compass className={iconSize} id="char_avatar_rogue" />;
      gradient = "from-emerald-600 to-emerald-500 shadow-emerald-900/30";
    }

    return (
      <div className="relative group/avatar">
         <div className={`p-1 rounded-2xl bg-gradient-to-tr ${gradient} shadow-lg relative overflow-hidden`}>
           <PixelTransparentImage 
             src={imgUrl} 
             alt={playerStats.classType} 
             className="w-24 h-24 rounded-xl object-cover border border-white/10" 
           />
         </div>
        <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-tr ${gradient} shadow-md border border-stone-900 text-white animate-bounce`}>
          {iconEl}
        </div>
      </div>
    );
  };

  const getTierBorderColor = (tier: ItemTier) => {
    switch (tier) {
      case ItemTier.COMMON: return 'border-stone-850 bg-stone-900/30';
      case ItemTier.RARE: return 'border-blue-900/40 bg-blue-950/10 text-blue-300';
      case ItemTier.EPIC: return 'border-purple-900/40 bg-purple-950/10 text-purple-300';
      case ItemTier.LEGENDARY: return 'border-yellow-500/40 bg-yellow-950/10 text-yellow-350 animate-pulse';
    }
  };

  // Find currently equipped items by type
  const activeWeapon = equippedItems.find(i => i.type === ItemType.WEAPON);
  const activeArmor = equippedItems.find(i => i.type === ItemType.ARMOR);
  const activeAccessory = equippedItems.find(i => i.type === ItemType.ACCESSORY);

  return (
    <div 
      className="flex flex-col min-h-screen font-sans text-stone-100 bg-cover bg-center bg-no-repeat" 
      id="character_sheet_container"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(30, 27, 75, 0.74), rgba(12, 10, 9, 0.96)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Upper header */}
      <header className="z-10 bg-stone-900/80 backdrop-blur-md border-b border-stone-800 p-4 sticky top-0" id="char_top_header">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            id="btn_char_leave"
            onClick={onLeaveCharacter}
            className="px-3.5 py-1.5 rounded-lg border border-stone-800 bg-stone-950 text-xs font-semibold hover:bg-stone-900 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> 返回深渊地图
          </button>

          <span className="text-xs text-stone-400 font-mono tracking-widest hidden md:inline">
            角色阶级管理与随身背包柜
          </span>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="char_grid_split">
        
        {/* Left Column: Character Card Stats & Equip Panels (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="char_left_pnl">
          {/* Avatar and tier header info */}
          <div className="bg-stone-900/40 border border-stone-900 rounded-2xl p-6 flex flex-col items-center text-center relative" id="char_identity_card">
            <div className="absolute top-4 right-4 text-[10px] font-mono tracking-widest text-stone-600 bg-stone-950 p-2 rounded-lg border border-stone-900" id="char_class_title">
              {playerStats.classType} CLASS
            </div>

            {getAvatarIcon()}

            <div className="mt-4">
              <h2 className="text-2xl font-black text-white tracking-wide">{playerStats.title}</h2>
              <div className="text-xs text-rose-500 font-semibold font-mono tracking-widest mt-1">
                荣誉称号: {getPlayerTitle(playerStats.classType, playerStats.level)}
              </div>
            </div>

            {/* Exp progression panel */}
            <div className="w-full mt-6 bg-stone-950 p-3.5 rounded-xl border border-stone-900 text-xs text-left" id="exp_progres_pnl">
              <div className="flex justify-between items-center text-stone-400 font-mono">
                <span>经验值进度 (EXP)</span>
                <span>{playerStats.exp} / {playerStats.expToNextLevel} XP</span>
              </div>
              <div className="mt-1.5 w-full bg-stone-800 h-2.5 rounded-full overflow-hidden relative">
                <div 
                  className="bg-purple-600 h-full transition-all duration-300"
                  style={{ width: `${(playerStats.exp / playerStats.expToNextLevel) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed">
                累计清理遭遇门、战火魔巢，可在达到100%时自动升华等级，升级将同时恢复全满状态HP/MP，并永久提升生命、法力基底属性！
              </p>
            </div>
          </div>

          {/* Player core stats list panel */}
          <div className="bg-stone-900/40 border border-stone-900 rounded-2xl p-6" id="char_stats_pnl">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-500" />
              当前全额增幅属性 (含装备)
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded-lg border border-stone-900 hover:border-red-500/20 transition-all">
                <span className="flex items-center gap-1.5 text-red-400"><Heart className="w-4 h-4" /> 生命上限</span>
                <span className="font-bold text-white text-sm">{playerStats.hp} / {playerStats.maxHp} HP</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded-lg border border-stone-900 hover:border-blue-500/20 transition-all">
                <span className="flex items-center gap-1.5 text-blue-400"><Zap className="w-4 h-4" /> 魔力上限</span>
                <span className="font-bold text-white text-sm">{playerStats.mp} / {playerStats.maxMp} MP</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded-lg border border-stone-900 hover:border-amber-500/20 transition-all">
                <span className="flex items-center gap-1.5 text-amber-400"><Sword className="w-4 h-4" /> 物理法术攻击力</span>
                <span className="font-bold text-white text-sm">{playerStats.atk} ATK</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded-lg border border-stone-900 hover:border-sky-400/20 transition-all">
                <span className="flex items-center gap-1.5 text-sky-450"><Shield className="w-4 h-4" /> 坚石护甲格挡力</span>
                <span className="font-bold text-white text-sm">{playerStats.def} DEF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inventory Bags and Equips slot (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6" id="char_right_pnl">
          {/* Active Armed Slots */}
          <div className="bg-stone-900/40 border border-stone-900 rounded-2xl p-6" id="equipped_slots_box">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-405 animate-pulse" /> 
              当前已武装的神兵法甲
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Slot 1: Weapon */}
              <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center min-h-[140px] relative ${activeWeapon ? getTierBorderColor(activeWeapon.tier) : 'border-dashed border-stone-800 bg-stone-950/20'}`} id="slot_weapon">
                <span className="absolute top-2 left-2 text-[9px] text-stone-500 uppercase font-mono">神兵武器 Slot</span>
                {activeWeapon ? (
                  <>
                    <Sword className="w-8 h-8 text-amber-500 mb-2" />
                    <div className="text-xs font-bold text-white mb-1 line-clamp-1">{activeWeapon.name}</div>
                    <div className="text-[10px] text-amber-400 font-mono mb-2">+{activeWeapon.atkBonus} 攻击力</div>
                    <button
                      id={`btn_unequip_${activeWeapon.id}`}
                      onClick={() => onUnequipItem(activeWeapon)}
                      className="px-2.5 py-1 rounded bg-stone-950 border border-stone-850 text-[10px] text-red-400 hover:bg-stone-900 cursor-pointer"
                    >
                      卸下武装
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-stone-600">武器插槽空置中</span>
                )}
              </div>

              {/* Slot 2: Armor */}
              <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center min-h-[140px] relative ${activeArmor ? getTierBorderColor(activeArmor.tier) : 'border-dashed border-stone-800 bg-stone-950/20'}`} id="slot_armor">
                <span className="absolute top-2 left-2 text-[9px] text-stone-500 uppercase font-mono">战甲护心 Slot</span>
                {activeArmor ? (
                  <>
                    <Shield className="w-8 h-8 text-sky-400 mb-2" />
                    <div className="text-xs font-bold text-white mb-1 line-clamp-1">{activeArmor.name}</div>
                    <div className="text-[10px] text-sky-300 font-mono mb-2">+{activeArmor.defBonus} 防御力</div>
                    <button
                      id={`btn_unequip_${activeArmor.id}`}
                      onClick={() => onUnequipItem(activeArmor)}
                      className="px-2.5 py-1 rounded bg-stone-950 border border-stone-850 text-[10px] text-red-400 hover:bg-stone-900 cursor-pointer"
                    >
                      卸下武装
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-stone-600">胸铠插槽空置中</span>
                )}
              </div>

              {/* Slot 3: Accessory */}
              <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center min-h-[140px] relative ${activeAccessory ? getTierBorderColor(activeAccessory.tier) : 'border-dashed border-stone-800 bg-stone-950/20'}`} id="slot_accessory">
                <span className="absolute top-2 left-2 text-[9px] text-stone-500 uppercase font-mono">符文配饰 Slot</span>
                {activeAccessory ? (
                  <>
                    <Gem className="w-8 h-8 text-purple-400 mb-2" />
                    <div className="text-xs font-bold text-white mb-1 line-clamp-1">{activeAccessory.name}</div>
                    <div className="text-[10px] text-purple-300 font-mono mb-2">+{activeAccessory.mpBonus} MP魔能</div>
                    <button
                      id={`btn_unequip_${activeAccessory.id}`}
                      onClick={() => onUnequipItem(activeAccessory)}
                      className="px-2.5 py-1 rounded bg-stone-950 border border-stone-850 text-[10px] text-red-400 hover:bg-stone-900 cursor-pointer"
                    >
                      卸下武装
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-stone-600">首饰插槽空置中</span>
                )}
              </div>
            </div>
          </div>

          {/* Bag Inventory List */}
          <div className="bg-stone-900/40 border border-stone-900 rounded-2xl p-6 flex-1 flex flex-col" id="inventory_bag_box">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center justify-between" id="bag_header_row">
              <span className="flex items-center gap-1.5">🗄️ 冒险者随身包裹 ({inventory.length} 件物品)</span>
              <span className="text-[10px] font-mono text-stone-500">点击装备可以自动替换在身配戴</span>
            </h3>

            {inventory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[360px] p-1" id="bag_scroll_outer">
                {inventory.map((item, index) => {
                  const isPotion = item.type === ItemType.POTION;
                  const isEquipped = item.isEquipped;

                  return (
                    <div 
                      key={item.instanceId || `${item.id}-${index}`}
                      id={`bag_item_${item.instanceId || item.id}`}
                      className={`p-3.5 rounded-xl border bg-stone-950 text-xs flex flex-col justify-between gap-3 ${isEquipped ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-stone-900 hover:border-stone-800'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white text-sm tracking-wide">{item.name}</div>
                          <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{item.description}</div>
                        </div>
                        {isEquipped && (
                          <span className="bg-amber-500/20 border border-amber-500/30 text-amber-405 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono">
                            ACTIVE 配戴
                          </span>
                        )}
                      </div>

                      {/* Stat boosts info inside bag items */}
                      <div className="text-[10px] font-mono text-stone-400">
                        {item.atkBonus && <div>• 伤害增幅: +{item.atkBonus} ATK</div>}
                        {item.defBonus && <div>• 物防重筑: +{item.defBonus} DEF</div>}
                        {item.hpBonus && <div>• 坚韧加值: +{item.hpBonus} HP</div>}
                        {item.mpBonus && <div>• 浩瀚储能: +{item.mpBonus} MP</div>}
                      </div>

                      {/* Action buttons depending on types */}
                      <div className="flex justify-end pt-1 border-t border-stone-900 mt-1">
                        {isPotion ? (
                          <button
                            id={`btn_potion_drink_${item.id}`}
                            onClick={() => onDrinkPotion(item.id)}
                            className="px-3 py-1.5 rounded bg-rose-600 font-semibold hover:bg-rose-500 text-white text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            🧪 立即喝下恢复生命
                          </button>
                        ) : isEquipped ? (
                          <button
                            id={`btn_slot_unequip_${item.id}`}
                            onClick={() => onUnequipItem(item)}
                            className="px-3 py-1.5 rounded bg-stone-900 text-[10px] text-stone-400 hover:bg-stone-800 cursor-pointer"
                          >
                            解下配载
                          </button>
                        ) : (
                          <button
                            id={`btn_slot_equip_${item.id}`}
                            onClick={() => onEquipItem(item)}
                            className="px-3 py-1.5 rounded bg-amber-600 font-semibold hover:bg-amber-500 text-white text-[10px] cursor-pointer transition-all hover:shadow active:scale-95"
                          >
                            ⚡ 装备到武装槽
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-stone-950/20 border border-dashed border-stone-900 rounded-xl text-center" id="empty_bag_block">
                <ChevronLeft className="w-10 h-10 text-stone-800 mb-2 rotate-90" />
                <div className="font-semibold text-stone-500 text-xs">包裹里面空荡荡，没有任何神兵利刃。</div>
                <div className="text-[10px] text-stone-605 max-w-xs mt-1">
                  前往地牢各个角落战斗、开启金色宝箱奖励、或是探访黑市商人，签定高品质装备购买条约以重装上阵。
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
