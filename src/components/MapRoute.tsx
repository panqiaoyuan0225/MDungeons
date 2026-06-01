/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
  Play
} from 'lucide-react';

interface MapRouteProps {
  floor: number;
  nodes: DungeonNode[];
  onSelectNode: (node: DungeonNode) => void;
  onEnterShop: () => void;
  onEnterCharacter: () => void;
  onEnterTrophy: () => void;
  playerLevel: number;
  playerGold: number;
  playerHp: number;
  playerMaxHp: number;
  playerTitle: string;
}

export default function MapRoute({
  floor,
  nodes,
  onSelectNode,
  onEnterShop,
  onEnterCharacter,
  onEnterTrophy,
  playerLevel,
  playerGold,
  playerHp,
  playerMaxHp,
  playerTitle
}: MapRouteProps) {
  
  const getNodeIcon = (type: NodeType, status: string) => {
    const size = "w-6 h-6";
    if (status === 'locked') {
      return <Lock className="w-5 h-5 text-stone-600" id="icon_locked" />;
    }
    
    switch (type) {
      case NodeType.START:
        return <Compass className={`${size} text-sky-400`} id="icon_start" />;
      case NodeType.COMBAT:
        return <Sword className={`${size} text-amber-500`} id="icon_combat" />;
      case NodeType.ELITE:
        return <Sparkles className={`${size} text-rose-500 animate-pulse`} id="icon_elite" />;
      case NodeType.BOSS:
        return <Crown className="w-7 h-7 text-yellow-400 animate-bounce" id="icon_boss" />;
      case NodeType.SHOP:
        return <ShoppingCart className={`${size} text-emerald-400`} id="icon_shop" />;
      case NodeType.TREASURE:
        return <HelpCircle className={`${size} text-purple-400`} id="icon_treasure" />;
      case NodeType.EVENT:
        return <HelpCircle className={`${size} text-teal-400`} id="icon_event" />;
    }
  };

  const getNodeBgColor = (type: NodeType, status: 'locked' | 'available' | 'completed') => {
    if (status === 'locked') return 'bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed opacity-60';
    if (status === 'completed') return 'bg-rose-950/40 border-rose-800 text-stone-500 hover:bg-rose-900/40';
    
    // Status is 'available'
    switch (type) {
      case NodeType.START:
        return 'bg-sky-950/50 border-sky-500 text-sky-200 ring-2 ring-sky-500/20 hover:scale-110';
      case NodeType.COMBAT:
        return 'bg-amber-950/50 border-amber-500 text-amber-200 ring-2 ring-amber-500/20 hover:scale-110';
      case NodeType.ELITE:
        return 'bg-rose-950/60 border-rose-500 text-rose-100 ring-2 ring-rose-500/30 hover:scale-110';
      case NodeType.BOSS:
        return 'bg-yellow-950/50 border-yellow-500 text-yellow-200 ring-4 ring-yellow-500/30 hover:scale-110 duration-500';
      case NodeType.SHOP:
        return 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/20 hover:scale-110';
      case NodeType.TREASURE:
        return 'bg-purple-950/50 border-purple-500 text-purple-200 ring-2 ring-purple-500/20 hover:scale-110';
      case NodeType.EVENT:
        return 'bg-teal-950/50 border-teal-500 text-teal-200 ring-2 ring-teal-500/20 hover:scale-110';
    }
  };

  // Find target coordinates and connections for line plotting
  const renderConnections = () => {
    const lines: React.ReactNode[] = [];
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (targetNode) {
          // Check if path is active (from completed node, or both unlocked/available)
          const isActive = (node.status === 'completed' && targetNode.status !== 'locked') || 
                           (node.status === 'completed' && targetNode.status === 'completed');
          
          lines.push(
            <line
              key={`${node.id}-${targetId}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${targetNode.x}%`}
              y2={`${targetNode.y}%`}
              stroke={isActive ? '#f43f5e' : '#292524'}
              strokeWidth={isActive ? '3' : '1.5'}
              strokeDasharray={isActive ? 'none' : '5,5'}
              className="transition-all duration-500"
            />
          );
        }
      });
    });
    return lines;
  };

  return (
    <div 
      className="flex flex-col min-h-screen text-stone-100 font-sans select-none bg-cover bg-center bg-no-repeat" 
      id="map_route_container"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(20, 18, 16, 0.78), rgba(12, 10, 9, 0.96)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Top ambient state header bar */}
      <header className="z-10 bg-stone-900/80 backdrop-blur-md border-b border-stone-800/80 p-4 sticky top-0" id="map_top_header">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-rose-950/50 border border-rose-500/30 px-3 py-1 rounded text-rose-400 font-mono text-xs tracking-wider" id="map_floor_badge">
              第 {floor} 层地牢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">{playerTitle}</span>
                <span className="text-xs bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded">Lv.{playerLevel}</span>
              </div>
              {/* HP Bar */}
              <div className="flex items-center gap-1.5 mt-1" id="mini_hp_bar_wrapper">
                <div className="w-24 bg-stone-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-red-500 h-full transition-all duration-300" 
                    style={{ width: `${Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 font-mono">HP: {playerHp}/{playerMaxHp}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5" id="nav_action_row">
            <button 
              id="map_btn_character"
              onClick={onEnterCharacter}
              className="px-3.5 py-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-stone-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              人物属性 / 装备
            </button>
            <button 
              id="map_btn_trophy"
              onClick={onEnterTrophy}
              className="px-3.5 py-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-stone-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              🎖️ 功勋成就 / 领奖
            </button>
          </div>
        </div>
      </header>

      {/* Main Map Stage */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto p-4 md:p-8 relative" id="map_stage_main">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide" id="map_tier_indic">地牢探索路线图</h2>
          <p className="text-xs text-stone-500 mt-1">选择亮起的路径节点继续前行进行战斗闯关、奇遇获取或物资补给，直至击败该层终极守领！</p>
        </div>

        {/* Map Canvas Box */}
        <div className="relative w-full aspect-[2/1] md:aspect-[3/1] min-h-[300px] border border-stone-900 bg-stone-950/80 rounded-2xl overflow-hidden p-6 shadow-2xl" id="map_visual_canvas">
          {/* Coordinate lines connecting nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            {renderConnections()}
          </svg>

          {/* Render Actual interactive Node points */}
          {nodes.map((node) => {
            const isCompleted = node.status === 'completed';
            const isAvailable = node.status === 'available';
            const isLocked = node.status === 'locked';

            return (
              <div 
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                id={`node_container_${node.id}`}
              >
                <button
                  id={`btn_node_click_${node.id}`}
                  disabled={isLocked}
                  onClick={() => onSelectNode(node)}
                  className={`w-11 h-11 md:w-13 md:h-13 rounded-full border flex items-center justify-center transition-all duration-300 relative ${getNodeBgColor(node.type, node.status)}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-rose-500" />
                  ) : (
                    getNodeIcon(node.type, node.status)
                  )}

                  {/* Pulsing indicator if available */}
                  {isAvailable && (
                    <span className="absolute inset-x-0 -bottom-2 mx-auto w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </button>

                {/* Node info tooltip card */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-48 p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 text-xs hidden group-hover:block pointer-events-none shadow-xl z-50 text-center font-sans">
                  <div className="font-bold text-white">{node.name}</div>
                  <div className="text-[10px] text-rose-400 mt-0.5">
                    {node.type === NodeType.START && '起始大门'}
                    {node.type === NodeType.COMBAT && '普通遭遇战'}
                    {node.type === NodeType.ELITE && '精锐守护者'}
                    {node.type === NodeType.BOSS && '楼层守门主头领'}
                    {node.type === NodeType.SHOP && '地盘黑市黑商'}
                    {node.type === NodeType.TREASURE && '遗失金箱秘柜'}
                    {node.type === NodeType.EVENT && '不可预知神石奇遇'}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1">
                    {isCompleted && '已攻克/访问完毕'}
                    {isAvailable && '可前往开拓路线 ▶'}
                    {isLocked && '道路未连通，处于封印状态 🔒'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend Map guide footer */}
        <div className="mt-6 p-4 rounded-xl border border-stone-900/60 bg-stone-900/25 flex flex-wrap gap-x-8 gap-y-3 justify-center text-xs text-stone-400" id="map_legend_bar">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
            <span>普通魔物战斗</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500 animate-pulse" />
            <span>精锐守关怪物</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500" />
            <span>魔王祭坛</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />
            <span>黑商补给站</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500" />
            <span>上古秘药/宝箱</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-teal-500/30 border border-teal-500" />
            <span>宿命石碑奇遇</span>
          </div>
        </div>
      </main>
    </div>
  );
}
