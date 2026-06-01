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
      className="flex flex-col min-h-screen text-stone-100 font-sans bg-cover bg-center bg-no-repeat" 
      id="shop_view_container"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(6, 78, 59, 0.72), rgba(12, 10, 9, 0.95)), url('/src/assets/images/pixel_battle_bg_1780280589681.png')`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Top Banner */}
      <header className="z-10 bg-stone-900/80 backdrop-blur-md border-b border-stone-850/60 p-4 sticky top-0" id="shop_top_header">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            id="btn_shop_back_map"
            onClick={onLeaveShop}
            className="px-3.5 py-1.5 rounded-lg border border-stone-800 bg-stone-950/80 text-xs font-semibold hover:bg-stone-900 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> 返回深渊地图
          </button>

          <div className="flex items-center gap-2 bg-stone-950/80 border border-stone-850/60 px-4 py-1.5 rounded-xl text-yellow-400 font-mono text-sm font-semibold shadow-inner" id="shop_gold_badge">
            <Coins className="w-4 h-4 animate-spin" />
            <span>地牢财富: {playerGold} 金币</span>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="bg-stone-900/50 backdrop-blur-xs border-b border-stone-850/40 py-8 text-center px-4 flex flex-col items-center" id="shop_hero_panel">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-xl mb-3 flex items-center justify-center" id="shop_merchant_icon">
          <img 
            src="/src/assets/images/pixel_merchant_img_1780280556243.png" 
            alt="Dungeon Merchant" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide">阿尼玛地牢黑市商店</h1>
        <p className="text-xs text-stone-400 mt-1.5 max-w-lg mx-auto leading-relaxed">
          「欢迎光临，年轻的誓约者。在这里可以用一袋袋沉甸甸的金沙，兑换极具抗物理的头盔铠甲或加满魔力的高阶神兵。切记，地牢中装备买卖也是实力的重要阶层！」
        </p>
      </div>

      {/* Main categories navigation rows */}
      <div className="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col gap-6" id="shop_body_inner">
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-stone-900 pb-4" id="category_filter_row">
          {(['ALL', ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY, ItemType.POTION] as (ItemType | 'ALL')[]).map((cat) => (
            <button
              key={cat}
              id={`shop_category_tab_${cat.toLowerCase()}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-stone-900 hover:bg-stone-855 border border-stone-800 text-stone-300'
              }`}
            >
              {cat === 'ALL' && '👑 全部商品'}
              {cat === ItemType.WEAPON && '⚔️ 地牢神兵'}
              {cat === ItemType.ARMOR && '🛡️ 重型誓甲'}
              {cat === ItemType.ACCESSORY && '🔮 混沌魔宝'}
              {cat === ItemType.POTION && '🧪 炼金圣水'}
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
                className={`relative rounded-2xl border p-5 bg-stone-950/75 backdrop-blur-xs flex flex-col justify-between gap-4 transition-all duration-300 ${
                  owned 
                    ? 'border-stone-850 opacity-75' 
                    : 'border-stone-900 shadow-xl hover:border-emerald-500/20 hover:scale-102 hover:shadow-emerald-950/10'
                }`}
              >
                {/* Upper card part representing item specs */}
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-center">
                      {getItemIcon(item.icon, item.tier)}
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold tracking-widest uppercase ${getTierBadgeColor(item.tier)}`}>
                      {item.tier === ItemTier.COMMON && '普通阶级 (T4)'}
                      {item.tier === ItemTier.RARE && '精良阶级 (T3)'}
                      {item.tier === ItemTier.EPIC && '史诗阶级 (T2)'}
                      {item.tier === ItemTier.LEGENDARY && '传世神格 (T1)'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-500 h-9 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Stat attribute boosts overview */}
                <div className="bg-stone-950/60 p-2.5 rounded-lg border border-stone-850/50 text-[11px] font-mono space-y-1">
                  {item.hpBonus && <div className="text-red-400 flex justify-between"><span>生命上限:</span><span>+{item.hpBonus} HP</span></div>}
                  {item.mpBonus && <div className="text-blue-400 flex justify-between"><span>魔力上限:</span><span>+{item.mpBonus} MP</span></div>}
                  {item.atkBonus && <div className="text-amber-400 flex justify-between"><span>攻击增幅:</span><span>+{item.atkBonus} ATK</span></div>}
                  {item.defBonus && <div className="text-sky-300 flex justify-between"><span>物理坚防:</span><span>+{item.defBonus} DEF</span></div>}
                  {!item.hpBonus && !item.mpBonus && !item.atkBonus && !item.defBonus && (
                    <div className="text-stone-500 italic text-center text-[10px]">消耗魔物战斗中使用的生存补给极品。</div>
                  )}
                </div>

                {/* Buying section bottom footer */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-900 gap-4">
                  <div className="flex items-center gap-1 font-mono text-yellow-400 text-sm font-semibold">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{item.cost} 金</span>
                  </div>

                  {owned ? (
                    <div className="px-4 py-2 rounded-xl bg-stone-950 border border-stone-850 text-stone-500 text-xs flex items-center gap-1 font-semibold select-none">
                      <Check className="w-3.5 h-3.5 text-rose-500" /> 已终身契约拥有
                    </div>
                  ) : (
                    <button
                      id={`btn_buy_${item.id}`}
                      disabled={!canAfford}
                      onClick={() => onBuyItem(item)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 z-10 cursor-pointer ${
                        canAfford 
                          ? 'bg-emerald-600 font-bold hover:bg-emerald-500 text-white shadow-md active:scale-95' 
                          : 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? '购买并签定' : '囊中羞愧'}
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
