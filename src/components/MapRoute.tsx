/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DungeonNode, NodeType } from '../types';
import { 
  Sword, 
  ShoppingCart, 
  Sparkles, 
  HelpCircle, 
  Skull, 
  Compass, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  Crown,
  Play,
  Gift,
  CloudFog,
  Coins,
  Flame,
  Heart,
  Shield,
  Pickaxe,
  Droplet,
  Eye
} from 'lucide-react';
import { audio } from '../lib/audio';

interface MapRouteProps {
  floor: number;
  nodes: DungeonNode[];
  onSelectNode: (node: DungeonNode) => void;
  onEnterShop: () => void;
  onEnterCharacter: () => void;
  onEnterTrophy: () => void;
  onEnterPreview?: () => void;
  playerLevel: number;
  playerGold: number;
  playerHp: number;
  playerMaxHp: number;
  playerTitle: string;
  difficulty?: string;
}

export default function MapRoute({
  floor,
  nodes,
  onSelectNode,
  onEnterShop,
  onEnterCharacter,
  onEnterTrophy,
  onEnterPreview,
  playerLevel,
  playerGold,
  playerHp,
  playerMaxHp,
  playerTitle,
  difficulty
}: MapRouteProps) {
  const [selectedNode, setSelectedNode] = useState<DungeonNode | null>(null);
  const [isMutedState, setIsMutedState] = useState<boolean>(() => audio.isMuted());

  const getNodeIcon = (type: NodeType, status: string) => {
    const size = "w-5 h-5 md:w-6 h-6";
    if (status === 'locked') {
      return <Lock className="w-4.5 h-4.5 text-stone-750" id="icon_locked" />;
    }
    
    switch (type) {
      case NodeType.START:
        return <Compass className={`${size} text-sky-400`} id="icon_start" />;
      case NodeType.COMBAT:
        return <Sword className={`${size} text-amber-500`} id="icon_combat" />;
      case NodeType.ELITE:
        return <Skull className={`${size} text-rose-500 animate-pulse`} id="icon_elite" />;
      case NodeType.BOSS:
        return <Crown className="w-6.5 h-6.5 text-yellow-400" id="icon_boss" />;
      case NodeType.SHOP:
        return <ShoppingCart className={`${size} text-emerald-400`} id="icon_shop" />;
      case NodeType.TREASURE:
        return <Gift className={`${size} text-purple-400`} id="icon_treasure" />;
      case NodeType.EVENT:
        return <HelpCircle className={`${size} text-teal-400`} id="icon_event" />;
      case NodeType.MIST_RUINS:
        return <CloudFog className={`${size} text-cyan-400 animate-pulse`} id="icon_mist_ruins" />;
      case NodeType.WANDERING_MERCHANT:
        return <Coins className={`${size} text-yellow-400`} id="icon_wandering_merchant" />;
      case NodeType.CAGE_CHALLENGE:
        return <Flame className={`${size} text-rose-500 animate-bounce`} id="icon_cage_challenge" />;
      case NodeType.SOUL_ALTAR:
        return <Flame className={`${size} text-purple-500 animate-pulse`} id="icon_soul_altar" />;
      case NodeType.SANCTUARY:
        return <Droplet className={`${size} text-sky-450 animate-pulse`} id="icon_sanctuary" />;
      case NodeType.ARMORY:
        return <Shield className={`${size} text-slate-350`} id="icon_armory" />;
      case NodeType.MINE:
        return <Pickaxe className={`${size} text-amber-600`} id="icon_mine" />;
      case NodeType.ABYSS:
        return <HelpCircle className={`${size} text-zinc-500`} id="icon_abyss" />;
      case NodeType.MIRROR:
        return <Eye className={`${size} text-teal-300 animate-pulse`} id="icon_mirror" />;
      case NodeType.MIMIC:
        return <Gift className={`${size} text-rose-500 animate-bounce`} id="icon_mimic" />;
    }
  };

  const getNodeBgColor = (type: NodeType, status: 'locked' | 'available' | 'completed') => {
    if (status === 'locked') return 'bg-stone-920 border-stone-850 text-stone-700 cursor-not-allowed opacity-45';
    if (status === 'completed') return 'bg-rose-950/25 border-rose-900/60 text-stone-550 hover:bg-rose-950/40';
    
    // Status is 'available'
    switch (type) {
      case NodeType.START:
        return 'bg-sky-950/40 border-sky-500/80 text-sky-300 ring-1 ring-sky-500/10 hover:scale-110';
      case NodeType.COMBAT:
        return 'bg-stone-950 border-amber-600/90 text-amber-350 ring-1 ring-amber-500/10 hover:scale-110';
      case NodeType.ELITE:
        return 'bg-stone-950 border-rose-600 text-rose-250 ring-1 ring-rose-500/20 hover:scale-110';
      case NodeType.BOSS:
        return 'bg-stone-950 border-yellow-600/90 text-yellow-350 ring-2 ring-yellow-500/20 hover:scale-110 duration-500';
      case NodeType.SHOP:
        return 'bg-stone-950 border-emerald-600/80 text-emerald-350 ring-1 ring-emerald-500/10 hover:scale-110';
      case NodeType.TREASURE:
        return 'bg-stone-950 border-purple-600/80 text-purple-350 ring-1 ring-purple-500/10 hover:scale-110';
      case NodeType.EVENT:
        return 'bg-stone-950 border-teal-600/80 text-teal-350 ring-1 ring-teal-500/10 hover:scale-110';
      case NodeType.MIST_RUINS:
        return 'bg-stone-950 border-cyan-500/70 text-cyan-300 ring-1 ring-cyan-500/25 hover:scale-110 animate-pulse';
      case NodeType.WANDERING_MERCHANT:
        return 'bg-stone-950 border-amber-500/80 text-yellow-100 ring-1 ring-amber-500/20 hover:scale-110';
      case NodeType.CAGE_CHALLENGE:
        return 'bg-stone-950 border-red-800 text-red-100 ring-2 ring-red-500/20 hover:scale-110 duration-300';
      case NodeType.SOUL_ALTAR:
        return 'bg-stone-950 border-purple-800 text-purple-200 ring-2 ring-purple-500/20 hover:scale-110';
      case NodeType.SANCTUARY:
        return 'bg-stone-950 border-cyan-400 text-cyan-200 ring-2 ring-sky-500/20 hover:scale-110 animate-pulse';
      case NodeType.ARMORY:
        return 'bg-stone-950 border-slate-600 text-slate-100 ring-1 ring-slate-400/25 hover:scale-110';
      case NodeType.MINE:
        return 'bg-stone-950 border-amber-800 text-amber-200 ring-1 ring-amber-700/15 hover:scale-110';
      case NodeType.ABYSS:
        return 'bg-stone-950 border-zinc-700 text-zinc-300 ring-1 ring-zinc-500/20 hover:scale-110';
      case NodeType.MIRROR:
        return 'bg-stone-950 border-teal-500 text-teal-100 ring-2 ring-teal-450/25 hover:scale-110';
      case NodeType.MIMIC:
        return 'bg-stone-950 border-rose-850 text-red-100 ring-2 ring-rose-500/25 hover:scale-110 animate-bounce';
    }
  };

  const getNodeLabel = (type: NodeType) => {
    switch (type) {
      case NodeType.START: return '起点';
      case NodeType.COMBAT: return '战斗';
      case NodeType.ELITE: return '精英';
      case NodeType.BOSS: return '首领';
      case NodeType.SHOP: return '商店';
      case NodeType.TREASURE: return '宝箱';
      case NodeType.EVENT: return '事件';
      case NodeType.MIST_RUINS: return '迷雾遗迹';
      case NodeType.WANDERING_MERCHANT: return '行脚商';
      case NodeType.CAGE_CHALLENGE: return '囚笼挑战';
      case NodeType.SOUL_ALTAR: return '荒魂祭坛';
      case NodeType.SANCTUARY: return '静谧圣泉';
      case NodeType.ARMORY: return '旧日军械库';
      case NodeType.MINE: return '黑曜石矿脉';
      case NodeType.ABYSS: return '冥魂断崖';
      case NodeType.MIRROR: return '命运魔镜';
      case NodeType.MIMIC: return '贪婪宝箱怪';
    }
  };

  // Find target coordinates and connections for line plotting
  const renderConnections = () => {
    const lines: React.ReactNode[] = [];
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (targetNode) {
          // Highlight connection if the target node is currently selected
          const isSelectedPath = (selectedNode && 
            ((node.id === selectedNode.id && targetNode.status === 'completed') || 
             (targetNode.id === selectedNode.id && node.status === 'completed'))
          );
          
          const isActive = (node.status === 'completed' && targetNode.status !== 'locked') || 
                           (node.status === 'completed' && targetNode.status === 'completed');
          
          let strokeColor = '#241a14'; // very dark earthy stone
          let strokeWidth = '3';
          let strokeDash = '6,4';
          let className = "transition-all duration-500 opacity-30";

          if (isSelectedPath) {
            strokeColor = '#eab308'; // Bright Gold for Slay active selection!
            strokeWidth = '4';
            strokeDash = '6,4';
            className = "transition-all duration-500 animate-line-flow-fast drop-shadow-[0_0_8px_rgba(234,179,8,0.55)]";
          } else if (isActive) {
            strokeColor = '#b45309'; // Blood golden amber for completed path connection
            strokeWidth = '3';
            strokeDash = '8,4';
            className = "transition-all duration-500 animate-line-flow drop-shadow-[0_0_4px_rgba(180,83,9,0.35)]";
          } else if (node.status === 'completed' && targetNode.status === 'available') {
            // Path leading to a node that is currently available to pick!
            strokeColor = '#d97706'; // Orange amber warning pulse
            strokeWidth = '3.5';
            strokeDash = '6,4';
            className = "transition-all duration-500 animate-line-flow drop-shadow-[0_0_6px_rgba(217,119,6,0.45)]";
          }
          
          lines.push(
            <line
              key={`${node.id}-${targetId}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${targetNode.x}%`}
              y2={`${targetNode.y}%`}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDash}
              className={className}
            />
          );
        }
      });
    });
    return lines;
  };

  // Human-readable titles to replicate "第 1 层 · 腐败荒原"
  const getFloorTitle = (f: number) => {
    switch (f) {
      case 1: return '腐败荒原 (Act I · Decay Wasteland)';
      case 2: return '幽魂古堡 (Act II · Ghost Castle)';
      case 3: return '终焉墓园 (Act III · Doom Cemetery)';
      case 4: return '机械魔巢 (Act IV · Mecha Core)';
      case 5: return '万神圣域 (Act V · Pantheon Realm)';
      default: return `极境裂脉 (Act ${f} · Rift)`;
    }
  };

  return (
    <div 
      className="flex flex-col min-h-screen text-stone-100 font-serif select-none relative overflow-hidden bg-stone-950" 
      id="map_route_container"
      style={{ 
        backgroundImage: `url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* 1. LAYER ONE: Semi-transparent tileable dungeon stone brick pixel background */}
      <div 
        className="absolute inset-0 bg-repeat pointer-events-none opacity-[0.25] mix-blend-multiply z-0" 
        style={{ 
          backgroundImage: `url('/src/assets/images/pixel_stone_brick_bg_1780305835401.png')`,
          backgroundSize: '160px 160px',
        }}
      />

      {/* 2. LAYER TWO: Deep oppressive vignette ambient gradient to enhance dungeon depth */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          background: 'radial-gradient(circle at center, rgba(14, 11, 10, 0.45) 15%, rgba(4, 3, 3, 0.97) 90%)'
        }}
      />
      {/* Immersive vignette system */}
      <div className="vignette-ambient" />

      {/* Atmospheric torch fire light glows behind map container */}
      <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-orange-950/10 blur-3xl animate-torch pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-emerald-950/10 blur-3xl animate-torch pointer-events-none z-0" />

      {/* Top ambient state header bar */}
      <header className="z-20 bg-stone-950/90 border-b-4 border-black py-3.5 px-4 sticky top-0 shadow-[0_5px_15px_rgba(0,0,0,0.85)]" id="map_top_header">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-red-950 to-stone-950 border-2 border-black px-3.5 py-1.5 rounded-none text-rose-400 font-serif text-[11px] font-bold tracking-widest uppercase shadow-[0_0_8px_rgba(239,68,68,0.2)]" id="map_floor_badge">
              第 {floor} 层 · {getFloorTitle(floor)}
            </div>
            {difficulty && (
              <div className={`border-2 border-black px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider uppercase shadow-[0_0_8px_rgba(0,0,0,0.6)] ${
                difficulty === 'HARD' 
                  ? 'bg-amber-950/80 text-amber-400 border-amber-600/70' 
                  : difficulty === 'APOCALYPSE' 
                  ? 'bg-red-950/90 text-red-500 border-red-700/80 animate-pulse' 
                  : difficulty === 'NIGHTMARE' 
                  ? 'bg-purple-950/90 text-purple-400 border-purple-500/80 animate-bounce' 
                  : 'bg-sky-950/80 text-sky-400 border-sky-600/70'
              }`} id="map_difficulty_badge" style={difficulty === 'NIGHTMARE' ? { animationDuration: '4s' } : undefined}>
                {difficulty === 'HARD' ? '💀 炼狱难度' : difficulty === 'APOCALYPSE' ? '💥 混沌难度' : difficulty === 'NIGHTMARE' ? '☣️ 噩梦难度' : '🛡️ 普通'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-100 text-sm md:text-base font-serif tracking-widest">{playerTitle}</span>
                <span className="text-[9px] bg-amber-955/20 text-amber-400 border-2 border-black px-1.5 py-0.5 rounded-none font-mono">等级: Lv.{playerLevel}</span>
              </div>
              {/* HP Bar */}
              <div className="flex items-center gap-2 mt-1" id="mini_hp_bar_wrapper">
                <div className="w-28 bg-stone-950 rounded-none h-3 overflow-hidden border-2 border-black p-[1px]">
                  <div 
                    className="bg-gradient-to-r from-red-700 to-rose-500 h-full rounded-none transition-all duration-300" 
                    style={{ width: `${Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 font-mono font-bold">气血: {playerHp}/{playerMaxHp}</span>
                <span className="text-[10px] text-yellow-500 font-mono font-bold ml-2">🪙 {playerGold} 金沙</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 z-30 font-serif" id="nav_action_row">
            {onEnterPreview && (
              <button 
                id="map_btn_preview"
                onClick={onEnterPreview}
                className="px-4 py-2 text-[11px] btn-pixel-gothic flex items-center gap-1.5 cursor-pointer rounded-none text-amber-500 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
              >
                🗺️ 地牢大剖视图
              </button>
            )}
            <button 
              id="map_btn_character"
              onClick={onEnterCharacter}
              className="px-4 py-2 text-[11px] btn-pixel-gothic flex items-center gap-1.5 cursor-pointer rounded-none"
            >
              人物属性/装备
            </button>
            <button 
              id="map_btn_trophy"
              onClick={onEnterTrophy}
              className="px-4 py-2 text-[11px] btn-pixel-gothic flex items-center gap-1.5 cursor-pointer rounded-none"
            >
              🎖️ 功勋成就/领奖
            </button>
            <button 
              id="map_btn_mute"
              onClick={() => {
                const updatedMuted = audio.toggleMute();
                setIsMutedState(updatedMuted);
                if (!updatedMuted) audio.playClick();
              }}
              className="px-4 py-2 text-[11px] btn-pixel-gothic flex items-center gap-1.5 cursor-pointer rounded-none text-stone-300 border-stone-850"
            >
              {isMutedState ? '🔇 静音' : '🔊 音效开'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Map Stage */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto p-4 md:p-8 relative z-10" id="map_stage_main">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-serif font-black text-[#c5a880] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" id="map_tier_indic">
            {getFloorTitle(floor)}
          </h2>
          <p className="text-[10px] text-stone-400 tracking-widest font-serif uppercase mt-1">—— 点选星门坐标以完成出征誓约 ——</p>
        </div>

        {/* Map Canvas Box with Golden double borders */}
        <div className="relative w-full aspect-[2/1] md:aspect-[3/1] min-h-[350px] gothic-box rounded-none overflow-hidden p-6" id="map_visual_canvas">
          {/* Subtle localized illumination grid layer */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(197,168,128,0.04),transparent_50%)] pointer-events-none" />

          {/* Golden Retro Corner Ornament brackets for medieval aesthetics */}
          <div className="absolute top-1.5 left-1.5 w-6 h-6 border-t-4 border-l-4 border-amber-600/75 pointer-events-none rounded-none z-30" />
          <div className="absolute top-1.5 right-1.5 w-6 h-6 border-t-4 border-r-4 border-amber-600/75 pointer-events-none rounded-none z-30" />
          <div className="absolute bottom-1.5 left-1.5 w-6 h-6 border-b-4 border-l-4 border-amber-600/75 pointer-events-none rounded-none z-30" />
          <div className="absolute bottom-1.5 right-1.5 w-6 h-6 border-b-4 border-r-4 border-amber-600/75 pointer-events-none rounded-none z-30" />

          {/* Coordinate lines connecting nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
            {renderConnections()}
          </svg>

          {/* Render Actual interactive Node points */}
          {nodes.map((node) => {
            const isCompleted = node.status === 'completed';
            const isAvailable = node.status === 'available';
            const isLocked = node.status === 'locked';
            const isSelected = selectedNode?.id === node.id;

            return (
              <div 
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 flex flex-col items-center"
                id={`node_container_${node.id}`}
              >
                <button
                  id={`btn_node_click_${node.id}`}
                  disabled={isLocked}
                  onClick={() => {
                    if (isAvailable) {
                      setSelectedNode(node);
                    }
                  }}
                  className={`w-11 h-11 md:w-13 md:h-13 rounded-none border-4 border-black flex items-center justify-center transition-all duration-300 relative shadow-lg ${getNodeBgColor(node.type, node.status)} ${isSelected ? 'ring-4 ring-amber-400 border-amber-500 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.5)] z-30' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  ) : (
                    getNodeIcon(node.type, node.status)
                  )}

                  {/* Pulsing indicator if available & not currently selected */}
                  {isAvailable && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-none bg-red-650 animate-ping" />
                  )}

                  {/* Retro spinning bracket overlay indicator around the button */}
                  {isAvailable && (
                    <div className={`absolute -inset-2 border-2 border-dashed ${isSelected ? 'border-red-500 animate-[spin_3s_linear_infinite]' : 'border-amber-500/60 animate-[spin_12s_linear_infinite]'} rounded-none pointer-events-none group-hover:scale-110 transition-all z-10`} />
                  )}
                </button>

                {/* Direct Text Labels underneath the Node */}
                <div className="absolute top-[48px] flex flex-col items-center min-w-[70px] text-center pointer-events-none">
                  <span className={`text-[10px] tracking-widest font-serif font-black ${isLocked ? 'text-stone-700' : isCompleted ? 'text-stone-550' : 'text-amber-550'} drop-shadow-[0_2px_3px_rgba(0,0,0,1)]`}>
                    {getNodeLabel(node.type)}
                  </span>
                </div>

                {/* Node info tooltip card */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-52 p-3 rounded-none border-4 border-black bg-stone-950 text-stone-200 text-xs hidden group-hover:block pointer-events-none shadow-[2px_12px_24px_rgba(0,0,0,0.85)] z-50 text-center font-serif outline outline-2 outline-amber-900/40">
                  {/* Subtle retro inner border in tooltips */}
                  <div className="absolute inset-0.5 border border-dashed border-stone-800 pointer-events-none" />
                  
                  <div className="font-bold text-amber-100 text-xs tracking-wider relative z-10">{node.name}</div>
                  <div className="text-[9px] text-amber-500 mt-1 uppercase font-bold tracking-widest relative z-10">
                    {node.type === NodeType.START && '「 始宿契门 」'}
                    {node.type === NodeType.COMBAT && '「 幽途魔阻 」'}
                    {node.type === NodeType.ELITE && '「 炼狱卫哨 」'}
                    {node.type === NodeType.BOSS && '「 祭坛龙主 」'}
                    {node.type === NodeType.SHOP && '「 暗界黑商 」'}
                    {node.type === NodeType.TREASURE && '「 遗落宝箱 」'}
                    {node.type === NodeType.EVENT && '「 宿命碑碣 」'}
                    {node.type === NodeType.MIST_RUINS && '「 迷雾遗迹 · 凶吉交感 」'}
                    {node.type === NodeType.WANDERING_MERCHANT && '「 行脚商人 · 绝世特惠 」'}
                    {node.type === NodeType.CAGE_CHALLENGE && '「 战栗囚笼 · 地狱生死 」'}
                    {node.type === NodeType.SOUL_ALTAR && '「 荒魂祭坛 · 舍生祭金 」'}
                    {node.type === NodeType.SANCTUARY && '「 静谧圣泉 · 疗愈洗心 」'}
                    {node.type === NodeType.ARMORY && '「 旧日军械库 · 破钢测试 」'}
                    {node.type === NodeType.MINE && '「 黑曜石矿脉 · 刨金损耗 」'}
                    {node.type === NodeType.ABYSS && '「 冥魂断崖 · 险隘跳跃 」'}
                    {node.type === NodeType.MIRROR && '「 命运魔镜 · 拓组克隆 」'}
                    {node.type === NodeType.MIMIC && '「 贪婪宝箱怪 · 凶相撕咬 」'}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1.5 font-sans leading-normal relative z-10">
                    {isCompleted && '本源坐标已访问或剿灭完毕'}
                    {isAvailable && '可前往签订战刃路线 ▶'}
                    {isLocked && '道路未连通，处于封印状态 🔒'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tactical marches Confirmation Button: "确定出征" - MATCHES IMAGE 1 */}
        {selectedNode && (
          <div className="flex flex-col items-center justify-center mt-7 animate-pulse" id="confirm_march_pnl">
            <button
              id="btn_confirm_march_act"
              onClick={() => {
                onSelectNode(selectedNode);
                setSelectedNode(null);
              }}
              className="px-14 py-3 bg-stone-950 border-4 border-black text-amber-250 font-serif font-bold text-lg tracking-widest hover:bg-stone-900 hover:text-amber-400 transition-all duration-300 shadow-[0_0_25px_rgba(0,0,0,0.95)] flex items-center justify-center cursor-pointer select-none rounded-none"
            >
              确定出征
            </button>
            <p className="text-[10px] text-amber-550 tracking-widest mt-2 px-3 py-1 bg-stone-950 border-2 border-black rounded-none font-serif uppercase">
              瞄准锚点坐标：{selectedNode.name}
            </p>
          </div>
        )}

        {/* Legend Map guide footer with Gold frames */}
        <div className="mt-8 p-4 rounded-none border-2 border-black bg-stone-950 backdrop-blur-md flex flex-wrap gap-x-8 gap-y-3 justify-center text-xs text-stone-400 shadow-inner" id="map_legend_bar">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-none border-2 border-black bg-amber-500/20" />
            <span className="font-serif text-[11px]">普通怪战</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-none border-2 border-black bg-rose-500/20" />
            <span className="font-serif text-[11px]">精锐卫兽</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-none border-2 border-black bg-yellow-500/20" />
            <span className="font-serif text-[11px]">守关领主</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-none border-2 border-black bg-emerald-500/20" />
            <span className="font-serif text-[11px]">黑市商店</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-none border-2 border-black bg-purple-500/20 animate-pulse" />
            <span className="font-serif text-[11px]">秘境宝箱</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-none border-2 border-black bg-teal-500/20" />
            <span className="font-serif text-[11px]">宿命抉择</span>
          </div>
        </div>
      </main>
    </div>
  );
}
