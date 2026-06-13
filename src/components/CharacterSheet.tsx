/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerStats, Item, ItemType, ItemTier, CharacterClass } from '../types';
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
  ArrowUpCircle,
  Lock,
  Unlock,
  RotateCcw,
  Coins,
  Flame,
  ShieldAlert,
  AlertCircle,
  Hammer,
  BookOpen,
  ShieldX
} from 'lucide-react';
import { audio } from '../lib/audio';

interface CharacterSheetProps {
  playerStats: PlayerStats;
  inventory: Item[];
  equippedItems: Item[];
  onEquipItem: (item: Item) => void;
  onUnequipItem: (item: Item) => void;
  onDrinkPotion: (potionId: string) => void;
  onLeaveCharacter: () => void;
  onActivateTalent: (talentId: string) => void;
  onResetTalents: () => void;
  onDismantleItem: (item: Item) => void;
  onForgeUpgradeItem: (item: Item, shardCost: number, goldCost: number) => void;
  onAscendClass: (ascendedName: string) => void;
}

const ARCANE_CLASSES: Record<string, Array<{ name: string; bonus: string; desc: string; skill: string }>> = {
  WARRIOR: [
    { name: '圣骑士', bonus: '生命上限 +50 HP, 格御防御 +12 DEF', desc: '虔诚意志不老。战斗施展「铁壁」时可额外恢复 15 HP 自我治愈，且常驻免受 10% 外部战斗创伤。', skill: '圣佑金纹盾' },
    { name: '破灭狂战', bonus: '锋刃攻击 +18 ATK, 生命上限 +30 HP', desc: '深渊血沸，死生度外。体力越低挥击威力越狂暴（当生命低于 40% 时，所有刀斩攻击力狂飙暴增 45%！）。', skill: '残齿怒火咆哮' }
  ],
  MAGE: [
    { name: '混沌炼金师', bonus: '魔法上限 +80 MP, 锋刃物理 +10 ATK', desc: '玩弄虚无魔法。每回合有 25% 概率获得神契之风强化，随机恢复 15% 护体神盾、20点MP神能或大幅倍增暴发率。', skill: '贤者之石毁灭爆炸' },
    { name: '寂灭圣言者', bonus: '法杖魔法 +22 ATK, 最大生命 +20 HP', desc: '参悟终末古言。在发出红莲火球法术命中「魔力印记」目标时，必定二次追加并引爆元素神圣溅射！', skill: '宿命神灭雷轰' }
  ],
  ROGUE: [
    { name: '织网毒杀者', bonus: '最大生命 +25 HP, 毒素附加 +10 ATK', desc: '林地蛛毒王。引爆敌人身上所有毒素进行【毒爆术】时免去魔法消耗，且使怪物全身中毒层数无限堆叠。', skill: '致命狂蛛撕咬' },
    { name: '神速影舞者', bonus: '刺杀物理 +16 ATK, 格御格挡 +5 DEF', desc: '幽梦残影，碎骨刺魂。基础挥击命中目标时有 35% 终极概率分身双击，多段打击让敌人毫无招架之力！', skill: '千重瞬乱刀乱舞' }
  ]
};

