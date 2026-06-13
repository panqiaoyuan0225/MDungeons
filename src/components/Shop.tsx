/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Item, ItemTier, ItemType } from '../types';
import { SHOP_ITEMS } from '../constants';
import { 
  Coins, 
  ChevronLeft, 
  ShoppingBag, 
  Check, 
  Sword, 
  Shield, 
  Gem, 
  Heart, 
  Sparkles,
  ShoppingBag as BagIcon
} from 'lucide-react';

interface ShopProps {
  playerGold: number;
  inventory: Item[];
  onBuyItem: (item: Item) => void;
  onLeaveShop: () => void;
}

export default function Shop({
  playerGold,
  inventory,
  onBuyItem,
  onLeaveShop
}: ShopProps) {
  const [activeCategory, setActiveCategory] = useState<ItemType | 'ALL'>('ALL');

  const isPurchased = (itemId: string) => {
    // If it is a consumable potion, they can buy multiple copies.
    if (itemId.includes('s_pot_')) return false;
    return inventory.some(i => i.id === itemId);
  };

  const getTierBadgeColor = (tier: ItemTier) => {
    switch (tier) {
      case ItemTier.COMMON:
        return 'bg-stone-800 text-stone-300 border-stone-700';
      case ItemTier.RARE:
        return 'bg-blue-950/50 text-blue-400 border-blue-900/40';
      case ItemTier.EPIC:
        return 'bg-purple-950/50 text-purple-400 border-purple-900/40';
      case ItemTier.LEGENDARY:
        return 'bg-yellow-950/50 text-yellow-500 border-yellow-900/40 animate-pulse';
    }
  };

  const getItemIcon = (iconName: string, tier: ItemTier) => {
    const color = 
      tier === ItemTier.LEGENDARY ? 'text-yellow-400' :
      tier === ItemTier.EPIC ? 'text-purple-400' :
      tier === ItemTier.RARE ? 'text-blue-400' : 'text-stone-300';

    switch (iconName) {
      case 'Sword':
        return <Sword className={`w-8 h-8 ${color}`} id={`icon_sword_${tier}`} />;
      case 'Shield':
        return <Shield className={`w-8 h-8 ${color}`} id={`icon_shield_${tier}`} />;
      case 'Gem':
        return <Gem className={`w-8 h-8 ${color}`} id={`icon_gem_${tier}`} />;
      case 'Sparkles':
        return <Sparkles className={`w-8 h-8 ${color}`} id={`icon_sparkles_${tier}`} />;
      case 'Heart':
        return <Heart className={`w-8 h-8 text-red-500`} id={`icon_heart_${tier}`} />;
      default:
        return <ShoppingBag className={`w-8 h-8 ${color}`} id={`icon_default_${tier}`} />;
    }
  };

  const filteredItems = SHOP_ITEMS.filter(item => {
    if (activeCategory === 'ALL') return true;
    return item.type === activeCategory;
  });

  return (
    <div 
      className="flex flex-col min-h-screen text-stone-100 font-serif bg-cover bg-center bg-no-repeat relative overflow-hidden" 
      id="shop_view_container"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(8, 20, 15, 0.92), rgba(6, 4, 4, 0.99)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Immersive vignette system */}
      <div className="vignette-ambient" />

      {/* Atmospheric green merchant fire light glow background */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-emerald-950/20 blur-3xl animate-torch pointer-events-none" />

      {/* Top Banner with Gold lines */}
      <header className="z-20 bg-stone-950/95 border-b-4 border-black p-4 sticky top-0 shadow-lg" id="shop_top_header">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            id="btn_shop_back_map"
            onClick={onLeaveShop}
            className="px-4 py-2 text-[11px] btn-pixel-gothic flex items-center gap-1.5 cursor-pointer rounded-none"
          >
            <ChevronLeft className="w-4 h-4" /> 返回深渊地图
          </button>

          <div className="flex items-center gap-2 bg-stone-900 border-2 border-black px-4 py-1.5 rounded-none text-amber-400 font-mono text-xs font-bold shadow-inner animate-pulse" id="shop_gold_badge">
            <Coins className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>地牢财富: {playerGold} 金沙</span>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="bg-stone-950/30 py-8 text-center px-4 flex flex-col items-center relative z-10" id="shop_hero_panel">
        <div className="w-20 h-20 rounded-none overflow-hidden bg-stone-900 border-4 border-black shadow-2xl mb-3 flex items-center justify-center" id="shop_merchant_icon">
          <img 
            src="/src/assets/images/pixel_merchant_img_1780280556243.png" 
            alt="Dungeon Merchant" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-3xl font-serif font-black text-[#c5a880] uppercase tracking-wider drop-shadow-md">
          地牢黑市：阿尼玛避难所
        </h1>
        <p className="text-xs text-stone-400 mt-2 max-w-lg mx-auto leading-relaxed font-sans">
          「欢迎光临，年轻的誓约者。在这里可以用沉甸甸的金沙，雇换极具物理御抵的头盔铠甲或加满魔力的高阶神兵。切记，重装配给是活过下一轮的基石！」
        </p>
      </div>

      {/* Main categories navigation rows */}
      <div className="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col gap-6 relative z-15" id="shop_body_inner">
        <div className="flex flex-wrap items-center justify-center gap-2.5 pb-4 border-b border-stone-900" id="category_filter_row">
          {(['ALL', ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY, ItemType.POTION] as (ItemType | 'ALL')[]).map((cat) => (
            <button
              key={cat}
              id={`shop_category_tab_${cat.toLowerCase()}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 font-serif text-[11.5px] rounded-none transition-all cursor-pointer border-2 ${
                activeCategory === cat 
                  ? 'bg-[#c5a880] text-stone-950 font-bold border-black shadow-[0_0_10px_rgba(197,168,128,0.35)]' 
                  : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-300'
              }`}
            >
              {cat === 'ALL' && '👑 全部商品'}
              {cat === ItemType.WEAPON && '⚔️ 地牢神兵'}
              {cat === ItemType.ARMOR && '🛡️ 重型誓甲'}
              {cat === ItemType.ACCESSORY && '🔮 混沌魔宝'}
              {cat === ItemType.POTION && '🧪 炼金药剂'}
            </button>
          ))}
        </div>

        {/* Shelf Grid of Shop items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="shop_shelf_items_grid">
          {filteredItems.map((item) => {
            const owned = isPurchased(item.id);
            const canAfford = playerGold >= item.cost;
            const isConsumable = item.type === ItemType.POTION;

            return (
              <div 
                key={item.id}
                id={`shop_item_card_${item.id}`}
                className={`relative rounded-none p-5 gothic-box flex flex-col justify-between gap-4 transition-all duration-100 ${
                  owned 
                    ? 'opacity-40 saturate-50' 
                    : 'hover:gothic-box-glow hover:-translate-y-0.5'
                }`}
              >
                {/* Upper card part representing item specs */}
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-stone-950 rounded-none border-2 border-black flex items-center justify-center shadow-md">
                      {getItemIcon(item.icon, item.tier)}
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded-none border-2 border-black text-[9px] font-bold tracking-widest uppercase font-mono ${getTierBadgeColor(item.tier)}`}>
                      {item.tier === ItemTier.COMMON && '普通 (Common)'}
                      {item.tier === ItemTier.RARE && '精良 (Rare)'}
                      {item.tier === ItemTier.EPIC && '史诗 (Epic)'}
                      {item.tier === ItemTier.LEGENDARY && '传世 (Legendary)'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-stone-100 text-base font-serif group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-450 h-9 line-clamp-2 mt-1.5 leading-relaxed font-sans">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Stat attribute boosts overview */}
                <div className="bg-stone-950/80 p-2.5 rounded-none border-2 border-black text-[10.5px] font-mono space-y-1">
                  {item.hpBonus && <div className="text-red-400 flex justify-between"><span>气血加成:</span><span className="font-bold">+{item.hpBonus} HP</span></div>}
                  {item.mpBonus && <div className="text-blue-400 flex justify-between"><span>法力加成:</span><span className="font-bold">+{item.mpBonus} MP</span></div>}
                  {item.atkBonus && <div className="text-amber-400 flex justify-between"><span>攻击增幅:</span><span className="font-bold">+{item.atkBonus} ATK</span></div>}
                  {item.defBonus && <div className="text-sky-300 flex justify-between"><span>防御格避:</span><span className="font-bold">+{item.defBonus} DEF</span></div>}
                  {!item.hpBonus && !item.mpBonus && !item.atkBonus && !item.defBonus && (
                    <div className="text-stone-500 italic text-center text-[10px] font-sans">遭遇战斗中提供瞬发性回复或辅助功效。</div>
                  )}
                </div>

                {/* Buying section bottom footer */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-900 gap-4">
                  <div className="flex items-center gap-1 font-mono text-amber-450 text-xs font-bold">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{item.cost} 金沙</span>
                  </div>

                  {owned ? (
                    <div className="px-3.5 py-1.5 rounded-none border-2 border-black bg-stone-950 text-stone-500 text-[10px] flex items-center gap-1 font-bold select-none uppercase font-serif">
                      <Check className="w-3.5 h-3.5 text-amber-500" /> 已签订契约
                    </div>
                  ) : (
                    <button
                      id={`btn_buy_${item.id}`}
                      disabled={!canAfford}
                      onClick={() => onBuyItem(item)}
                      className={`px-4 py-1.5 rounded-none text-[11px] btn-pixel-gothic transition-all flex items-center gap-1 z-10 cursor-pointer ${
                        canAfford 
                          ? 'text-stone-950 hover:from-amber-400 hover:to-amber-600 active:scale-95' 
                          : 'bg-stone-900 border-2 border-stone-800 text-stone-600 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? '购买并签订' : '囊中羞涩'}
                    </button>
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
