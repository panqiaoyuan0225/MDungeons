/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CharacterClass, GameDifficulty } from '../types';
import { INITIAL_PLAYER_STATS, getPlayerTitle, CLASS_IMAGES } from '../constants';
import { Shield, Flame, Activity, Sword, Sparkles, Heart, Zap, Crosshair, Skull, ShieldAlert, Crown, Compass } from 'lucide-react';
import { PixelTransparentImage } from './PixelTransparentImage';

interface SetupScreenProps {
  onSelectClass: (classType: CharacterClass, difficulty: GameDifficulty, starterSchool: string) => void;
}

export default function SetupScreen({ onSelectClass }: SetupScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('NORMAL');
  const [selectedSchool, setSelectedSchool] = useState<string>('bastion');
  const getIcon = (type: CharacterClass) => {
    switch (type) {
      case CharacterClass.WARRIOR:
        return <Sword className="w-5 h-5 text-amber-500" id="icon_war_setup" />;
      case CharacterClass.MAGE:
        return <Sparkles className="w-5 h-5 text-purple-500" id="icon_mage_setup" />;
      case CharacterClass.ROGUE:
        return <Crosshair className="w-5 h-5 text-emerald-500" id="icon_rogue_setup" />;
    }
  };

  const getSlogan = (type: CharacterClass) => {
    switch (type) {
      case CharacterClass.WARRIOR:
        return '坚刚不屈之躯，筑起同伴最后的防线。';
      case CharacterClass.MAGE:
        return '引导不灭混沌，裁决深渊中所有的游魂。';
      case CharacterClass.ROGUE:
        return '隐于暗夜之影，于怪物喘瞬直透心脏。';
    }
  };

  const getColorTheme = (type: CharacterClass) => {
    switch (type) {
      case CharacterClass.WARRIOR:
        return 'border-[#c5a880]/30 hover:border-amber-500 hover:shadow-amber-500/10 hover:-translate-y-1.5';
      case CharacterClass.MAGE:
        return 'border-[#c5a880]/30 hover:border-purple-500 hover:shadow-purple-500/10 hover:-translate-y-1.5';
      case CharacterClass.ROGUE:
        return 'border-[#c5a880]/30 hover:border-emerald-500 hover:shadow-emerald-500/10 hover:-translate-y-1.5';
    }
  };

  const getSkills = (type: CharacterClass) => {
    switch (type) {
      case CharacterClass.WARRIOR:
        return [
          { name: '誓约斩', desc: '消耗 6 MP | 誓誓重击！施展誓刀冲破，造成额外物理基础伤害。' },
          { name: '铁壁', desc: '消耗 6 MP | 获得终极 5 点物理防御保护并凝聚 15 点圣光御膜。' },
          { name: '圣光裁决', desc: '消耗 12 MP | 召唤神圣权杖圣印，造成 2.2x 近战打击并使其致眩 1 轮。' }
        ];
      case CharacterClass.MAGE:
        return [
          { name: '冰弹射击', desc: '消耗 0 MP | 造成 [0.6x 攻击力] 魔术物理法伤。' },
          { name: '红莲火球', desc: '消耗 12 MP | 对目标轰出毁灭爆破热焰，造成 [2.0x 攻击力] 伤害。' },
          { name: '奥术护盾', desc: '消耗 18 MP | 汲取幽蓝奥粒子加护，加值 50 点厚重虚无格挡值。' }
        ];
      case CharacterClass.ROGUE:
        return [
          { name: '双刃连斩', desc: '消耗 0 MP | 发起迅刺，切裂极速突击重击伤害。' },
          { name: '匿迹伏击', desc: '消耗 6 MP | 进入隐身微光，使次轮出招伤害倍数跃迁 2.5 倍！' },
          { name: '致残剧毒', desc: '消耗 12 MP | 造成 1.5x 毒穿刺，并毒化空气降低目标 30% 战意输出两回合。' }
        ];
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen px-4 pb-12 text-stone-100 font-serif bg-cover bg-center bg-no-repeat relative overflow-hidden" 
      id="setup_screen_container"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(14, 11, 10, 0.88), rgba(6, 4, 4, 0.99)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Visual background decor */}
      <div className="vignette-ambient" />

      {/* Atmospheric torch fire light glow decorations background */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-orange-950/20 blur-3xl animate-torch pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-red-950/20 blur-3xl animate-torch pointer-events-none" />
      
      <div className="z-20 text-center max-w-5xl mt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-amber-500/20 bg-stone-950 text-amber-500 text-[10px] tracking-widest font-mono uppercase" id="game_sub_decor">
          <Activity className="w-4 h-4 text-amber-600 animate-pulse" /> Dark Rogue Conquest Setup
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" id="main_game_title">
          地牢深渊：命途开拓者
        </h1>
        
        <p className="text-xs md:text-sm text-stone-450 max-w-xl mx-auto mb-10 leading-relaxed font-sans" id="main_game_subtitle font-serif">
          命运之骰已经抛下，无数勇者曾长眠于此。签订属于你的英雄誓约，踏上多层极深迷宫节点的开拓征程，剿灭最后的邪神龙王！
        </p>

        {/* DIFFICULTY SELECTOR */}
        <div className="mb-10 max-w-4xl mx-auto bg-stone-950/80 border-4 border-black p-5 relative shadow-xl text-left" id="difficulty_selector_panel">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-stone-800 via-amber-600 to-stone-800" />
          
          <h2 className="text-stone-300 font-serif text-xs md:text-sm tracking-widest uppercase mb-3 text-center flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            选择探险誓约难度 (Select Dungeon Crisis Level)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              {
                id: 'NORMAL' as GameDifficulty,
                name: '【精钢 · 普通】',
                desc: '原版基础难度。适合首次探秘地牢的冒险者。',
                stats: 'HP 100% | ATK 100% | 奖励 1.0x',
                color: 'border-stone-750 hover:border-sky-500 bg-stone-900/60',
                activeColor: 'border-sky-500 bg-sky-950/40 text-sky-200 ring-2 ring-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)]',
                textColor: 'text-sky-400',
              },
              {
                id: 'HARD' as GameDifficulty,
                name: '【怒血 · 炼狱】',
                desc: '怪兽属性高幅增长，气血更厚。富贵险中求！',
                stats: 'HP 145% | ATK 130% | 奖励 1.25x',
                color: 'border-stone-750 hover:border-amber-500 bg-stone-900/60',
                activeColor: 'border-amber-500 bg-amber-950/40 text-amber-105 ring-2 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
                textColor: 'text-amber-500',
              },
              {
                id: 'APOCALYPSE' as GameDifficulty,
                name: '【万相 · 混沌】',
                desc: '残酷的高压折磨。魔物极其粗暴，防抗大幅上调。',
                stats: 'HP 210% | ATK 170% | 奖励 1.6x',
                color: 'border-stone-750 hover:border-red-500 bg-stone-900/60',
                activeColor: 'border-red-500 bg-red-950/40 text-red-105 ring-2 ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.25)]',
                textColor: 'text-red-400',
              },
              {
                id: 'NIGHTMARE' as GameDifficulty,
                name: '【轮回 · 噩梦】',
                desc: '绝对的核心黑洞：怪物护盾重如泰山，攻高血糙！',
                stats: 'HP 290% | ATK 230% | 奖励 2.0x',
                color: 'border-stone-750 hover:border-purple-500 bg-stone-900/60',
                activeColor: 'border-purple-500 bg-purple-950/40 text-purple-105 ring-2 ring-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.35)]',
                textColor: 'text-purple-400',
              }
            ].map((diff) => {
              const isSelected = selectedDifficulty === diff.id;
              return (
                <button
                  type="button"
                  key={diff.id}
                  id={`btn_diff_${diff.id.toLowerCase()}`}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`p-3 text-left border-2 rounded-none transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected ? diff.activeColor : diff.color
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-bold font-serif ${diff.textColor}`}>
                        {diff.name}
                      </span>
                      {isSelected && <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse animate-bounce" />}
                    </div>
                    <p className="text-[10px] text-stone-400 leading-normal mb-2 font-sans min-h-[38px]">
                      {diff.desc}
                    </p>
                  </div>
                  <div className="w-full text-[9px] font-mono bg-stone-950/90 border border-black p-1 text-stone-300 text-center uppercase tracking-wider font-bold">
                    {diff.stats}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STARTING DECK / SCHOOL SELECTOR */}
        <div className="mb-10 max-w-4xl w-full mx-auto bg-stone-950/80 border-4 border-black p-5 relative shadow-xl text-left animate-fade-in" id="school_selector_panel">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-stone-800 via-purple-600 to-stone-800" />
          
          <h2 className="text-stone-300 font-serif text-xs md:text-sm tracking-widest uppercase mb-3 text-center flex items-center justify-center gap-2">
            <Crown className="w-4 h-4 text-purple-500" />
            选择探险卡牌流派 (Select Starting Card School)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'bastion',
                name: '「圣誓之守·金刚壁垒」',
                desc: '偏好保命临时御盾与绝境回复。拥有最卓越、安稳的护体生存机制，适合在前期站稳脚跟。',
                highlight: '携带卡：圣印反蚀、不动如山、不破不立',
                perks: '🛡️ 盾牌防御 & 绝境御盾 | 推荐萌新',
                color: 'border-stone-750 hover:border-yellow-500 bg-stone-900/60',
                activeColor: 'border-yellow-500 bg-yellow-950/40 text-yellow-200 ring-2 ring-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]',
                icon: <Shield className="w-5 h-5 text-yellow-500" />
              },
              {
                id: 'chaos_echo',
                name: '「混沌余音·元素歌者」',
                desc: '聚焦魔能转化、技能冷却刷新与连载。拥有最敏捷的施法循环，后期伤害极其恐怖暴创。',
                highlight: '携带卡：虚绽合击、神圣律令、血能炼制',
                perks: '⚡ 超强冷却 & 能量狂澜 | 推荐中级',
                color: 'border-stone-750 hover:border-indigo-500 bg-stone-900/60',
                activeColor: 'border-indigo-500 bg-indigo-950/40 text-indigo-400 ring-2 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
                icon: <Sparkles className="w-5 h-5 text-indigo-400" />
              },
              {
                id: 'shadow_strike',
                name: '「死神夜刺·狂热绝杀」',
                desc: '刀刀大额爆伤，高收益高风险。伴随双刃剑致伤反蚀以及命魂狂赌，极限刺激。',
                highlight: '携带卡：破败斩杀、同归于尽、命轮狂赌',
                perks: '🧪 自残斩杀 & 命运骰博 | 推荐中高玩',
                color: 'border-stone-750 hover:border-red-500 bg-stone-900/60',
                activeColor: 'border-red-500 bg-red-950/40 text-red-200 ring-2 ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.25)]',
                icon: <Skull className="w-5 h-5 text-red-500 animate-pulse" />
              }
            ].map((school) => {
              const isSelected = selectedSchool === school.id;
              return (
                <button
                  type="button"
                  key={school.id}
                  id={`btn_school_${school.id}`}
                  onClick={() => setSelectedSchool(school.id)}
                  className={`p-4 text-left border-2 rounded-none transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected ? school.activeColor : school.color
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {school.icon}
                        <span className="text-[11px] font-bold font-serif">
                          {school.name}
                        </span>
                      </div>
                      {isSelected && <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />}
                    </div>
                    <p className="text-[10px] text-stone-400 leading-relaxed font-sans mb-3 min-h-[38px]">
                      {school.desc}
                    </p>
                    <div className="text-[10px] text-purple-400 font-serif font-bold mb-2 p-1 bg-stone-950 border border-stone-850/60 text-center">
                      {school.highlight}
                    </div>
                  </div>
                  <div className="w-full text-[9px] font-sans text-stone-300 border-t border-dashed border-stone-800 pt-2 font-bold tracking-wider">
                    {school.perks}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl" id="class_grid">
          {(Object.keys(INITIAL_PLAYER_STATS) as CharacterClass[]).map((classKey) => {
            const stats = INITIAL_PLAYER_STATS[classKey];
            return (
              <button
                key={classKey}
                id={`btn_select_class_${classKey.toLowerCase()}`}
                onClick={() => onSelectClass(classKey, selectedDifficulty, selectedSchool)}
                className={`relative flex flex-col text-left p-6 rounded-none gothic-box transition-all duration-100 cursor-pointer group hover:gothic-box-glow active:scale-95 ${getColorTheme(classKey)}`}
              >
                {/* Red Drapery Ribbon atop Card */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-850 via-rose-600 to-red-850 border-b-2 border-black" />

                <div className="flex items-center justify-between mb-4 mt-2">
                  <div className="relative">
                    <PixelTransparentImage 
                      src={CLASS_IMAGES[classKey]} 
                      alt={classKey} 
                      className="w-16 h-16 rounded-none border-2 border-black object-cover shadow-lg bg-stone-950 group-hover:border-amber-500 transition-all duration-100" 
                    />
                    <div className="absolute -bottom-1 -right-1 bg-stone-950 p-1 rounded-none border-2 border-black text-stone-200">
                      {getIcon(classKey)}
                    </div>
                  </div>
                  <span className="text-stone-500 group-hover:text-amber-400 text-[10px] font-mono tracking-widest uppercase">
                    {classKey} HERO
                  </span>
                </div>

                <div className="mb-2">
                  <h3 className="text-xl font-bold font-serif text-white group-hover:text-amber-300 transition-colors">
                    {classKey === CharacterClass.WARRIOR ? '亡誓骑士 (战士)' : (classKey === CharacterClass.MAGE ? '混沌秘贤 (法师)' : '深渊影刃 (刺客)')}
                  </h3>
                  <div className="text-[10px] text-amber-500 font-mono tracking-wide mt-0.5">
                    初始等级殿阶: 1 阶 ({getPlayerTitle(classKey, 1)})
                  </div>
                </div>

                <p className="text-xs text-stone-400 h-10 mb-4 line-clamp-2 leading-relaxed font-sans">
                  {getSlogan(classKey)}
                </p>

                {/* Base Stats list */}
                <div className="border-t-2 border-b-2 border-dashed border-stone-800 py-3 mb-4 grid grid-cols-2 gap-y-2.5 gap-x-4 text-[10.5px] font-sans">
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span>生命值: {stats.hp} HP</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span>灵能力: {stats.mp} MP</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Sword className="w-3.5 h-3.5 text-amber-500 animate-bounce" style={{ animationDuration: '2s' }} />
                    <span>物理攻: {stats.atk} ATK</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Shield className="w-3.5 h-3.5 text-sky-400" />
                    <span>防御力: {stats.def} DEF</span>
                  </div>
                </div>

                {/* Skill Book */}
                <div className="flex-grow">
                  <h4 className="text-[10px] font-bold text-stone-400 tracking-widest uppercase mb-2">职业附带战技:</h4>
                  <div className="space-y-2 font-serif">
                    {getSkills(classKey).map((skill, index) => (
                      <div key={index} className="bg-stone-950/90 border-2 border-black p-2 rounded-none text-[11px] leading-relaxed">
                        <div className="font-bold text-stone-200 group-hover:text-amber-300 transition-colors">{skill.name}</div>
                        <div className="text-stone-500 text-[10px] mt-0.5 font-sans leading-normal">{skill.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button visual trigger */}
                <div className="mt-6 w-full text-center py-2.5 rounded-none btn-pixel-gothic text-xs select-none">
                  签订誓约契约 ▶
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
