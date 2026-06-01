/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterClass } from '../types';
import { INITIAL_PLAYER_STATS, getPlayerTitle, CLASS_IMAGES } from '../constants';
import { Shield, Flame, Activity, Sword, Sparkles, Heart, Zap, Crosshair } from 'lucide-react';
import { PixelTransparentImage } from './PixelTransparentImage';

interface SetupScreenProps {
  onSelectClass: (classType: CharacterClass) => void;
}

export default function SetupScreen({ onSelectClass }: SetupScreenProps) {
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
        return 'from-amber-900/20 to-stone-900 border-amber-500/30 hover:border-amber-500 hover:shadow-amber-500/10 hover:-translate-y-1';
      case CharacterClass.MAGE:
        return 'from-purple-900/20 to-stone-900 border-purple-500/30 hover:border-purple-500 hover:shadow-purple-500/10 hover:-translate-y-1';
      case CharacterClass.ROGUE:
        return 'from-emerald-900/20 to-stone-900 border-emerald-500/30 hover:border-emerald-500 hover:shadow-emerald-500/10 hover:-translate-y-1';
    }
  };

  const getSkills = (type: CharacterClass) => {
    switch (type) {
      case CharacterClass.WARRIOR:
        return [
          { name: '裂地巨斩', desc: '消耗 0 MP | 造成 [1.0x 攻击力] 物理伤害' },
          { name: '重盾格挡', desc: '消耗 8 MP | 自身防御翻倍且恢复 15% 损hp' },
          { name: '圣光裁决', desc: '消耗 15 MP | 造成 [2.2x 攻击力] 伤害且击晕敌人' }
        ];
      case CharacterClass.MAGE:
        return [
          { name: '冰弹射击', desc: '消耗 0 MP | 造成 [0.6x 攻击力] 微量魔法伤害' },
          { name: '红莲火球', desc: '消耗 12 MP | 造成 [2.0x 攻击力] 极大火焰伤害' },
          { name: '奥术护盾', desc: '消耗 20 MP | 吸收护盾恢复 50 HP 并非圣裁' }
        ];
      case CharacterClass.ROGUE:
        return [
          { name: '双刃连斩', desc: '消耗 0 MP | 造成 [1.1x 攻击力] 快速切割伤害' },
          { name: '匿迹伏击', desc: '消耗 10 MP | 下回攻击获得 [2.5x] 暴击翻倍' },
          { name: '致残剧毒', desc: '消耗 15 MP | 造成 [1.5x 攻击力] 伤害并降低对手伤害 30%' }
        ];
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen px-4 text-stone-100 font-sans bg-cover bg-center bg-no-repeat relative" 
      id="setup_screen_container"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(50, 10, 10, 0.72), rgba(12, 10, 9, 0.98)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Visual background decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,40,40,0.06),transparent_60%)] pointer-events-none" />
      
      <div className="z-10 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-rose-500/30 bg-rose-950/20 text-rose-400 text-xs tracking-widest font-mono" id="game_sub_decor">
          <Activity className="w-3.5 h-3.5 animate-pulse" /> ROGUELIKE DUNGEON CLIMBER
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3" id="main_game_title">
          地牢深渊：命途开拓者
        </h1>
        
        <p className="text-sm md:text-base text-stone-400 max-w-xl mx-auto mb-10 leading-relaxed" id="main_game_subtitle">
          命运之骰已经抛下，无数勇者曾长眠于此。选择属于你的英雄誓约，踏上多层极深迷宫节点的开拓征程，斩杀领主以荣获终极功勋！
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl" id="class_grid">
          {(Object.keys(INITIAL_PLAYER_STATS) as CharacterClass[]).map((classKey) => {
            const stats = INITIAL_PLAYER_STATS[classKey];
            return (
              <button
                key={classKey}
                id={`btn_select_class_${classKey.toLowerCase()}`}
                onClick={() => onSelectClass(classKey)}
                className={`relative flex flex-col text-left p-6 rounded-2xl border bg-gradient-to-b transition-all duration-300 cursor-pointer group ${getColorTheme(classKey)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="relative">
                    <PixelTransparentImage 
                      src={CLASS_IMAGES[classKey]} 
                      alt={classKey} 
                      className="w-16 h-16 rounded-xl border border-stone-800 object-cover shadow-lg bg-stone-950 group-hover:border-rose-500/50 transition-all" 
                    />
                    <div className="absolute -bottom-1 -right-1 bg-stone-900/90 p-1 rounded-md border border-stone-800 text-stone-200">
                      {getIcon(classKey)}
                    </div>
                  </div>
                  <span className="text-stone-500 group-hover:text-stone-300 text-xs font-mono tracking-widest">
                    {classKey}
                  </span>
                </div>

                <div className="mb-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-rose-400 transition-colors">
                    {classKey === CharacterClass.WARRIOR ? '誓约圣卫 (战士)' : (classKey === CharacterClass.MAGE ? '混沌秘贤 (法师)' : '深渊影刃 (刺客)')}
                  </h3>
                  <div className="text-xs text-rose-500/80 font-mono tracking-wide mt-0.5">
                    初始阶级: {getPlayerTitle(classKey, 1)}
                  </div>
                </div>

                <p className="text-xs text-stone-400 h-10 mb-4 line-clamp-2 leading-relaxed">
                  {getSlogan(classKey)}
                </p>

                {/* Base Stats list */}
                <div className="border-t border-b border-stone-800/80 py-3 mb-4 grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Heart className="w-3.5 h-3.5 text-red-400" />
                    <span>生命值: {stats.hp}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span>法力值: {stats.mp}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Sword className="w-3.5 h-3.5 text-amber-400" />
                    <span>攻击力: {stats.atk}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Shield className="w-3.5 h-3.5 text-blue-300" />
                    <span>防御力: {stats.def}</span>
                  </div>
                </div>

                {/* Skill Book */}
                <div>
                  <h4 className="text-xs font-bold text-stone-300 tracking-wider uppercase mb-2">职业战技:</h4>
                  <div className="space-y-1.5">
                    {getSkills(classKey).map((skill, index) => (
                      <div key={index} className="bg-stone-950/50 hover:bg-stone-900 border border-stone-800/50 p-2 rounded-lg text-xs">
                        <div className="font-semibold text-white">{skill.name}</div>
                        <div className="text-stone-500 text-[10px] mt-0.5">{skill.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button visual trigger */}
                <div className="mt-6 flex items-center justify-center w-full py-2.5 rounded-xl bg-stone-900 group-hover:bg-rose-950/40 border border-stone-800 group-hover:border-rose-500/30 text-xs font-bold tracking-widest text-stone-300 group-hover:text-rose-300 transition-all">
                  签订誓约契约 &gt;
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
