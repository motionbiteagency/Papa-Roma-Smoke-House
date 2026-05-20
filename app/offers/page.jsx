'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Plus, Check, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { usePublicData } from '@/app/context/PublicDataContext';
import { getItemImage } from '@/data/itemImages';
import styles from './offers.module.css';

export default function OffersPage() {
  const { config, menuData } = usePublicData();
  const { addItem, items: cartItems, openDrawer } = useCart();
  const [addedItems, setAddedItems] = useState({});

  // Flatten the entire menu to find offer items
  const allItems = (menuData.menuTypes || []).flatMap(type =>
    type.categories.flatMap(cat =>
      cat.items.map(item => ({
        ...item,
        menuId: type.id,
        menuName: type.name,
        menuSlug: type.slug,
        categoryId: cat.id,
        categoryName: cat.name
      }))
    )
  );

  const offerItems = allItems.filter(item => 
    config.offerItemIds && config.offerItemIds.includes(item.id)
  );

  const handleAddToCart = (item) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit || null,
      menuName: item.menuName,
    });
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    openDrawer();
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <div className={styles.offersPage}>
      <div className={styles.header}>
        <div className="container">
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <Tag size={32} />
            </div>
            <h1 className={styles.title}>Exclusive Offers</h1>
            <p className={styles.subtitle}>Our current special deals and handpicked favorites.</p>
          </div>
        </div>
      </div>

      <div className="container">
        {offerItems.length > 0 ? (
          <div className={styles.grid}>
            {offerItems.map(item => {
              const inCart = cartItems.some(i => i.id === item.id);
              const recentlyAdded = addedItems[item.id];
              const imageSrc = getItemImage(item.id);

              return (
                <div key={item.id} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={imageSrc}
                      alt={item.name}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className={styles.offerBadge}>Special Deal</div>
                    <div className={styles.menuTag}>{item.menuName}</div>
                  </div>
                  
                  <div className={styles.content}>
                    <div className={styles.categoryInfo}>{item.categoryName}</div>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemDesc}>{item.description}</p>
                    
                    <div className={styles.footer}>
                      <div className={styles.priceInfo}>
                        <span className={styles.price}>৳{item.price}</span>
                        {item.unit && <span className={styles.unit}>{item.unit}</span>}
                      </div>
                      
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className={`${styles.addBtn} ${recentlyAdded ? styles.added : ''}`}
                        aria-label="Add to order"
                      >
                        {recentlyAdded ? <Check size={18} /> : (inCart ? <Check size={18} /> : <Plus size={18} />)}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Tag size={48} opacity={0.3} />
            <h2>No Offers Right Now</h2>
            <p>Check back later for special deals and discounts.</p>
            <Link href="/menu/smoke-house" className={styles.browseBtn}>Browse Menus</Link>
          </div>
        )}
      </div>
    </div>
  );
}
