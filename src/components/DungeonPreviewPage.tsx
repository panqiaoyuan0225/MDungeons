/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerStats } from '../types';
import { Compass, Info, Skull, Layers, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface DungeonPreviewPageProps {
  playerStats: PlayerStats;
  onStartExpedition: () => void;
}

export default function DungeonPreviewPage({ playerStats, onStartExpedition }: DungeonPreviewPageProps) {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);

  const floorStats = [
    {
      id: 1,
      name: '腐败荒原 (Decay Wasteland)',
      act: 'Act I',
      desc: '地牢的最表层。四周充斥着腐坏的骸骨与剧烈复苏的亡魂。有传闻称，地牢深渊的狂暴能量在此处撕扯并侵蚀四周，有饿狗般凶残的熔岩地狱犬镇守通道。',
      danger: '低 (Easy)',
      monsters: [
        { name: '尸僧', hp: '27 HP', atk: '5 ATK', desc: '已经死去上百年的地下僧侣，行尸走肉般挥舞锤仗。' },
        { name: '游荡骨弓兵', hp: '35 HP', atk: '7 ATK', desc: '深渊死气操纵的骨骸，射出沾满煞气的骨箭。' },
        { name: '地牢红眼角蝠', hp: '30 HP', atk: '5 ATK', desc: '栖息在裂脊岩壁的吸血蝙蝠，极速飞空掠袭。' }
      ],
      boss: { name: '熔岩审判地狱犬', hp: '130 HP', atk: '16 ATK', desc: '镇守第一层裂痕、喷吐着余烬烈焰的熔火巨犬守领。' }
    },
    {
      id: 2,
      name: '幽魂古堡 (Ghost Castle)',
      act: 'Act II',
      desc: '埋藏在无光海沟深渊之下的古老废弃城堡。高能量的邪祟咒力在此发生严重形变畸变，行尸与异化蛛编织着死亡蛛网，被死灵巫师王所奴役。',
      danger: '中 (Medium)',
      monsters: [
        { name: '无头死士僵尸', hp: '65 HP', atk: '12 ATK', desc: '废墟中的死忠守卫干尸，铠甲残存，格挡坚固。' },
        { name: '毒藤伏地兽', hp: '58 HP', atk: '10 ATK', desc: '寄生在废墟城堡内各角落裂缝中的剧毒荆棘兽。' },
        { name: '嗜血穴蛛灵', hp: '55 HP', atk: '11 ATK', desc: '潜行伺机的织雾血爪大蛛蜘蛛。' }
      ],
      boss: { name: '幽海死灵巫师之王', hp: '240 HP', atk: '25 ATK', desc: '手握冰霜祭杖的古王骨魂，拥有死灵共鸣。' }
    },
    {
      id: 3,
      name: '终焉墓园 (Doom Cemetery)',
      act: 'Act III',
      desc: '地下战祸的长眠古墓裂裂。神魔誓约在此地破碎，千载以来残破的充能武将陶像与熔火恶魔依旧在这里怒嚎，誓死拦截外来侵入者。',
      danger: '高 (Hard)',
      monsters: [
        { name: '遗迹充能兵马俑', hp: '100 HP', atk: '18 ATK', desc: '被邪能火核激活的石俑，身着青铜重盾，极其难缠。' },
        { name: '地狱熔火恶魔', hp: '90 HP', atk: '22 ATK', desc: '由第三层地裂地火缝隙中诞生的狂热火焰生物。' },
        { name: '深渊飞空掠夺者', hp: '85 HP', atk: '20 ATK', desc: '骨翼遮天的嗜食血魔，极其凶暴。' }
      ],
      boss: { name: '古墓圣心大裁决者', hp: '320 HP', atk: '32 ATK', desc: '看守古帝棺穴的核心守卫主祭，能够降下致命裁决。' }
    },
    {
      id: 4,
      name: '机械魔巢 (Mecha Core)',
      act: 'Act IV',
      desc: '上古机械神教搭建的星核蒸汽熔炉核心。此处遍布着尖锐的锯齿和剧烈震荡的核能装置，生化装甲兽与自适应飞星自四方巡航。',
      danger: '极高 (Expert)',
      monsters: [
        { name: '重装生化守护机甲', hp: '120 HP', atk: '24 ATK', desc: '喷涂生化蒸汽尾迹的重锤型熔炉防守傀儡。' },
        { name: '核磁高频微光蛛', hp: '110 HP', atk: '26 ATK', desc: '汲取重放辐射废料变异而成的电光蜘蛛。' },
        { name: '星流飞焰自适应者', hp: '115 HP', atk: '25 ATK', desc: '能量流形重组态的余烬怪物，抗性不凡。' }
      ],
      boss: { name: '前锋重装熔炉巨无霸', hp: '440 HP', atk: '42 ATK', desc: '前锋超载马达铁壁傀儡，具有极其离谱的冲撞碎裂攻击力。' }
    },
    {
      id: 5,
      name: '万神圣域 (Pantheon Realm)',
      act: 'Act V',
      desc: '整座深渊底舱的核心，大陆虚空法则的断裂极地。黑晶曜石铺就的宏伟穹顶神坛，堕落成了黑曜龙帝的至极巢穴。',
      danger: '噩梦 (Cataclysm)',
      monsters: [
        { name: '混沌万神侍魔', hp: '155 HP', atk: '32 ATK', desc: '死忠于龙帝的黑影侍卫魔，撕破誓约面具。' },
        { name: '深渊审判红莲龙爪', hp: '145 HP', atk: '35 ATK', desc: '深海龙息的一部分实体转化，重撕裂噬。' },
        { name: '万神圣门暗影行者', hp: '220 HP', atk: '45 ATK', desc: '镇守主神殿大门的狂妄魔尊副官，物魔格避极高。' }
      ],
      boss: { name: '灭世黑曜堕落龙帝', hp: '600 HP', atk: '56 ATK', desc: '至高弑神巨龙！浑身覆盖至坚黑曜石龙鳞，能吞吐破灭一切的大灾大厄，终局最强恶之真身。' }
    }
  ];

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen px-4 md:px-8 py-10 text-stone-100 font-serif bg-cover bg-center bg-no-repeat relative overflow-hidden"
      id="dungeon_preview_view"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(16, 12, 11, 0.94), rgba(4, 3, 3, 0.99)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="vignette-ambient" />

      {/* Ambient decorative glowing spots */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-amber-950/20 blur-3xl animate-torch pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-red-950/15 blur-3xl animate-torch pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 max-w-6xl w-full flex flex-col items-center"
      >
        {/* Title Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-amber-500/20 bg-stone-950/80 text-amber-500 text-[10px] tracking-widest font-mono uppercase" id="expedition_badge">
          <Layers className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> EXPEDITION BLUEPRINT LOADED
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest text-[#c5a880] text-center mb-1 drop-shadow-md font-serif" id="preview_title">
          契约誓言：地牢大剖图志
        </h1>
        <p className="text-stone-400 text-center text-xs font-sans max-w-xl mb-8 leading-relaxed" id="preview_desc">
          「古老誓契已重注神威。」踏足危险迷宫道路前，请于纵深大观剖面图中查明五层地牢凶兽底细。
        </p>

        {/* Master layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch" id="preview_grid">
          
          {/* Left panel: Cross-section image graphic (7 columns) */}
          <div className="lg:col-span-7 flex flex-col gothic-box bg-stone-950/75 p-5 relative overflow-hidden shadow-2xl justify-between border border-[#c5a880]/20" id="preview_left_panel">
            {/* Red top border banner */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-800 to-amber-600" />
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs uppercase tracking-widest text-[#c5a880] font-black">● 纵深迷坑侧视剖视图 (Cross-Section)</span>
                <span className="text-[10px] text-stone-500 font-mono">5 MULTI-TIER DUNGEON</span>
              </div>
              <p className="text-[11px] text-stone-400 font-sans leading-normal">
                地脉重力逐渐叠合，深渊迷宫共筑有五阶星域。点击下方各级侧视按钮，可向神誓契书呈报信息。
              </p>
            </div>

            {/* Side-view image container */}
            <div className="relative w-full border border-stone-800 bg-stone-900 rounded overflow-hidden aspect-[16/10] group" id="pixel_img_frame">
              <img 
                src="/src/assets/images/pixel_side_dungeon_1780305131153.png" 
                alt="Side-view multi-floor dungeon pixel art" 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 select-none opacity-90 filter brightness-95"
                referrerPolicy="no-referrer"
              />
              
              {/* Retro scanline grid effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
              
              {/* Floating clickable vertical level markers hud */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none z-10 font-sans">
                <div className="flex flex-col justify-between h-full text-[9px] uppercase tracking-wider font-bold">
                  {[5, 4, 3, 2, 1].map((fNum) => {
                    const fl = floorStats.find(item => item.id === fNum);
                    const isSelected = selectedFloor === fNum;
                    return (
                      <div 
                        key={fNum}
                        className={`flex items-center justify-between pointer-events-auto cursor-pointer rounded px-2.5 py-1.5 transition-all duration-300 transform ${
                          isSelected 
                            ? 'bg-amber-500/25 border border-amber-400/50 text-amber-200 translate-x-3 shadow-lg' 
                            : 'bg-stone-950/70 border border-stone-900/40 text-stone-450 hover:bg-stone-950/90 hover:text-stone-200'
                        }`}
                        onClick={() => setSelectedFloor(fNum)}
                        style={{ width: '48%' }}
                      >
                        <div className="flex items-center gap-2 font-serif">
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400 animate-pulse' : 'bg-stone-500'}`} />
                          <span>F{fNum} · {fl?.act}</span>
                        </div>
                        {isSelected && <span className="text-[8px] px-1 bg-amber-500 text-stone-950 rounded font-sans scale-90">宿敌契定</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Glowing decor */}
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-red-950/80 border border-red-500/30 text-[8px] text-red-400 rounded uppercase font-mono tracking-widest pointer-events-none">
                ◎ CORE MATRIX SYSTEM LIVE
              </div>
            </div>

            {/* Interactive hint block */}
            <div className="mt-4 p-3 bg-stone-900/60 border border-stone-850 text-[11px] text-stone-400 font-sans rounded leading-relaxed flex items-start gap-2" id="preview_helpful_note">
              <Info className="w-4 h-4 text-amber-500/75 shrink-0 mt-0.5" />
              <span>你所签订的职业契印将在冒险中大展拳脚！第一层危险较小，随着层级加深，恶灵不仅血防大增，还会对你施加各种致命打击。请在多层内的黑市营地倾销金币采购至强圣器！</span>
            </div>
          </div>

          {/* Right panel: Tabbed floor details (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between" id="preview_right_panel">
            {/* Quick floor button selectors */}
            <div className="grid grid-cols-5 gap-2 mb-4 font-mono">
              {[1, 2, 3, 4, 5].map((fNum) => (
                <button
                  key={fNum}
                  onClick={() => setSelectedFloor(fNum)}
                  className={`py-2 text-center text-xs font-bold transition-all border rounded cursor-pointer ${
                    selectedFloor === fNum
                      ? 'bg-[#c5a880] text-stone-950 border-[#c5a880] shadow-md shadow-[#c5a880]/15'
                      : 'bg-stone-950 text-stone-450 border-stone-850 hover:border-stone-700 hover:text-stone-200'
                  }`}
                >
                  F{fNum}
                </button>
              ))}
            </div>

            {/* Active Floor Card info scroll */}
            {floorStats.map((f) => {
              if (f.id !== selectedFloor) return null;
              return (
                <motion.div 
                  key={f.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="gothic-box bg-stone-950/75 p-5 border border-[#c5a880]/30 shadow-2xl flex-grow flex flex-col justify-between"
                  id={`floor_detail_card_f${f.id}`}
                >
                  <div>
                    {/* Header Act Title */}
                    <div className="flex justify-between items-center border-b border-stone-900 pb-3 mb-3">
                      <div>
                        <span className="text-[10px] text-amber-500 font-mono font-black tracking-widest uppercase block mb-0.5">{f.act} EXpedition</span>
                        <h2 className="text-base md:text-lg font-bold text-white tracking-wide font-serif">{f.name}</h2>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-sans font-bold ${
                        f.id <= 2 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' 
                          : f.id <= 4 
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/20' 
                          : 'bg-red-950 text-rose-400 border border-red-500/20 animate-pulse'
                      }`}>
                        危险度: {f.danger}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400 leading-relaxed font-sans mb-4">
                      {f.desc}
                    </p>

                    {/* Monsters info list */}
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#c5a880] font-bold mb-2">
                        <Skull className="w-3.5 h-3.5 text-red-500" />
                        <span>层内常驻恶魔:</span>
                      </div>
                      <div className="space-y-2 font-serif">
                        {f.monsters.map((m, idx) => (
                          <div key={idx} className="bg-stone-900/40 border border-stone-850/60 p-2.5 rounded hover:border-stone-700 transition duration-150">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-stone-200">{m.name}</span>
                              <span className="text-[10px] font-mono text-stone-450">{m.hp} | {m.atk}</span>
                            </div>
                            <p className="text-[10px] text-stone-500 font-sans mt-0.5 leading-normal">{m.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Guard Boss Info */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-400 font-bold mb-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>终焉守关领主 (Boss):</span>
                      </div>
                      <div className="p-3 rounded border border-amber-500/15 bg-amber-950/10 hover:bg-amber-950/15 duration-200 font-serif">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs font-black text-amber-300">{f.boss.name}</span>
                          <span className="text-[10px] font-mono text-amber-400 font-black">{f.boss.hp} | {f.boss.atk}</span>
                        </div>
                        <p className="text-[10px] text-amber-500/75 font-sans leading-normal">{f.boss.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Chosen subclass indicators */}
                  <div className="pt-2 border-t border-stone-900 mt-2 text-[10px] text-[#c5a880]/60 font-mono uppercase tracking-widest text-center">
                    当前签订职业: <span className="text-stone-300 font-serif">{playerStats.title} (LV.1)</span>
                  </div>
                </motion.div>
              );
            })}

            {/* Main call to action button to enter run */}
            <button
              id="btn_start_expedition"
              onClick={onStartExpedition}
              className="mt-4 w-full py-3 ml-0 bg-gradient-to-b from-[#c5a880] to-[#a38052] hover:from-amber-400 hover:to-[#c5a880] text-stone-950 font-serif font-black text-xs uppercase tracking-widest cursor-pointer shadow-xl duration-200 active:scale-98 flex items-center justify-center gap-2 rounded"
            >
              <Play className="w-4 h-4 fill-current ml-0.5 animate-pulse" /> 承载大印 · 踏入第 1 阶荒原
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