export default function CharacterSheet({
  playerStats,
  inventory,
  equippedItems,
  onEquipItem,
  onUnequipItem,
  onDrinkPotion,
  onLeaveCharacter,
  onActivateTalent,
  onResetTalents,
  onDismantleItem,
  onForgeUpgradeItem,
  onAscendClass
}: CharacterSheetProps) {
  const [sheetTab, setSheetTab] = useState<'EQUIP' | 'TALENT' | 'FORGE'>('EQUIP');
  const [showAscendPanel, setShowAscendPanel] = useState<boolean>(false);
  const [ascendDoneMsg, setAscendDoneMsg] = useState<string | null>(null);

  const getAvatarIcon = () => {
    const iconSize = "w-5 h-5 text-white";
    const imgUrl = CLASS_IMAGES[playerStats.classType];
    
    let iconEl = <Sword className={iconSize} id="char_avatar_war" />;
    if (playerStats.classType === CharacterClass.MAGE) {
      iconEl = <Sparkles className={iconSize} id="char_avatar_mage" />;
    } else if (playerStats.classType === CharacterClass.ROGUE) {
      iconEl = <Compass className={iconSize} id="char_avatar_rogue" />;
    }

    return (
      <div className="relative group/avatar">
         <div className="p-1 rounded-none bg-stone-950 border-4 border-black relative overflow-hidden shadow-lg">
           <PixelTransparentImage 
             src={imgUrl} 
             alt={playerStats.classType} 
             className="w-24 h-24 rounded-none object-cover" 
           />
         </div>
        <div className="absolute -bottom-2 -right-2 p-2 rounded-none bg-stone-900 border-2 border-black text-white animate-bounce">
          {iconEl}
        </div>
      </div>
    );
  };

  // Find currently equipped items by type
  const activeWeapon = equippedItems.find(i => i.type === ItemType.WEAPON);
  const activeArmor = equippedItems.find(i => i.type === ItemType.ARMOR);
  const activeAccessory = equippedItems.find(i => i.type === ItemType.ACCESSORY);

  // Check Set Bonus items
  const getActiveSetsCount = () => {
    const counts: Record<string, number> = {};
    equippedItems.forEach(i => {
      if (i.setName) {
        counts[i.setName] = (counts[i.setName] || 0) + 1;
      }
    });
    return counts;
  };

  const setCounts = getActiveSetsCount();

  const handleChooseAscension = (className: string) => {
    audio.playUpgrade();
    onAscendClass(className);
    setAscendDoneMsg(`⚡ 圣言鸣响！您成功觉醒晋升并觉醒为了尊贵不朽的【${className}】！常驻属性巨幅突破暴涨！`);
    setTimeout(() => {
      setShowAscendPanel(false);
      setAscendDoneMsg(null);
    }, 3800);
  };

  return (
    <div 
      className="flex flex-col min-h-screen font-serif text-stone-100 bg-cover bg-center bg-no-repeat relative overflow-hidden" 
      id="character_sheet_container"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(11, 8, 8, 0.94), rgba(4, 2, 2, 0.99)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="vignette-ambient" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-rose-950/15 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-teal-950/15 blur-3xl pointer-events-none z-0" />

      {/* Header */}
      <header className="z-20 bg-stone-950/95 border-b-4 border-black p-4 sticky top-0 shadow-lg" id="char_top_header">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            id="btn_char_leave"
            onClick={() => {
              audio.playClick();
              onLeaveCharacter();
            }}
            className="px-4 py-2 text-[11px] btn-pixel-gothic flex items-center gap-1.5 cursor-pointer rounded-none text-stone-300"
          >
            <ChevronLeft className="w-4 h-4" /> 返回契约巨图
          </button>

          <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase hidden md:inline-block">
            —— 角色命盘觉醒与铁匠神熔炉 ——
          </span>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10" id="char_grid_split">
        
        {/* Left Column (5 cols): Identity Card and Character Status */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="char_left_pnl">
          <div className="gothic-box rounded-none p-6 flex flex-col items-center text-center relative" id="char_identity_card">
            <div className="absolute top-0 inset-x-0 h-1.5 rounded-none bg-gradient-to-r from-teal-850 via-[#c5a880] to-red-850" />

            <div className="absolute top-4 right-4 text-[9px] font-mono tracking-widest text-[#c5a880] bg-stone-950 px-2 py-1 rounded-none border-2 border-black">
              {playerStats.classType === CharacterClass.WARRIOR ? '🛡️ 战士' : playerStats.classType === CharacterClass.MAGE ? '🔮 法师' : '🗡️ 游侠'}
            </div>

            {getAvatarIcon()}

            <div className="mt-4">
              <h2 className="text-2xl font-bold font-serif text-white tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                {playerStats.title}
              </h2>
              <div className="text-xs text-[#c5a880] font-bold font-serif tracking-widest mt-1">
                命灵阶层: {getPlayerTitle(playerStats.classType, playerStats.level)}
              </div>
              {playerStats.ascendedClass && (
                <div className="mt-1.5 inline-block px-2.5 py-0.5 bg-purple-950/40 border border-purple-500/40 rounded-none text-[10px] text-purple-300 font-mono font-bold tracking-wider animate-pulse">
                  🌟 职业终阶已觉醒: {playerStats.ascendedClass}
                </div>
              )}
            </div>

            {/* EXP Progress */}
            <div className="w-full mt-5 bg-stone-950 p-4 rounded-none border-2 border-black text-xs text-left" id="exp_progres_pnl">
              <div className="flex justify-between items-center text-stone-400 font-mono font-bold">
                <span>升华阅历 (ASCENDANCE EXP)</span>
                <span>{playerStats.exp} / {playerStats.expToNextLevel} XP</span>
              </div>
              <div className="mt-2 w-full bg-stone-950 h-3.5 rounded-none overflow-hidden border-2 border-black p-[1px]">
                <div 
                  className="bg-gradient-to-r from-purple-800 to-indigo-500 h-full rounded-none shadow-[0_0_8px_rgba(168,85,247,0.4)] transition-all duration-300"
                  style={{ width: `${(playerStats.exp / playerStats.expToNextLevel) * 100}%` }}
                />
              </div>
            </div>

            {/* Class Ascension Prompt / Modal Trigger */}
            {playerStats.level >= 5 && !playerStats.ascendedClass && (
              <div className="w-full mt-4 p-3 bg-gradient-to-br from-amber-600/10 to-amber-500/5 border-2 border-dashed border-amber-500 rounded-none text-left animate-pulse">
                <span className="text-[10px] text-amber-500 font-mono tracking-widest block font-bold uppercase mb-1">⚡ 可进行卓越职业觉醒转职</span>
                <p className="text-[11px] text-stone-300 font-sans leading-relaxed">
                  检测到您已修行达到 5 级！宿命星曜之轨发出终极震颤，允许觉醒选择全新的神话转职分支。
                </p>
                <button
                  id="btn_open_ascend"
                  onClick={() => {
                    audio.playUpgrade();
                    setShowAscendPanel(true);
                  }}
                  className="mt-2.5 w-full py-1.5 bg-[#c5a880] text-stone-950 font-serif font-black text-[11px] uppercase tracking-wide hover:bg-white transition-all cursor-pointer rounded-none border-2 border-black shadow-[0_2px_10px_rgba(197,168,128,0.3)]"
                >
                  🔥 展开转职觉醒圣坛
                </button>
              </div>
            )}
          </div>

          {/* Stats Sheet */}
          <div className="gothic-box rounded-none p-6" id="char_stats_pnl">
            <h3 className="text-xs font-bold text-[#c5a880] uppercase tracking-widest mb-4 flex items-center justify-between font-serif border-b border-stone-900 pb-2">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                全额契约面板加护属性
              </span>
              <span className="font-mono text-[9px] text-stone-500">LEVEL {playerStats.level}</span>
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 bg-stone-950 rounded-none border-2 border-black">
                <span className="flex items-center gap-1.5 text-red-400 font-serif"><Heart className="w-3.5 h-3.5 text-red-500" /> 生命上限</span>
                <span className="font-bold text-stone-100 text-sm">{playerStats.hp} / {playerStats.maxHp} HP</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-stone-950 rounded-none border-2 border-black">
                <span className="flex items-center gap-1.5 text-blue-400 font-serif"><Zap className="w-3.5 h-3.5 text-blue-400" /> 魔法上限</span>
                <span className="font-bold text-stone-100 text-sm">{playerStats.mp} / {playerStats.maxMp} MP</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-stone-950 rounded-none border-2 border-black">
                <span className="flex items-center gap-1.5 text-amber-400 font-serif"><Sword className="w-3.5 h-3.5 text-amber-500" /> 面板锋物理伤害</span>
                <span className="font-bold text-stone-100 text-sm">{playerStats.atk} ATK</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-stone-950 rounded-none border-2 border-black">
                <span className="flex items-center gap-1.5 text-sky-455 font-serif"><Shield className="w-3.5 h-3.5 text-sky-400" /> 格御抵免盾卫</span>
                <span className="font-bold text-stone-100 text-sm">{playerStats.def} DEF</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-stone-950 rounded-none border-2 border-black">
                <span className="flex items-center gap-1.5 text-[#c5a880] font-serif">🔮 命核魂石碎片</span>
                <span className="font-bold text-[#c5a880] text-sm">{playerStats.soulShards || 0} Shards</span>
              </div>
            </div>

            {/* Set Synergy Bonuses lists */}
            {Object.keys(setCounts).length > 0 && (
              <div className="mt-4 p-3 bg-stone-950 border border-stone-900 rounded-none">
                <div className="text-[10px] text-amber-500 font-serif font-bold uppercase tracking-widest mb-1.5">🛡️ 已激活套装神髓 ({Object.keys(setCounts).length})</div>
                <div className="space-y-1.5 font-sans text-[10.5px]">
                  {Object.entries(setCounts).map(([setName, count]) => {
                    let bonusDesc = "暂无套装共鸣";
                    let isTriggered = count >= 2;
                    
                    if (setName === '亡誓骑士') {
                      bonusDesc = "【2件套激活】: 基础面板攻击力额外 +2 ATK，防御力 +1 DEF";
                    } else if (setName === '先锋合金') {
                      bonusDesc = "【2件套激活】: 战斗进入首回合，无息加载 +15 点天命护体圣防金纹盾！";
                    } else if (setName === '深渊黑焰') {
                      bonusDesc = "【2件套激活】: 终极残略吸血。武器刀斩或魔法技能命中时，吸纳 5% 受害伤害治愈自我！";
                    } else if (setName === '造物神话') {
                      bonusDesc = "【2或3件激活】: 全幅技能魔能消耗立免 50%，且任何击打动作追加 15 点神威爆裂真伤！";
                    }

                    return (
                      <div key={setName} className={`p-1.5 border ${isTriggered ? 'border-amber-500/30 bg-amber-950/10 text-amber-300' : 'border-stone-900 text-stone-500'}`}>
                        <div className="flex justify-between font-mono text-[9px] font-bold">
                          <span>套装: 【{setName}】</span>
                          <span>配备 {count}/3 件 {isTriggered ? '【已生效】' : '【未激活】'}</span>
                        </div>
                        <p className="mt-1 leading-normal font-serif text-[10px] text-stone-400">{bonusDesc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Tabs for EQUIP, TALENT and FORGE */}
        <div className="lg:col-span-7 flex flex-col gap-6" id="char_right_pnl">
          
          {/* Tab switches */}
          <div className="flex border-4 border-black bg-stone-950 p-[2px] rounded-none shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-20" id="sheet_tab_header_row">
            <button
              onClick={() => {
                audio.playClick();
                setSheetTab('EQUIP');
              }}
              className={`flex-1 text-center py-2 text-[10.5px] font-bold font-serif tracking-widest transition-all cursor-pointer rounded-none flex items-center justify-center gap-1 ${
                sheetTab === 'EQUIP' 
                  ? 'bg-amber-600 text-stone-950 font-black shadow-[inset_0_1px_3px_rgba(255,255,255,0.4)]' 
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> 随身装备行囊
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setSheetTab('TALENT');
              }}
              className={`flex-1 text-center py-2 text-[10.5px] font-bold font-serif tracking-widest transition-all cursor-pointer rounded-none flex items-center justify-center gap-1 ${
                sheetTab === 'TALENT' 
                  ? 'bg-purple-800 text-stone-100 font-black shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)]' 
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> 誓约分支命印门
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setSheetTab('FORGE');
              }}
              className={`flex-1 text-center py-2 text-[10.5px] font-bold font-serif tracking-widest transition-all cursor-pointer rounded-none flex items-center justify-center gap-1 ${
                sheetTab === 'FORGE' 
                  ? 'bg-rose-900 text-stone-100 font-black shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)]' 
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              }`}
            >
              <Hammer className="w-3.5 h-3.5 text-rose-455" /> 虚空熔铁锻造炉
            </button>
          </div>

          {/* TAB 1: EQUIPS */}
          {sheetTab === 'EQUIP' && (
            <>
              {/* Equipped Slots */}
              <div className="gothic-box rounded-none p-6" id="equipped_slots_box">
                <h3 className="text-xs font-bold text-[#c5a880] uppercase tracking-widest mb-4 flex items-center gap-2 font-serif border-b border-stone-900 pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> 
                  当前已穿戴
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Weapon Slot */}
                  <div className={`p-4 rounded-none border-2 flex flex-col items-center justify-center text-center min-h-[145px] relative ${activeWeapon ? 'border-[#c5a880] bg-stone-950/80' : 'border-dashed border-stone-850 bg-stone-950/30'}`} id="slot_weapon">
                    <span className="absolute top-2 left-2 text-[8px] text-stone-500 uppercase font-mono tracking-widest">武器武装</span>
                    {activeWeapon ? (
                      <>
                        <Sword className="w-7 h-7 text-amber-500 mb-2" />
                        <div className="text-xs font-bold text-white mb-1 line-clamp-1">{activeWeapon.name}</div>
                        <div className="text-[10px] text-amber-400 font-mono mb-2">
                          +{activeWeapon.atkBonus} ATK {activeWeapon.forgeLevel ? `(淬炼 +${activeWeapon.forgeLevel})` : ''}
                        </div>
                        {activeWeapon.setName && (
                          <span className="mb-2 text-[8px] px-1.5 py-0.5 bg-amber-950/40 border border-amber-500/20 text-amber-300 font-mono">
                            【{activeWeapon.setName}】
                          </span>
                        )}
                        <button
                          id={`btn_unequip_${activeWeapon.id}`}
                          onClick={() => {
                            audio.playClick();
                            onUnequipItem(activeWeapon);
                          }}
                          className="px-3 py-1 font-serif text-[9px] btn-pixel-gothic rounded-none text-stone-300"
                        >
                          武装取下
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] text-stone-600 font-mono uppercase tracking-widest">刀刃槽空置</span>
                    )}
                  </div>

                  {/* Armor Slot */}
                  <div className={`p-4 rounded-none border-2 flex flex-col items-center justify-center text-center min-h-[145px] relative ${activeArmor ? 'border-[#c5a880] bg-stone-950/80' : 'border-dashed border-stone-850 bg-stone-950/30'}`} id="slot_armor">
                    <span className="absolute top-2 left-2 text-[8px] text-stone-500 uppercase font-mono tracking-widest">护甲装甲</span>
                    {activeArmor ? (
                      <>
                        <Shield className="w-7 h-7 text-sky-400 mb-2" />
                        <div className="text-xs font-bold text-white mb-1 line-clamp-1">{activeArmor.name}</div>
                        <div className="text-[10px] text-sky-300 font-mono mb-2">
                          +{activeArmor.defBonus} DEF {activeArmor.forgeLevel ? `(淬炼 +${activeArmor.forgeLevel})` : ''}
                        </div>
                        {activeArmor.setName && (
                          <span className="mb-2 text-[8px] px-1.5 py-0.5 bg-amber-950/40 border border-amber-500/20 text-amber-300 font-mono">
                            【{activeArmor.setName}】
                          </span>
                        )}
                        <button
                          id={`btn_unequip_${activeArmor.id}`}
                          onClick={() => {
                            audio.playClick();
                            onUnequipItem(activeArmor);
                          }}
                          className="px-3 py-1 font-serif text-[9px] btn-pixel-gothic rounded-none text-stone-300"
                        >
                          武装取下
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] text-stone-600 font-mono uppercase tracking-widest">战袍槽空置</span>
                    )}
                  </div>

                  {/* Accessory Slot */}
                  <div className={`p-4 rounded-none border-2 flex flex-col items-center justify-center text-center min-h-[145px] relative ${activeAccessory ? 'border-[#c5a880] bg-stone-950/80' : 'border-dashed border-stone-850 bg-stone-950/30'}`} id="slot_accessory">
                    <span className="absolute top-2 left-2 text-[8px] text-stone-500 uppercase font-mono tracking-widest">项饰指圈</span>
                    {activeAccessory ? (
                      <>
                        <Gem className="w-7 h-7 text-purple-400 mb-2" />
                        <div className="text-xs font-bold text-white mb-1 line-clamp-1">{activeAccessory.name}</div>
                        <div className="text-[10px] text-purple-300 font-mono mb-2">
                          +{activeAccessory.mpBonus} MP {activeAccessory.forgeLevel ? `(淬炼 +${activeAccessory.forgeLevel})` : ''}
                        </div>
                        {activeAccessory.setName && (
                          <span className="mb-2 text-[8px] px-1.5 py-0.5 bg-amber-950/40 border border-amber-500/20 text-amber-300 font-mono">
                            【{activeAccessory.setName}】
                          </span>
                        )}
                        <button
                          id={`btn_unequip_${activeAccessory.id}`}
                          onClick={() => {
                            audio.playClick();
                            onUnequipItem(activeAccessory);
                          }}
                          className="px-3 py-1 font-serif text-[9px] btn-pixel-gothic rounded-none text-stone-300"
                        >
                          武装取下
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] text-stone-600 font-mono uppercase tracking-widest">宝坠槽空置</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Backpack list */}
              <div className="gothic-box rounded-none p-6 flex-1 flex flex-col" id="inventory_bag_box">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center justify-between font-serif border-b border-stone-900 pb-2">
                  <span className="flex items-center gap-1.5 text-stone-100 font-bold">🗄️ 随身神兵行囊 ({inventory.length} 件神物)</span>
                  <span className="text-[9px] font-mono text-stone-500">/ 快速换装、点击携带</span>
                </h3>

                {inventory.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[360px] p-1 font-serif" id="bag_scroll_outer">
                    {inventory.map((item, index) => {
                      const isPotion = item.type === ItemType.POTION;
                      const isEquipped = item.isEquipped;

                      return (
                        <div 
                          key={item.instanceId || `${item.id}-${index}`}
                          className={`p-3 p-3.5 rounded-none border-2 bg-stone-950 text-xs flex flex-col justify-between gap-2.5 ${isEquipped ? 'border-amber-500 ring-4 ring-amber-500/15' : 'border-stone-900 hover:border-stone-850 transition-all'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-stone-100 text-sm tracking-wide">
                                {item.name} {item.forgeLevel ? `+${item.forgeLevel}` : ''}
                              </div>
                              <div className="text-[10px] text-stone-500 mt-1 line-clamp-2 leading-relaxed font-sans">{item.description}</div>
                            </div>
                            {item.setName && (
                              <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1 font-mono font-bold shrink-0">
                                {item.setName}
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] font-mono text-stone-400 space-y-0.5 border-t border-stone-900/60 pt-2">
                            {item.atkBonus && <div className="text-amber-400/80">• ATK提升: +{item.atkBonus}</div>}
                            {item.defBonus && <div className="text-sky-400/80">• DEF护甲: +{item.defBonus}</div>}
                            {item.hpBonus && <div className="text-red-400/80">• HP血量: +{item.hpBonus}</div>}
                            {item.mpBonus && <div className="text-blue-400/80">• MP蓝能: +{item.mpBonus}</div>}
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-stone-900/60 mt-1 shrink-0">
                            <span className="text-[9px] text-stone-600 font-mono font-bold select-none uppercase tracking-widest">
                              {isEquipped ? '当前穿戴' : isPotion ? '战术消耗' : '包裹挂载'}
                            </span>
                            
                            {isPotion ? (
                              <button
                                onClick={() => {
                                  audio.playClick();
                                  onDrinkPotion(item.id);
                                }}
                                className="px-3.5 py-1 text-[10px] bg-red-850 hover:bg-red-750 font-serif text-white rounded-none font-bold border-2 border-black cursor-pointer shadow-[0_2px_6px_rgba(239,68,68,0.2)] animate-pulse"
                              >
                                🧪 使用/饮下
                              </button>
                            ) : isEquipped ? (
                              <button
                                onClick={() => {
                                  audio.playClick();
                                  onUnequipItem(item);
                                }}
                                className="px-3 py-1 font-serif text-[10px] btn-pixel-gothic rounded-none text-stone-300"
                              >
                                取下
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  audio.playClick();
                                  onEquipItem(item);
                                }}
                                className="px-4 py-1.5 btn-pixel-gothic text-stone-950 font-serif font-black text-[10px] rounded-none hover:from-amber-400 hover:to-amber-500 cursor-pointer"
                              >
                                ⚡ 安全穿上
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-stone-950/20 border-2 border-dashed border-stone-900 rounded-none text-center">
                    <div className="font-semibold text-stone-500 text-xs font-serif">神兵背包装备行囊空亡。</div>
                    <p className="text-[10px] text-stone-600 max-w-xs mt-1.5 font-sans leading-normal">
                      可穿梭在各大突袭战、古迹或囚笼中掠夺宝具，或是寻找暗界黑市、流宿商人购买。
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: TALENT (BRANCHING NETWORK) */}
          {sheetTab === 'TALENT' && (() => {
            const totalPoints = playerStats.level - 1;
            const spentPoints = (playerStats.activatedTalents || []).reduce((acc, tid) => acc + (tid === 't_special' ? 2 : 1), 0);
            const availablePoints = Math.max(0, totalPoints - spentPoints);
            const activeList = playerStats.activatedTalents || [];

            // Class specific specialized talents (Branching)
            const getSpecializedTalents = (): Array<{ id: string; name: string; cost: number; statsDesc: string; combatDesc: string; description: string; icon: string; requires?: string[] }> => {
              if (playerStats.classType === CharacterClass.WARRIOR) {
                return [
                  {
                    id: 't_war_shield',
                    name: '圣教御守 (防)',
                    cost: 1,
                    statsDesc: '格御防御 +3 DEF, 生命上限 +20 HP',
                    combatDesc: '🛡️ 每次玩家在回合中进行防御或施展「铁壁」时，额外免费收获 +6 点圣护护盾屏障！',
                    description: '骑士不朽防卫。汲取圣光精髓守护自我的意志。',
                    icon: '🛡️',
                    requires: ['t_hp']
                  },
                  {
                    id: 't_war_rage',
                    name: '残虐嗜血 (命)',
                    cost: 1,
                    statsDesc: '基础物理攻击力 +5 ATK',
                    combatDesc: '🩸 狂战士怒意！当处于战斗中且当前生命值低于 50% 时，暴击伤害伤害倍率永久提升 +50%！',
                    description: '战士的刀不惧死。伤口越痛，怒火毁灭性越狂烈。',
                    icon: '🌋',
                    requires: ['t_hp', 't_atk']
                  }
                ];
              } else if (playerStats.classType === CharacterClass.MAGE) {
                return [
                  {
                    id: 't_mage_void',
                    name: '虚空护体共鸣 (能)',
                    cost: 1,
                    statsDesc: '魔法能源上限 +30 MP',
                    combatDesc: '🔮 施放任何战斗技能后，星穹法网震跃。玩家立即返还恢复 +3 点 MP 法能！',
                    description: '让意识与异端星系共振，法效循环生生不息。',
                    icon: '🪐',
                    requires: ['t_mp']
                  },
                  {
                    id: 't_mage_pyro',
                    name: '混沌烈焰破 (烈)',
                    cost: 1,
                    statsDesc: '大火术伤害 +6 ATK',
                    combatDesc: '🔥 任何技能和法球必定造成持续灼烧：怪物在每个玩家回合结束受到 8 点击穿底伤的燃烧伤害。',
                    description: '混沌的火焰能洗净冥界一切肮脏血肉。',
                    icon: '☄️',
                    requires: ['t_mp', 't_atk']
                  }
                ];
              } else {
                return [
                  {
                    id: 't_rogue_shadow',
                    name: '碎影刺杀分身 (双)',
                    cost: 1,
                    statsDesc: '锋刃物理攻击 +4 ATK',
                    combatDesc: '⚡ 手心幻影。普攻和斩击有 22% 几率呼唤碎骨暗影分身，无怨无悔追加打出 0.7x 物理伤害！',
                    description: '林影间的鬼，剑出两向。杀人只在电光石火中。',
                    icon: '🌪️',
                    requires: ['t_hp', 't_atk']
                  },
                  {
                    id: 't_rogue_venom',
                    name: '织网腐骨蛊骨 (毒)',
                    cost: 1,
                    statsDesc: '格御格挡防御 +1 DEF',
                    combatDesc: '🧪 施加致残毒素的持续回合数永久 +2，且引爆毒爆术不扣除层数，折磨加倍！',
                    description: '对武器浸润上来自极南百死虫渊的九阴腐骨毒。',
                    icon: '☠️',
                    requires: ['t_mp']
                  }
                ];
              }
            };

            const coreTalents = [
              {
                id: 't_hp',
                name: '血裔契灵秘印 (基)',
                cost: 1,
                statsDesc: '生命上限 +25 HP',
                combatDesc: '🩸 任何近身劈砍或魔法轰击成功时，有 20% 神佑几率夺取 5 HP 恢复自身。',
                description: '唤醒远古祖灵在血脉里的印痕，加护生命根本。',
                icon: '❤️',
                tier: 1
              },
              {
                id: 't_mp',
                name: '法咒神核灵枢 (基)',
                cost: 1,
                statsDesc: '魔法上限 +15 MP',
                combatDesc: '💎 任何神秘巫法启动时，有 25% 极高几率豁免并直接退还 4 MP 魔耗！',
                description: '凝聚精神魔晶，使得地底干耗的异端能量快速回充。',
                icon: '💠',
                tier: 1
              }
            ];

            const subclassTalents = getSpecializedTalents();

            const ultimateTalent = {
              id: 't_special',
              name: '命轮至尊大象神印 (终)',
              cost: 2,
              statsDesc: playerStats.classType === CharacterClass.WARRIOR ? '【誓卫圣躯】生命最高上限额外 +35 HP' : playerStats.classType === CharacterClass.MAGE ? '【无上灵流】神能容量上限额外 +35 MP' : '【碎刃幽影】基础物理额外暴力 +6 ATK',
              combatDesc: playerStats.classType === CharacterClass.WARRIOR 
                ? '🛡️ 神妙不坏！防御与「铁壁」附赠的屏障永久爆增 +15 点盾，且疗愈 8 HP！' 
                : playerStats.classType === CharacterClass.MAGE 
                  ? '🔮 狂涌法能！「红莲火球」与法师神技结算时直接赋予 30% 毁灭爆发乘算！' 
                  : '⚡ 双持割喉！攻击具有流血/中毒敌人时 100% 忽视目标护甲打出刺心真实伤害！',
              description: '命轮的最终极意！唯有身经百战的核心修士方可承受此神印。',
              icon: '👑',
              tier: 3,
              requires: subclassTalents.map(t => t.id)
            };

            return (
              <div className="gothic-box rounded-none p-6 flex-1 flex flex-col" id="nature_talents_box">
                {/* Header Banner */}
                <div className="bg-stone-950 p-4 border-2 border-black rounded-none flex flex-col md:flex-row justify-between items-center gap-4 mb-6 relative">
                  <div className="absolute top-0 left-0 bg-purple-700 text-stone-100 font-mono text-[8px] font-bold px-1.5 py-0.5">
                    GEN-FATE SYSTEM
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-serif text-white tracking-widest flex items-center gap-1.5 mt-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-spin" /> 
                      契命命印分支星曜圣图
                    </h4>
                    <p className="text-[10px] text-stone-400 mt-1 max-w-sm leading-normal font-sans">
                      提升等级可参悟星曜点（慧点）。高阶契印需要先连接并唤醒指定的【前置命格印记】。
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[8px] text-stone-500 tracking-wider font-mono">契印魂慧点 (RESIDUES)</div>
                      <div className="text-lg font-mono font-black text-purple-400">
                        {availablePoints} <span className="text-xs text-stone-400 font-normal">/ {totalPoints} Pts</span>
                      </div>
                    </div>
                    
                    <button
                      id="btn_talent_reset"
                      disabled={activeList.length === 0 || playerStats.gold < 20}
                      onClick={() => {
                        audio.playHeal();
                        onResetTalents();
                      }}
                      className={`px-3 py-2 font-mono text-[10px] uppercase font-bold flex items-center gap-1 border-2 rounded-none transition-all active:scale-95 ${
                        activeList.length > 0 && playerStats.gold >= 20
                          ? 'border-red-500/40 text-red-400 hover:text-white hover:bg-red-950/20 cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                          : 'border-stone-900 text-stone-600 bg-stone-950 cursor-not-allowed opacity-40'
                      }`}
                    >
                      <RotateCcw className="w-3 h-3" /> 
                      重塑命痕 (20金)
                    </button>
                  </div>
                </div>

                {/* Branching tree representation columns */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto max-h-[380px] p-2 pr-1" id="talents_grid_outer">
                  
                  {/* Tier 1 Grid: Foundation */}
                  <div>
                    <div className="text-[9px] text-purple-400 tracking-widest font-bold uppercase mb-3 text-center flex items-center justify-center gap-2">
                      <span className="w-12 h-[1px] bg-purple-500/20" /> TER I: 星轨始源基础契印 (1级启) <span className="w-12 h-[1px] bg-purple-500/20" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coreTalents.map(talent => {
                        const isActivated = activeList.includes(talent.id);
                        const canActivate = !isActivated && availablePoints >= talent.cost;

                        return (
                          <div 
                            key={talent.id}
                            className={`p-3 border-2 text-xs flex flex-col justify-between gap-3 relative overflow-hidden ${isActivated ? 'bg-purple-950/20 border-purple-500/50' : 'bg-stone-950 border-stone-900 text-stone-300 hover:border-stone-850'}`}
                          >
                            <div className="flex gap-2.5 items-start">
                              <span className="text-xl p-1 bg-stone-900 border border-stone-800 shrink-0">{talent.icon}</span>
                              <div>
                                <h5 className={`font-bold tracking-wide ${isActivated ? 'text-purple-300' : 'text-stone-100'}`}>{talent.name}</h5>
                                <p className="text-[10px] text-stone-450 leading-relaxed font-sans mt-0.5">{talent.description}</p>
                              </div>
                            </div>
                            <div className="bg-stone-900/60 p-2 text-[9.5px] font-mono leading-relaxed space-y-1">
                              <div>✨ 常驻加护: <span className="text-stone-300">{talent.statsDesc}</span></div>
                              <div className="font-sans leading-normal">• 命术极意: {talent.combatDesc}</div>
                            </div>
                            <div className="flex justify-between items-center border-t border-stone-900/60 pt-2 shrink-0">
                              <span className="text-[9px] text-stone-500 font-mono font-bold">COST: 1 慧点</span>
                              {isActivated ? (
                                <span className="text-purple-400 font-bold flex items-center gap-0.5 text-[9px] font-mono">✓ 已融汇共鸣</span>
                              ) : (
                                <button
                                  disabled={!canActivate}
                                  onClick={() => {
                                    audio.playUpgrade();
                                    onActivateTalent(talent.id);
                                  }}
                                  className={`px-3 py-1 font-bold text-[9px] border-2 rounded-none cursor-pointer ${canActivate ? 'border-purple-600 text-purple-300 hover:bg-purple-950/20 text-white' : 'border-stone-900 text-stone-600 cursor-not-allowed opacity-50'}`}
                                >
                                  🔮 唤神契印
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vertical Connection Arrows visual */}
                  <div className="flex justify-around items-center h-4 text-purple-500/30 font-mono text-center">
                    <div className="animate-bounce font-bold">↓↓ 分支契合解锁 ↓↓</div>
                    <div className="animate-bounce font-bold">↓↓ 分支契合解锁 ↓↓</div>
                  </div>

                  {/* Tier 2: Specialized Branching nodes matching warrior/mage/rogue */}
                  <div>
                    <div className="text-[9px] text-purple-450 tracking-widest font-bold uppercase mb-3 text-center flex items-center justify-center gap-2">
                      <span className="w-12 h-[1px] bg-purple-500/20" /> TER II: 职业专属神格觉醒分支 (3级启) <span className="w-12 h-[1px] bg-purple-500/20" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subclassTalents.map(talent => {
                        const isActivated = activeList.includes(talent.id);
                        const isPrimaryPrereqMet = activeList.some(id => (talent.requires || []).includes(id));
                        const isLevelMet = playerStats.level >= 3;
                        const canActivate = !isActivated && isPrimaryPrereqMet && isLevelMet && availablePoints >= talent.cost;

                        return (
                          <div 
                            key={talent.id}
                            className={`p-3 border-2 text-xs flex flex-col justify-between gap-3 relative overflow-hidden ${isActivated ? 'bg-purple-950/25 border-purple-500/60 shadow-[0_0_10px_rgba(147,51,234,0.1)]' : !isPrimaryPrereqMet || !isLevelMet ? 'bg-stone-950/60 border-stone-950 text-stone-600 opacity-60' : 'bg-stone-950 border-stone-900 text-stone-300 hover:border-stone-850'}`}
                          >
                            <div className="flex gap-2.5 items-start">
                              <span className="text-xl p-1 bg-stone-900 border border-stone-800 shrink-0">{talent.icon}</span>
                              <div>
                                <h5 className={`font-bold tracking-wide ${isActivated ? 'text-purple-300' : 'text-stone-100'}`}>{talent.name}</h5>
                                <p className="text-[10px] text-stone-500 leading-normal font-sans mt-0.5">{talent.description}</p>
                              </div>
                            </div>
                            <div className="bg-stone-900/60 p-2 text-[9.5px] font-mono leading-relaxed space-y-1">
                              <div>🛡️ 常驻加护: <span className="text-stone-300">{talent.statsDesc}</span></div>
                              <div className="font-sans leading-normal">• 命术极意: {talent.combatDesc}</div>
                            </div>
                            <div className="flex justify-between items-center border-t border-stone-900/60 pt-2 shrink-0">
                              <span className="text-[9.2px] text-stone-500 font-sans tracking-tight">
                                {!isLevelMet ? '🚨 需等级3以上' : !isPrimaryPrereqMet ? '🚨 需先点亮上一代基础命格' : 'COST: 1 慧点'}
                              </span>
                              {isActivated ? (
                                <span className="text-purple-400 font-bold flex items-center gap-0.5 text-[9px] font-mono">✓ 契印连结入魂</span>
                              ) : (
                                <button
                                  disabled={!canActivate}
                                  onClick={() => {
                                    audio.playUpgrade();
                                    onActivateTalent(talent.id);
                                  }}
                                  className={`px-3 py-1 font-bold text-[9px] border-2 rounded-none cursor-pointer ${canActivate ? 'border-purple-600 text-purple-300 hover:bg-purple-950/20 text-white' : 'border-stone-900 text-stone-600 cursor-not-allowed opacity-50'}`}
                                >
                                  🔮 分支融合
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vertical Connection Arrow to Ultimate */}
                  <div className="flex justify-center items-center h-4 text-purple-500/25 font-mono animate-bounce font-bold">
                    ↓↓ 连汇终天命王座 ↓↓
                  </div>

                  {/* Tier 3 ultimate */}
                  <div>
                    <div className="text-[9px] text-[#c5a880] tracking-widest font-bold uppercase mb-3 text-center flex items-center justify-center gap-2">
                      <span className="w-12 h-[1px] bg-amber-500/20" /> TER III: 终焉宿命命轮至尊契印 (5级启) <span className="w-12 h-[1px] bg-amber-500/20" />
                    </div>
                    {(() => {
                      const talent = ultimateTalent;
                      const isActivated = activeList.includes(talent.id);
                      // Require at least ONE of the specialized branch talents activated
                      const isPrereqMet = activeList.some(id => (talent.requires || []).includes(id));
                      const isLevelMet = playerStats.level >= 5;
                      const canActivate = !isActivated && isPrereqMet && isLevelMet && availablePoints >= talent.cost;

                      return (
                        <div className={`p-4 border-2 text-xs flex flex-col justify-between gap-3 relative overflow-hidden max-w-lg mx-auto ${isActivated ? 'bg-gradient-to-br from-[#8b5cf6]/10 to-[#ca8a04]/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : !isPrereqMet || !isLevelMet ? 'bg-stone-950/70 border-stone-950 text-stone-650 opacity-60' : 'bg-stone-950 border-amber-500/40 text-stone-300 hover:border-amber-400'}`}>
                          <div className="flex gap-3 items-start">
                            <span className="text-3xl p-2 bg-stone-900 border border-amber-500/30 shrink-0 text-yellow-550 animate-pulse">{talent.icon}</span>
                            <div>
                              <h5 className={`font-serif text-sm font-black tracking-widest ${isActivated ? 'text-amber-300' : 'text-stone-100'}`}>{talent.name}</h5>
                              <p className="text-[10px] text-[#c5a880] leading-relaxed font-sans mt-1">{talent.description}</p>
                            </div>
                          </div>

                          <div className="bg-stone-950/80 border border-amber-500/20 p-2.5 text-[9.5px] font-mono leading-relaxed space-y-1">
                            <div className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-400 shrink-0" /> 重塑天命: <strong className="text-stone-100">{talent.statsDesc}</strong></div>
                            <div className="font-sans leading-relaxed mt-1">• 神权特质: <span className="text-stone-350">{talent.combatDesc}</span></div>
                          </div>

                          <div className="flex justify-between items-center border-t border-stone-900/60 pt-2 shrink-0">
                            <span className="text-[9px] text-[#c5a880] font-mono font-bold font-serif">
                              {!isLevelMet ? '🚨 需等级 5 尊神阶' : !isPrereqMet ? '🚨 需点亮任一觉醒分支契骨' : '★ 消耗: 2 点慧点 (命慧结晶)'}
                            </span>
                            {isActivated ? (
                              <span className="text-amber-400 font-bold font-serif flex items-center gap-0.5 text-[10px] animate-pulse">🌟 命轮封王已就位</span>
                            ) : (
                              <button
                                disabled={!canActivate}
                                onClick={() => {
                                  audio.playUpgrade();
                                  onActivateTalent(talent.id);
                                }}
                                className={`px-4 py-1.5 font-bold font-serif text-[10px] border-2 rounded-none cursor-pointer ${canActivate ? 'border-amber-500 bg-amber-500/10 hover:bg-[#c5a880] hover:text-stone-950 text-[#c5a880]' : 'border-stone-900 text-stone-600 cursor-not-allowed opacity-50'}`}
                              >
                                👑 冠戴命冕
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 3: BLACKSMITH FORGE (EQUIPMENT SMITHING & DISMANTLE) */}
          {sheetTab === 'FORGE' && (
            <div className="gothic-box rounded-none p-6 flex-1 flex flex-col" id="void_blacksmith_box">
              {/* Smithy top banners */}
              <div className="bg-stone-950 p-4 border-2 border-[#ec4899]/30 rounded-none flex flex-col md:flex-row justify-between items-center gap-4 mb-6 relative">
                <div className="absolute top-0 left-0 bg-rose-900 text-stone-100 font-mono text-[8px] font-bold px-1.5 py-0.5">
                  VOID ARSENAL FORGE
                </div>
                <div>
                  <h4 className="text-sm font-bold font-serif text-white tracking-widest flex items-center gap-1.5 mt-1.5 text-rose-400">
                    <Hammer className="w-4 h-4 text-rose-500 animate-pulse" /> 
                    虚空暗金黑铁神炉
                  </h4>
                  <p className="text-[10px] text-stone-400 mt-1 max-w-sm leading-normal font-sans">
                    将背包里不需要的 Common/Rare/Epic 装备<strong>「分解」</strong>以重获命星碎片；并熔铸碎片给在手的利刃重铠进行神级<strong>「淬炼强化 (+3 max)」</strong>，永久暴涨 25% 属性！
                  </p>
                </div>
                
                <div className="text-right bg-black py-1.5 px-3 border border-stone-850">
                  <div className="text-[8px] text-[#ec4899] font-mono tracking-widest">熔积魂石 (SHARDS)</div>
                  <div className="text-lg font-mono font-black text-rose-500 animate-pulse flex items-center gap-1 justify-end">
                    🔮 {playerStats.soulShards || 0}
                  </div>
                </div>
              </div>

              {/* Forge Grid Panels (Dismantle vs Upgrade) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch flex-1">
                
                {/* Panel left: Dismantle panel */}
                <div className="border-2 border-stone-900 bg-stone-950/40 p-4 flex flex-col">
                  <div className="text-[10.5px] font-bold text-stone-300 border-b border-stone-900 pb-1.5 mb-3 flex items-center gap-1">
                    🧹 虚妄分解台 (装备多余回收)
                  </div>
                  
                  {/* Unequipped weapons/armors/accessories inside inventory bag */}
                  {(() => {
                    const dismantleable = inventory.filter(i => i.type !== ItemType.POTION && !i.isEquipped);
                    if (dismantleable.length === 0) {
                      return (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-stone-600 font-sans">
                          <AlertCircle className="w-6 h-6 text-stone-700 mb-1.5" />
                          <div className="text-[10px] font-bold">没有可用以拆解的空铠兵刃。</div>
                          <p className="text-[9px] text-stone-650 mt-1">
                            当前背包里没有闲置装备。药水无法进行淬灭分解。已穿上的武装必须在行囊中卸下才可熔铸！
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3.5 overflow-y-auto max-h-[300px] pr-1.5 font-serif">
                        {dismantleable.map(item => {
                          let returnShards = 5;
                          if (item.tier === ItemTier.RARE) returnShards = 15;
                          if (item.tier === ItemTier.EPIC) returnShards = 45;
                          if (item.tier === ItemTier.LEGENDARY) returnShards = 125;

                          return (
                            <div key={item.instanceId || item.id} className="p-2.5 bg-black border border-stone-900 flex justify-between items-center text-xs">
                              <div>
                                <span className={`text-[10px] uppercase font-mono px-1 py-[1px] border text-stone-400 mr-2 ${item.tier === ItemTier.EPIC ? 'border-purple-500/30 text-purple-400' : item.tier === ItemTier.RARE ? 'border-blue-500/30 text-blue-400' : 'border-stone-800'}`}>
                                  {item.tier === ItemTier.LEGENDARY ? 'LEGEND' : item.tier === ItemTier.EPIC ? 'EPIC' : item.tier === ItemTier.RARE ? 'RARE' : 'BASE'}
                                </span>
                                <strong className="text-stone-200">{item.name}</strong>
                                <div className="text-[9.5px] text-stone-500 font-sans mt-0.5 font-mono">
                                  {item.atkBonus ? `+${item.atkBonus}攻击 ` : ''}
                                  {item.defBonus ? `+${item.defBonus}护甲 ` : ''}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  audio.playCrit();
                                  onDismantleItem(item);
                                }}
                                className="px-2.5 py-1 text-[10px] bg-red-950 hover:bg-red-800 text-red-200 hover:text-white border border-red-500/40 rounded-none cursor-pointer transition-all active:scale-95"
                              >
                                💥 熔炼 🔮+{returnShards}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Panel right: Upgrade panel */}
                <div className="border-2 border-stone-900 bg-stone-950/40 p-4 flex flex-col justify-between">
                  <div>
                    <div className="text-[10.5px] font-bold text-stone-300 border-b border-stone-900 pb-1.5 mb-3 flex items-center gap-1">
                      🔥 淬火淬炼台 (属性上限爆裂)
                    </div>
                    
                    {/* Choose one equipped item to upgrade! */}
                    <div className="text-[10px] text-stone-500 mb-3 font-sans">
                      可以淬火已穿戴在身上的核心武装首饰。每次锤炼使其总属性向上叠加 <strong>+25%</strong>：
                    </div>

                    {equippedItems.length > 0 ? (
                      <div className="space-y-3 font-serif">
                        {equippedItems.map(item => {
                          const lvl = item.forgeLevel || 0;
                          const isMax = lvl >= 3;
                          
                          // Costs scaling
                          const shardCost = lvl === 0 ? 5 : lvl === 1 ? 12 : 25;
                          const goldCost = lvl === 0 ? 30 : lvl === 1 ? 65 : 120;
                          
                          const canAfford = (playerStats.soulShards || 0) >= shardCost && playerStats.gold >= goldCost;

                          return (
                            <div key={item.id} className="p-2.5 bg-black border border-stone-850 flex flex-col gap-2 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-stone-100 flex items-center gap-1 font-serif">
                                  {item.type === ItemType.WEAPON ? '⚔️' : item.type === ItemType.ARMOR ? '🛡️' : '💍'}
                                  {item.name} 
                                  <span className="text-rose-455 font-mono">(淬炼 +{lvl})</span>
                                </span>
                                {isMax ? (
                                  <span className="text-[9px] text-[#ec4899] font-mono font-bold border border-rose-500/20 px-1 py-0.5">【MAX完造】</span>
                                ) : (
                                  <span className="text-[9px] text-stone-500 font-mono">淬炼费: 🔮{shardCost} / 💰{goldCost}金</span>
                                )}
                              </div>
                              
                              <div className="flex justify-between items-center shrink-0">
                                <span className="text-[9.5px] text-stone-400 font-sans leading-normal">
                                  淬炼后: <span className="text-emerald-400 font-mono font-bold">属性额外暴增 +25%</span>
                                </span>
                                
                                {!isMax && (
                                  <button
                                    disabled={!canAfford}
                                    onClick={() => {
                                      audio.playUpgrade();
                                      onForgeUpgradeItem(item, shardCost, goldCost);
                                    }}
                                    className={`px-3 py-1 font-serif font-bold text-[10px] rounded-none cursor-pointer transition-all active:scale-95 border-2 ${canAfford ? 'bg-rose-950 text-rose-250 border-rose-600/40 hover:bg-rose-850' : 'bg-stone-920 border-stone-950 text-stone-550 cursor-not-allowed opacity-50'}`}
                                  >
                                    鎚击淬炼!
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-[10px] font-sans text-stone-650 flex flex-col items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-stone-850 mb-1" />
                        你目前赤甲空拳，没有在身上装备任何兵甲！请先在【随身武装】页里选定穿上海量兵器再来锤炼。
                      </div>
                    )}
                  </div>

                  <div className="bg-stone-950/80 p-2.5 rounded-none border border-stone-900 mt-4 font-sans text-[9px] text-stone-500 leading-normal">
                    💡 【铁匠告示】: 分解普通Common装备得 5 魂尘；罕见Rare装备得 15 魂尘；史诗Epic高阶魔盒直接产出 45 魂尘；传说极品神装更能碎裂得到 125 魂晶。
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* ASCENSION AWAKENING MODAL GOTHIC SYSTEM */}
      {showAscendPanel && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 transition-all">
          <div className="max-w-2xl w-full bg-[#0a0808] border-4 border-amber-600/60 p-6 md:p-8 rounded-none relative shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            
            {/* Banner decor */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />
            
            <div className="text-center font-serif">
              <span className="text-[10px] text-amber-500 font-mono tracking-widest block uppercase font-bold animate-pulse">—— ASCENSION TEMPLE · 终焉命星觉醒大祭坛 ——</span>
              <h3 className="text-2xl font-black text-[#c5a880] mt-1.5 tracking-wider font-serif">选择您的终极神话职业支支流派</h3>
              <p className="text-[11px] text-stone-400 font-sans max-w-lg mx-auto mt-2 leading-relaxed">
                选择觉醒后，您的基础肉身属性将会永久性迎来惊天蜕变，并替换或增强一门核心战斗秘术，神迹在此定格。
              </p>
            </div>

            {ascendDoneMsg ? (
              <div className="py-12 px-6 bg-stone-950 border-2 border-amber-500 rounded-none text-center flex flex-col items-center justify-center gap-4 animate-bounce">
                <Sparkles className="w-12 h-12 text-amber-400 animate-spin" />
                <p className="font-serif font-black text-amber-300 leading-relaxed text-sm max-w-md whitespace-pre-line">
                  {ascendDoneMsg}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2 font-serif">
                {(ARCANE_CLASSES[playerStats.classType] || []).map(choice => (
                  <div key={choice.name} className="p-5 bg-stone-950 border-2 border-stone-850 hover:border-amber-500/40 flex flex-col justify-between gap-4 transition-all hover:bg-amber-950/5 text-left">
                    <div>
                      <h4 className="text-lg font-bold text-[#c5a880] tracking-wide flex items-center justify-between">
                        <span>⚔️ {choice.name}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">+ 卓越蜕变</span>
                      </h4>
                      
                      <div className="text-[9.5px] font-mono text-stone-500 mt-1 uppercase font-bold border-b border-stone-900 pb-1">
                        常驻增幅: <span className="text-emerald-400">{choice.bonus}</span>
                      </div>
                      
                      <p className="text-[11px] text-stone-400 font-sans tracking-normal leading-relaxed mt-2.5 select-none">
                        {choice.desc}
                      </p>
                    </div>

                    <div className="space-y-3.5 mt-2 text-stone-300">
                      <div className="p-2.5 bg-black border border-stone-900 text-[10px] font-mono leading-normal">
                        🔥 【觉醒神术】: <span className="text-amber-400 font-bold block">{choice.skill}</span>
                      </div>

                      <button
                        onClick={() => handleChooseAscension(choice.name)}
                        className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-[#c5a880] hover:to-white text-stone-950 font-black text-xs uppercase tracking-widest transition-all cursor-pointer rounded-none border-2 border-black hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] active:scale-95"
                      >
                        ⚡ 永恒融魂 · 誓归此流
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center border-t border-stone-950 pt-3 shrink-0">
              <button
                onClick={() => {
                  audio.playClick();
                  setShowAscendPanel(false);
                }}
                className="px-6 py-1.5 border border-stone-850 hover:border-stone-700 font-mono text-[10px] uppercase font-bold text-stone-500 hover:text-stone-300 transition-all rounded-none cursor-pointer"
              >
                坚守凡身 暂作抉择
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
