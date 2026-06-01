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
      className="flex flex-col min-h-screen font-sans text-stone-100 bg-cover bg-center bg-no-repeat" 
      id="trophy_room_container"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(120, 53, 4, 0.72), rgba(12, 10, 9, 0.96)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Top Header */}
      <header className="z-10 bg-stone-900/80 backdrop-blur-md border-b border-stone-800 p-4 sticky top-0" id="trophy_top_header">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            id="btn_trophy_leave"
            onClick={onLeaveTrophy}
            className="px-3.5 py-1.5 rounded-lg border border-stone-800 bg-stone-950 text-xs font-semibold hover:bg-stone-900 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> 返回深渊地图
          </button>

          <span className="text-xs text-yellow-400 font-mono tracking-wider flex items-center gap-1">
            🏆 荣耀殿堂: {totalCompleted} / {achievements.length} 攻克
          </span>
        </div>
      </header>

      {/* Hero Banner header */}
      <div className="bg-gradient-to-b from-yellow-950/20 to-transparent py-10 text-center px-4" id="trophy_hero_panel">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-950/50 border border-yellow-500/30 text-yellow-400 mb-3 animate-spin duration-1000" id="trophy_hero_icon">
          <Trophy className="w-7 h-7" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide">
          地牢开拓荣誉勋章殿堂
        </h1>
        <p className="text-xs text-stone-550 mt-1 max-w-lg mx-auto leading-relaxed">
          「在此陈列着你在无尽幽闭底舱创下的赫赫威名。消灭魔物精锐、升华等级门环均能解锁特殊勋章，点击领取可得真实永久属性与大袋金币！」
        </p>
      </div>

      {/* Split statistic overview */}
      <div className="max-w-4xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col gap-6" id="trophy_body_inner">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" id="stats_overview_row">
          <div className="p-4 rounded-xl border border-stone-900 bg-stone-900/30 text-center">
            <div className="text-stone-500 text-[10px] font-mono uppercase tracking-wider">勋章点亮率</div>
            <div className="text-2xl font-black text-rose-500 mt-1">{Math.round((totalCompleted / achievements.length) * 100)}%</div>
            <div className="text-[9px] text-stone-550 mt-1">已获取 {totalCompleted} 枚</div>
          </div>
          <div className="p-4 rounded-xl border border-stone-900 bg-stone-900/30 text-center">
            <div className="text-stone-500 text-[10px] font-mono uppercase tracking-wider">奖项领取</div>
            <div className="text-2xl font-black text-yellow-450 mt-1">{totalClaimed} / {totalCompleted}</div>
            <div className="text-[9px] text-stone-550 mt-1">可兑领宝藏补给奖品</div>
          </div>
          <div className="col-span-2 md:col-span-1 p-4 rounded-xl border border-stone-900 bg-stone-900/30 text-center">
            <div className="text-stone-500 text-[10px] font-mono uppercase tracking-wider font-semibold">历史无畏最高经验积分</div>
            <div className="text-2xl font-black text-sky-400 mt-1">{highScore} pts</div>
            <div className="text-[9px] text-stone-550 mt-1">多层通关以创造奇迹</div>
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
                className={`p-4.5 rounded-2xl border flex flex-col md:flex-row items-stretch justify-between gap-4 transition-all duration-300 ${
                  isClaimed 
                    ? 'bg-stone-950/50 border-stone-900 opacity-60' 
                    : isCompleted 
                    ? 'bg-stone-900/50 border-yellow-500/30 hover:border-yellow-500/50 shadow-md ring-1 ring-yellow-500/5' 
                    : 'bg-stone-900/30 border-stone-900'
                }`}
              >
                {/* Left block information */}
                <div className="flex gap-4 items-start flex-1">
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-center shrink-0 ${getMedalColor(ach.id, isCompleted)}`}>
                    <Trophy className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm tracking-wide truncate">{ach.name}</h3>
                      {isClaimed && <span className="text-[9px] bg-stone-850 text-stone-500 px-1.5 py-0.5 rounded border border-stone-800">已兑奖</span>}
                      {isCompleted && !isClaimed && <span className="text-[9px] bg-yellow-500/20 text-yellow-405 px-1.5 py-0.5 rounded border border-yellow-500/30 animate-pulse">可兑奖</span>}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{ach.description}</p>
                    
                    {/* Progression bar */}
                    <div className="mt-3.5 max-w-sm">
                      <div className="flex justify-between items-center text-[10px] text-stone-605 font-mono">
                        <span>达成要求: {ach.condition}</span>
                        <span>{ach.current} / {ach.target}</span>
                      </div>
                      <div className="mt-1 w-full bg-stone-950 border border-stone-850 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${isCompleted ? 'bg-yellow-500' : 'bg-rose-500'}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right block: Action reward block */}
                <div className="flex md:flex-col justify-between items-end shrink-0 border-t md:border-t-0 md:border-l border-stone-900/80 pt-3 md:pt-0 md:pl-5 min-w-[140px] text-right gap-3" id="reward_action_box">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-stone-600 block uppercase font-mono tracking-widest">荣耀功勋奖品:</span>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-white font-semibold">
                      {getRewardIcon(ach.rewardType)}
                      <span>{ach.rewardName}</span>
                    </div>
                  </div>

                  {isClaimed ? (
                    <button 
                      disabled
                      className="px-3 py-1.5 rounded bg-stone-950 border border-stone-900 text-stone-600 text-xs font-semibold cursor-not-allowed select-none"
                    >
                      已纳入麾下
                    </button>
                  ) : isCompleted ? (
                    <button
                      id={`btn_claim_reward_${ach.id}`}
                      onClick={() => onClaimReward(ach.id)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-stone-950 text-xs font-bold font-sans hover:from-yellow-400 hover:to-amber-400 cursor-pointer shadow-lg active:scale-95 animate-bounce"
                    >
                      🎁 兑领奖品 !
                    </button>
                  ) : (
                    <div className="text-[10px] text-stone-505 font-medium flex items-center gap-1 py-1.5">
                      <Lock className="w-3 h-3 text-stone-702" /> 待解锁条件
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
