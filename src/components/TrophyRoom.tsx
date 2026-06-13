/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Achievement } from '../types';
import { 
  ChevronLeft, 
  Trophy, 
  Award, 
  CheckCircle2, 
  Gift, 
  Coins, 
  ShieldAlert, 
  Crown,
  Lock
} from 'lucide-react';

interface TrophyRoomProps {
  achievements: Achievement[];
  onClaimReward: (achievementId: string) => void;
  onLeaveTrophy: () => void;
  highScore: number;
}

export default function TrophyRoom({
  achievements,
  onClaimReward,
  onLeaveTrophy,
  highScore
}: TrophyRoomProps) {
  
  const getMedalColor = (id: string, completed: boolean) => {
    if (!completed) return 'text-stone-700 bg-stone-900 border-stone-850';
    if (id === 'ach_7') return 'text-yellow-405 bg-yellow-950/40 border-yellow-500/40 animate-pulse'; // Diamond
    if (id === 'ach_3' || id === 'ach_4') return 'text-amber-400 bg-amber-950/40 border-amber-500/40'; // Gold
    return 'text-slate-300 bg-slate-900/40 border-slate-700/40'; // Silver
  };

  const getRewardIcon = (type: Achievement['rewardType']) => {
    if (type === 'gold') return <Coins className="w-3.5 h-3.5 text-yellow-400" />;
    if (type === 'stat') return <Award className="w-3.5 h-3.5 text-rose-400" />;
    return <Crown className="w-3.5 h-3.5 text-yellow-500" />;
  };

  const totalCompleted = achievements.filter(a => a.completed).length;
  const totalClaimed = achievements.filter(a => a.claimed).length;

  return (
    <div 
      className="flex flex-col min-h-screen font-serif text-stone-100 bg-cover bg-center bg-no-repeat relative overflow-hidden" 
      id="trophy_room_container"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(18, 12, 10, 0.94), rgba(6, 4, 4, 0.99)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Immersive vignette system */}
      <div className="vignette-ambient" />

      {/* Atmospheric localized amber torch glow background */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-950/15 blur-3xl animate-torch pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-yellow-950/20 blur-3xl animate-torch pointer-events-none z-0" />

      {/* Top Header with Double Borders */}
      <header className="z-20 bg-stone-950/95 border-b-4 border-black p-4 sticky top-0 shadow-lg" id="trophy_top_header">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            id="btn_trophy_leave"
            onClick={onLeaveTrophy}
            className="px-4 py-2 text-[11px] btn-pixel-gothic flex items-center gap-1.5 cursor-pointer rounded-none"
          >
            <ChevronLeft className="w-4 h-4" /> 返回深渊地图
          </button>

          <span className="text-[10px] text-[#c5a880] font-mono tracking-widest uppercase hidden md:inline">
            🏆 —— 誓约荣耀勋勋章法殿 ——
          </span>
        </div>
      </header>

      {/* Hero Banner header */}
      <div className="py-10 text-center px-4 relative z-10" id="trophy_hero_panel">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-none bg-stone-950 border-2 border-black shadow-[0_0_12px_rgba(197,168,128,0.3)] text-[#c5a880] mb-3 animate-pulse" id="trophy_hero_icon">
          <Trophy className="w-6 h-6 animate-bounce mt-1" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-[#c5a880] uppercase tracking-wider drop-shadow-md">
          地牢誓约：万神荣誉法殿
        </h1>
        <p className="text-xs text-stone-400 mt-2 max-w-lg mx-auto leading-relaxed font-sans">
          「陈列你于无尽地牢深巢中斩下的赫赫功勋。每当点亮奇迹勋章，皆可自愿激活万神法咒，当即永久提升气血属性，并领取黑市金沙配给！」
        </p>
      </div>

      {/* Split statistic overview inside double borders */}
      <div className="max-w-4xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col gap-6 relative z-10" id="trophy_body_inner">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" id="stats_overview_row">
          <div className="p-4 rounded-none gothic-box text-center">
            <div className="text-stone-500 text-[10px] font-mono uppercase tracking-widest">勋章点亮进度</div>
            <div className="text-2xl font-bold font-serif text-[#c5a880] mt-1">{Math.round((totalCompleted / achievements.length) * 100)}%</div>
            <div className="text-[9px] text-stone-500 mt-1 font-sans">已寻回勋章 {totalCompleted} 枚</div>
          </div>
          <div className="p-4 rounded-none gothic-box text-center">
            <div className="text-stone-500 text-[10px] font-mono uppercase tracking-widest">宝藏领取率</div>
            <div className="text-2xl font-bold font-serif text-amber-500 mt-1">{totalClaimed} / {totalCompleted}</div>
            <div className="text-[9px] text-stone-500 mt-1 font-sans">勋章礼赏领取进度</div>
          </div>
          <div className="col-span-2 md:col-span-1 p-4 rounded-none gothic-box text-center">
            <div className="text-stone-500 text-[10px] font-mono uppercase tracking-widest">终极无畏记录</div>
            <div className="text-2xl font-bold font-serif text-rose-500 mt-1">{highScore} XP</div>
            <div className="text-[9px] text-stone-500 mt-1 font-sans">单轮最高承载积分</div>
          </div>
        </div>

        {/* List of achievements cards */}
        <div className="space-y-4" id="achievements_list_view">
          {achievements.map((ach) => {
            const isCompleted = ach.completed;
            const isClaimed = ach.claimed;
            const progressPercent = Math.min(100, Math.round((ach.current / ach.target) * 100));

            return (
              <div 
                key={ach.id}
                id={`achievement_card_${ach.id}`}
                className={`p-4.5 rounded-none gothic-box flex flex-col md:flex-row items-stretch justify-between gap-4 transition-all duration-100 ${
                  isClaimed 
                    ? 'opacity-40 saturate-50' 
                    : isCompleted 
                    ? 'hover:gothic-box-glow ring-4 ring-yellow-500/15' 
                    : 'opacity-85'
                }`}
              >
                {/* Left block information */}
                <div className="flex gap-4 items-start flex-1 font-serif">
                  <div className={`p-3 rounded-none border-2 border-black flex items-center justify-center shrink-0 ${getMedalColor(ach.id, isCompleted)}`}>
                    <Trophy className="w-5 h-5 flex animate-pulse" />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-stone-100 text-sm tracking-wide truncate">{ach.name}</h3>
                      {isClaimed && <span className="text-[8px] bg-stone-900 text-stone-500 px-1.5 py-0.5 rounded-none border-2 border-black font-mono font-bold">已封赏</span>}
                      {isCompleted && !isClaimed && <span className="text-[8px] bg-[#c5a880]/20 text-[#c5a880] px-1.5 py-0.5 rounded-none border-2 border-black font-mono font-bold animate-pulse">可领取</span>}
                    </div>
                    <p className="text-xs text-stone-450 mt-1 leading-relaxed font-sans">{ach.description}</p>
                    
                    {/* Progression bar */}
                    <div className="mt-3.5 max-w-sm">
                      <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono">
                        <span>达成契据: {ach.condition}</span>
                        <span className="font-bold">{ach.current} / {ach.target}</span>
                      </div>
                      <div className="mt-1.5 w-full bg-stone-950 border-2 border-black h-3.5 rounded-none p-[1px] overflow-hidden">
                        <div 
                          className={`h-full rounded-none pixel-bar-inner transition-all duration-500 ${isCompleted ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gradient-to-r from-stone-800 to-stone-700'}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right block: Action reward block */}
                <div className="flex md:flex-col justify-between items-end shrink-0 border-t md:border-t-0 md:border-l-2 border-dashed border-stone-850 pt-3 md:pt-0 md:pl-5 min-w-[140px] text-right gap-3 font-serif" id="reward_action_box">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] text-stone-500 block uppercase font-mono tracking-widest">万神法契恩赏:</span>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-stone-300 font-bold">
                      {getRewardIcon(ach.rewardType)}
                      <span>{ach.rewardName}</span>
                    </div>
                  </div>

                  {isClaimed ? (
                    <button 
                      disabled
                      className="px-3 py-1 font-serif text-[10px] bg-stone-900 border-2 border-black text-stone-500 rounded-none cursor-not-allowed select-none"
                    >
                      法赏已存
                    </button>
                  ) : isCompleted ? (
                    <button
                      id={`btn_claim_reward_${ach.id}`}
                      onClick={() => onClaimReward(ach.id)}
                      className="px-3 py-1.5 btn-pixel-gothic text-[11px] rounded-none hover:from-amber-400 hover:to-amber-600 cursor-pointer shadow-lg active:scale-95 animate-bounce"
                    >
                      🎁 兑领功勋 !
                    </button>
                  ) : (
                    <div className="text-[10px] text-stone-700 font-bold flex items-center gap-1 py-1 font-sans">
                      <Lock className="w-3 h-3 text-stone-800" /> 契约未达成
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
