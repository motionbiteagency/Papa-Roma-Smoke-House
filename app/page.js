'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Flame, ArrowRight, Star, MapPin, Clock, ChevronLeft, ChevronRight, Play, X, Eye, Plus, Check, Crown } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { AnimateOnScroll, StaggerContainer, StaggerItem } from './components/ui/AnimateOnScroll';
import { useCart } from '@/app/context/CartContext';
import { usePublicData } from '@/app/context/PublicDataContext';
import { RESTAURANT_INFO } from '@/lib/constants';
import { getItemImage } from '@/data/itemImages';
import styles from './page.module.css';
import FloatingFoodParticles from './components/ui/FloatingFoodParticles';
import OfferBillboard from './components/ui/OfferBillboard';

/* ===================== ANIMATED COUNTER ===================== */
function AnimatedCounter({ to }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let animationFrame;
    const duration = 2500;
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * to));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(update);
      }
    };
    
    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [to]);
  
  return <>{count}</>;
}

/* ===================== HERO SLIDER ===================== */
function HeroSection() {
  const { config } = usePublicData();
  const heroSlides = config.heroSlides || [];
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);


  useEffect(() => {
    const interval = setInterval(nextSlide, 3500);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slide = heroSlides[currentSlide];

  return (
    <section className={styles.hero}>
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className={styles.heroVideo}
        poster={heroSlides[0]?.image}
      >
        {/* Place your high-quality video in the public/videos folder */}
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient overlay */}
      <div className={styles.heroOverlay}></div>

      {/* Smoke particles */}
      <div className={styles.smokeContainer}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.smoke} style={{
            left: `${15 + i * 14}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}></div>
        ))}
      </div>

      {/* Content */}
      <div className={`container ${styles.heroContent}`}>
        <motion.div
          className={styles.heroBadge}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Flame size={14} /> Dhanmondi Lakeside
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.h1
            key={`title-${currentSlide}`}
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            {slide.title[0]} <span className={styles.heroAccent}>{slide.title[1]}</span>{' '}
            {slide.title[2]} <span className={styles.heroGold}>{slide.title[3]}</span>
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`sub-${currentSlide}`}
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {slide.subtitle}
          </motion.p>
        </AnimatePresence>

        <div className={styles.heroCtas}>
          <a
            href={`https://wa.me/${RESTAURANT_INFO.whatsapp}?text=Hi! I'd like to make a reservation at PAPA ROMA FOOD ENGINEERING 🔥`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Reserve a Table
          </a>
          <Link
            href="/events"
            className={`btn btn-secondary ${styles.glowingBtn}`}
          >
            Book An Event
          </Link>
        </div>

        {/* Slider controls */}
        <div className={styles.sliderControls}>
          <div className={styles.heroDots}>
            {heroSlides.map((_, i) => (
              <button
                key={i}
                className={`${styles.heroDot} ${i === currentSlide ? styles.heroDotActive : ''}`}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className={styles.heroStats}>
          <div className={styles.stat}><span className={styles.statNum}><AnimatedCounter to={4} /></span><span className={styles.statLabel}>Unique Menus</span></div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}><span className={styles.statNum}><AnimatedCounter to={80} />+</span><span className={styles.statLabel}>Dishes</span></div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}><span className={styles.statNum}><AnimatedCounter to={4} />★</span><span className={styles.statLabel}>Lakeside</span></div>
        </div>
      </div>

      <div className={styles.heroScrollIndicator}>
        <div className={styles.scrollLine}></div>
      </div>
    </section>
  );
}

/* ===================== BRAND HERO SECTION ===================== */
function BrandHeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <section ref={containerRef} className={styles.brandHero}>
      <motion.div className={styles.brandHeroBg} style={{ y: bgY }}>
        <Image 
          src="/images/hero-brisket.png" 
          alt="Slow Smoked Brisket" 
          fill 
          style={{ objectFit: 'cover' }}
          className={styles.bgImage}
          priority
        />
        <div className={styles.bgOverlay}></div>
      </motion.div>
      
      <div className={`container ${styles.brandHeroContent}`}>
        <div className={styles.brandNameContainer}>
          <motion.div 
            className={styles.brandLineWrapper}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h2 className={styles.brandLine1} style={{ y: y1 }}>
              PAPA ROMA
            </motion.h2>
          </motion.div>
          
          <motion.div 
            className={styles.brandLineWrapper}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <motion.h2 className={styles.brandLine2} style={{ y: y2 }}>
              Food
            </motion.h2>
          </motion.div>

          <motion.div 
            className={styles.brandLineWrapper}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <motion.h2 className={styles.brandLine3} style={{ y: y3 }}>
              ENGINEERING
            </motion.h2>
          </motion.div>
        </div>
        
        <div className={styles.brandHeroDecorative}>
          <div className={styles.decorLabel}>Premium BBQ</div>
          <div className={styles.decorLabel}>Slow-Smoked Perfection</div>
        </div>
      </div>
    </section>
  );
}

/* ===================== HOT ITEMS ===================== */
function HotItemsSection() {
  const { config, menuData } = usePublicData();
  const allItems = (menuData.menuTypes || []).flatMap((menu) =>
    menu.categories.flatMap((cat) =>
      cat.items.map((item) => ({ ...item, menuSlug: menu.slug }))
    )
  );

  const items = (config.hotPicksItemIds || [])
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => ({
      title: item.name,
      desc: item.description || '',
      image: getItemImage(item.id),
      href: `/menu/${item.menuSlug}`,
      price: item.price,
    }));

  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (window.innerWidth <= 768 && scrollRef.current) {
        const container = scrollRef.current;
        const itemWidth = container.offsetWidth;
        if (container.scrollLeft + itemWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollTo({ left: container.scrollLeft + itemWidth, behavior: 'smooth' });
        }
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className={`section ${styles.hotItems}`}>
      <div className="container">
        <AnimateOnScroll>
          <div className="section-header">
            <span className="section-label">Trending Now</span>
            <h2 className="section-title">Hot <span className="gold-text">Picks</span></h2>
            <p className="section-subtitle">Our guests&apos; absolute favorites this week</p>
          </div>
        </AnimateOnScroll>
        <div 
          className={styles.hotScrollWrapper} 
          ref={scrollRef}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <StaggerContainer className={styles.hotGrid}>
            {items.map((item, idx) => (
              <StaggerItem key={idx} className={styles.hotCardWrapper}>
                <Link href={item.href} className={styles.hotCard}>
                  <div className={styles.hotImage}>
                    <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <div className={styles.hotOverlay}>
                    <h3 className={styles.hotTitle}>{item.title}</h3>
                    <p className={styles.hotDesc}>{item.desc}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

/* ===================== BEEF EATER CLUB ===================== */
const CLUB_BENEFITS = [
  { icon: '🎯', title: '10% Off Every Order', desc: 'Permanent discount on all orders' },
  { icon: '🔥', title: 'Exclusive Beef Parties', desc: 'Cook alongside our Master Chef' },
  { icon: '🚚', title: 'Premium Home Delivery', desc: 'Hand-selected beef to your door' },
  { icon: '👑', title: 'VIP Tasting Events', desc: 'Exclusive beef tasting invitations' },
  { icon: '🎁', title: 'Special Gifts', desc: 'Rewards on milestone purchases' },
  { icon: '🍽️', title: 'New Menu First Access', desc: 'Taste new items before anyone else' },
];

function BeefEaterClubSection() {
  return (
    <section className={styles.beefClubSection}>
      <div className={styles.beefClubBg} />
      <div className="container">
        <div className={styles.beefClubInner}>
          {/* Left content */}
          <div className={styles.beefClubLeft}>
            <div className={styles.beefClubLogo}>
              <Image 
                src="/images/beef-club-logo.png" 
                alt="Beef Eater Club Logo" 
                width={240} 
                height={70} 
                style={{ objectFit: 'contain' }} 
              />
            </div>
            <div className={styles.beefClubBadge}>Members Only</div>
            <h2 className={styles.beefClubTitle}>
              Join the <span className={styles.beefClubRed}>Beef Eater</span> Club
            </h2>
            <p className={styles.beefClubDesc}>
              Dhaka&apos;s most exclusive beef-lover community. Become a member and unlock a world of premium privileges — from VIP events to home-delivered premium cuts.
            </p>
            <div className={styles.beefClubStats}>
              <div className={styles.beefClubStat}><strong>250+</strong><span>Members</span></div>
              <div className={styles.beefClubStatDiv} />
              <div className={styles.beefClubStat}><strong>7</strong><span>Perks</span></div>
              <div className={styles.beefClubStatDiv} />
              <div className={styles.beefClubStat}><strong>Free</strong><span>to Join</span></div>
            </div>
            <Link href="/beef-club" className={styles.beefClubCta}>
              <Crown size={18} /> Claim Your Membership
            </Link>
          </div>

          {/* Right benefits grid */}
          <div className={styles.beefClubRight}>
            {CLUB_BENEFITS.map((b, i) => (
              <div key={i} className={styles.beefClubBenefit}>
                <div className={styles.beefClubBenefitIcon}>{b.icon}</div>
                <div>
                  <h4 className={styles.beefClubBenefitTitle}>{b.title}</h4>
                  <p className={styles.beefClubBenefitDesc}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== RECENT OFFER ===================== */
function OfferSection() {
  const { config } = usePublicData();
  return (
    <section style={{ width: '100%', marginTop: 'clamp(6rem, 10vw, 10rem)', marginBottom: 'clamp(6rem, 10vw, 10rem)' }}>
      <div className="container">
        <AnimateOnScroll>
          <div className="section-header">
            <span className="section-label">Exclusive Deals</span>
            <h2 className="section-title">Special <span className="gold-text">Offers</span></h2>
            <p className="section-subtitle">Don&apos;t miss out on our limited time promotions and discounts</p>
          </div>
        </AnimateOnScroll>
      </div>

      <div style={{ width: '100%' }}>
      {config.imageBanner?.enabled && (
        <AnimateOnScroll style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
          <Link href={config.imageBanner.link || '#'}>
            <div className={styles.imageBannerWrapper}>
              <Image
                src={config.imageBanner.imageSrc}
                alt="Special Offer Banner"
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 90vw"
                priority
              />
            </div>
          </Link>
        </AnimateOnScroll>
      )}

      {config.currentOffer?.enabled && (
        <div className="container" style={{ padding: '0 20px' }}>
          <OfferBillboard offer={config.currentOffer} />
        </div>
      )}
      </div>
    </section>
  );
}

/* ===================== MENU CATEGORIES ===================== */
const menuImages = {
  'smoke-house': '/images/hero-brisket.png',
  'bangla-kuthir': '/images/food-bengali.png',
  'pushkin': '/images/food-pasta.png',
  'beverages': '/images/food-drinks.png',
};

function MenuCategoriesSection() {
  const { menuData } = usePublicData();
  return (
    <section className={`section ${styles.menuCategories}`} style={{ paddingTop: 'clamp(4rem, 8vw, 8rem)', paddingBottom: 0 }}>
      <div className="container">
        <AnimateOnScroll>
          <div className="section-header">
            <span className="section-label">Our Kitchens</span>
            <h2 className="section-title">Four Culinary <span className="gold-text">Worlds</span></h2>
            <p className="section-subtitle">Each menu is a unique culinary journey, crafted by specialized chefs</p>
          </div>
        </AnimateOnScroll>
      </div>
      <div className={styles.stickyContainer}>
        {(menuData.menuTypes || []).map((menu, index) => (
          <div key={menu.id} className={styles.stickyPanel} style={{ zIndex: index + 10 }}>
            <div className={styles.stickyPanelImage}>
              <Image
                src={menuImages[menu.id] || '/images/hero-brisket.png'}
                alt={menu.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="100vw"
                priority={index === 0}
              />
              <div className={styles.stickyPanelOverlay}></div>
            </div>
            
            <div className={styles.stickyPanelContent}>
              {menu.logoImage ? (
                <div className={styles.stickyPanelLogo}>
                  <Image 
                    src={menu.logoImage} 
                    alt={`${menu.name} Logo`} 
                    width={100} 
                    height={100} 
                    style={{ 
                      objectFit: 'contain', 
                      backgroundColor: 'white', 
                      borderRadius: '50%',
                      padding: '10px',
                      marginBottom: 'var(--space-sm)',
                      filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))'
                    }} 
                  />
                </div>
              ) : (
                <div className={styles.stickyPanelIcon}>{menu.icon}</div>
              )}
              <h2 className={styles.stickyPanelTitle}>{menu.name}</h2>
              <p className={styles.stickyPanelDesc}>{menu.description}</p>
              <Link href={`/menu/${menu.slug}`} className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                Explore Menu <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ===================== SIGNATURE DISHES (Cinematic Scroll) ===================== */
const dishImages = {
  sm1: '/images/hero-brisket.png',
  sm2: '/images/gallery-grill.png',
  sm5: '/images/hero-platter.png',
  bs1: '/images/food-burger.png',
  bs4: '/images/food-burger.png',
  pl1: '/images/hero-platter.png',
  bl8: '/images/food-bengali.png',
  bl9: '/images/food-bengali.png',
  bl11: '/images/food-bengali.png',
  bm4: '/images/food-bengali.png',
  bm5: '/images/food-bengali.png',
  bm6: '/images/food-bengali.png',
  ps5: '/images/food-pasta.png',
  ps8: '/images/gallery-grill.png',
  pm2: '/images/food-pasta.png',
  pm4: '/images/food-pasta.png',
  pm8: '/images/hero-platter.png',
  mk4: '/images/food-drinks.png',
  mk9: '/images/food-drinks.png',
  mk12: '/images/food-drinks.png',
  ds4: '/images/food-dessert.png',
  ds6: '/images/food-dessert.png',
  ds8: '/images/food-dessert.png',
  ds12: '/images/food-dessert.png',
};

function DishImageLayer({ dish, index, total, progress }) {
  const slot = 1 / total;
  const tStart = Math.max(0, (index - 0.5) * slot);
  const tEnd = Math.min(1, (index + 1.5) * slot);

  const xFrom  = index === 0 ? '14vw'  : index === 1 ? '18vw'  : '45vw';
  const yFrom  = index === 0 ? '10vh'  : index === 1 ? '14vh'  : '38vh';
  const opFrom = index === 0 ? 0.8     : index === 1 ? 0.75    : 0;
  const scFrom = index === 0 ? 0.9     : index === 1 ? 0.88    : 0.72;

  const imageX = useTransform(progress, [tStart, tEnd], [xFrom, '-45vw']);
  const imageY = useTransform(progress, [tStart, tEnd], [yFrom, '-38vh']);
  const imageRotate = useTransform(progress, [tStart, tEnd], [4, -4]);
  const imageRotateY = useTransform(progress, [tStart, tEnd], [14, -14]);
  const imageOpacity = useTransform(
    progress,
    [tStart, Math.min(tEnd, tStart + slot * 0.35), Math.max(tStart, tEnd - slot * 0.35), tEnd],
    [opFrom, 1, 1, 0]
  );
  const imageScale = useTransform(
    progress,
    [tStart, (tStart + tEnd) / 2, tEnd],
    [scFrom, 1, 0.78]
  );

  return (
    <motion.div
      className={styles.cineImage}
      style={{ x: imageX, y: imageY, opacity: imageOpacity, scale: imageScale, rotate: imageRotate, rotateY: imageRotateY }}
    >
      <Image
        src={dishImages[dish.id] || '/images/hero-brisket.png'}
        alt={dish.name}
        fill
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 1200px) 60vw, 45vw"
        priority={index < 2}
      />
      <div className={styles.cineImageSheen} />
    </motion.div>
  );
}

function SignatureDishesCinematic({ dishes }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const N = dishes.length;
  const [activeDish, setActiveDish] = useState(0);
  const [scrollDir, setScrollDir] = useState(1);
  const activeDishRef = useRef(0);
  const prevProgressRef = useRef(0);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const dir = latest >= prevProgressRef.current ? 1 : -1;
    prevProgressRef.current = latest;
    const idx = Math.min(Math.floor(latest * N), N - 1);
    if (idx !== activeDishRef.current) {
      activeDishRef.current = idx;
      setScrollDir(dir);
      setActiveDish(idx);
    }
  });

  const dish = dishes[activeDish];
  const yOffset = 50;
  const ySmall = 22;

  return (
    <section
      ref={containerRef}
      className={styles.sigSection}
      style={{ height: `${(N + 1) * 100}vh` }}
    >
      <div className={styles.sigSticky}>
        {/* Section identity — top left, persistent */}
        <div className={styles.sigBrandLabel}>
          <span className={styles.sigBrandSubLabel}>Chef&apos;s Selection</span>
          <h2 className={styles.sigBrandTitle}>
            Signature <span className="accent-text">Dishes</span>
          </h2>
        </div>

        {/* Total counter — bottom right */}
        <div className={styles.sigCounter}>
          <span>{String(N).padStart(2, '0')} dishes</span>
        </div>

        {/* Images — scroll-driven diagonal travel */}
        {dishes.map((d, i) => (
          <DishImageLayer
            key={d.id}
            dish={d}
            index={i}
            total={N}
            progress={scrollYProgress}
          />
        ))}

        {/* Big number — direction-aware, simultaneous exit/enter */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`num-${activeDish}`}
            className={styles.cineNum}
            initial={{ opacity: 0, y: scrollDir * yOffset }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: scrollDir * -yOffset }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            aria-hidden="true"
          >
            {String(activeDish + 1).padStart(2, '0')}
          </motion.div>
        </AnimatePresence>

        {/* Text — direction-aware, simultaneous exit/enter */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`text-${activeDish}`}
            className={styles.cineText}
            initial={{ opacity: 0, y: scrollDir * ySmall }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: scrollDir * -ySmall }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className={styles.cineCategory}>{dish.menuName}</span>
            <h3 className={styles.cineTitle}>{dish.name}</h3>
            {dish.description && <p className={styles.cineDesc}>{dish.description}</p>}
            <div className={styles.cineMeta}>
              <span className={styles.cinePrice}>
                ৳{dish.price}
                {dish.unit && <small> / {dish.unit}</small>}
              </span>
              <Link href={`/menu/${dish.menuSlug}`} className={styles.cineCta}>
                View Dish <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function SignatureDishesMobile({ dishes }) {
  const { addItem, items } = useCart();
  
  const handleAdd = (dish) => {
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      menuName: dish.menuName,
      unit: dish.unit
    });
  };

  const isAdded = (dishId) => items.some(i => i.id === dishId);

  return (
    <section className={styles.sigMobileSection}>
      <div className="container">
        <AnimateOnScroll>
          <div className="section-header">
            <span className="section-label">Chef&apos;s Selection</span>
            <h2 className="section-title">
              Signature <span className="accent-text">Dishes</span>
            </h2>
            <p className="section-subtitle">
              Handpicked favorites from each of our four menus
            </p>
          </div>
        </AnimateOnScroll>
        <StaggerContainer className={styles.sigMobileGrid}>
          {dishes.map((dish, i) => {
            const added = isAdded(dish.id);
            return (
              <StaggerItem key={dish.id}>
                <article className={styles.sigMobileCard}>
                  <div className={styles.sigMobileImage}>
                    <Image
                      src={dishImages[dish.id] || '/images/hero-brisket.png'}
                      alt={dish.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="100vw"
                    />
                    <span className={styles.sigMobileNum}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className={styles.sigMobileContent}>
                    <span className={styles.sigMobileCategory}>{dish.menuName}</span>
                    <h3 className={styles.sigMobileTitle}>{dish.name}</h3>
                    {dish.description && (
                      <p className={styles.sigMobileDesc}>{dish.description}</p>
                    )}
                    <div className={styles.sigMobileMeta}>
                      <span className={styles.sigMobilePrice}>
                        ৳{dish.price}
                        {dish.unit && <small> / {dish.unit}</small>}
                      </span>
                      <button 
                        onClick={() => handleAdd(dish)}
                        className={`${styles.sigMobileAddBtn} ${added ? styles.addedState : ''}`}
                      >
                        {added ? (
                          <><Check size={14} /> Added</>
                        ) : (
                          <><Plus size={14} /> Add</>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

function SignatureDishesSection() {
  const { menuData } = usePublicData();
  const featuredItems = [];
  (menuData.menuTypes || []).forEach((mt) => {
    mt.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.featured) {
          featuredItems.push({
            ...item,
            menuName: mt.name,
            menuSlug: mt.slug,
            categoryName: cat.name,
          });
        }
      });
    });
  });
  const dishes = featuredItems.slice(0, 6);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <>
      {isMobile ? (
        <SignatureDishesMobile dishes={dishes} />
      ) : (
        <SignatureDishesCinematic dishes={dishes} />
      )}
      <div className={styles.sigFooter}>
        <AnimateOnScroll>
          <Link href="/menu/smoke-house" className="btn btn-secondary">
            View Full Menu <ArrowRight size={16} />
          </Link>
        </AnimateOnScroll>
      </div>
    </>
  );
}


/* ===================== COOKING VIDEOS SECTION ===================== */
function CookingVideosSection() {
  const { config } = usePublicData();
  const cookingVideos = config.cookingVideos || {};
  const [activeVideo, setActiveVideo] = useState(null);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setActiveVideo(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!cookingVideos?.enabled || !cookingVideos.videos?.length) return null;

  const ytThumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  return (
    <section className={styles.cookingVideos}>
      <div className="container">
        <AnimateOnScroll>
          <div className="section-header">
            <span className="section-label">{cookingVideos.sectionLabel}</span>
            <h2 className="section-title">
              {cookingVideos.sectionTitle.split(' ')[0]}{' '}
              <span className="gold-text">
                {cookingVideos.sectionTitle.split(' ').slice(1).join(' ')}
              </span>
            </h2>
            <p className="section-subtitle">{cookingVideos.sectionSubtitle}</p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll>
          <div className={styles.reelsGridContainer}>
            {cookingVideos.videos.map((video, idx) => {
              let aspectClass = styles.aspectTall;
              if (idx % 5 === 1) aspectClass = styles.aspectSquare;
              else if (idx % 5 === 2) aspectClass = styles.aspectMedium;
              else if (idx % 5 === 3) aspectClass = styles.aspectLandscape;
              else if (idx % 5 === 4) aspectClass = styles.aspectTall;

              return (
                <div
                  key={`${video.id}-${idx}`}
                  className={styles.reelCard}
                  onClick={() => setActiveVideo(video)}
                  onMouseEnter={() => setHoveredVideoId(idx)}
                  onMouseLeave={() => setHoveredVideoId(null)}
                >
                  <div className={`${styles.reelThumbWrapper} ${aspectClass}`}>
                    {hoveredVideoId === idx ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${video.youtubeId}&playsinline=1&uid=${idx}`}
                        className={styles.reelThumb}
                        style={{ border: 'none', pointerEvents: 'none', width: '100%', height: '100%' }}
                        allow="autoplay; encrypted-media"
                      />
                    ) : (
                      <>
                        <img src={ytThumb(video.youtubeId)} alt={video.title} className={styles.reelThumb} />
                        <div className={styles.videoCardOverlay} />
                        <div className={styles.videoPlayBtn}>
                          <Play size={24} fill="currentColor" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className={styles.reelCardContent}>
                    <h3 className={styles.reelCardTitle}>{video.title}</h3>
                    <div className={styles.reelCardMeta}>
                      {video.category && <span className={styles.videoCategoryBadgeSmall}>{video.category}</span>}
                      {video.views && <span className={styles.videoCardViewsSmall}><Eye size={10} /> {video.views}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AnimateOnScroll>
      </div>

      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className={styles.videoModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className={styles.videoModalBackdrop} onClick={() => setActiveVideo(null)} />
            <motion.div
              className={styles.videoModalInner}
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <button className={styles.videoModalClose} onClick={() => setActiveVideo(null)} aria-label="Close video">
                <X size={18} />
              </button>
              <div className={styles.videoPlayerWrapper}>
                <iframe
                  className={styles.videoModalIframe}
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activeVideo.title}
                />
              </div>
              <p className={styles.videoModalTitle}>{activeVideo.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ===================== TESTIMONIALS ===================== */
function TestimonialsSection() {
  const { testimonials: testimonialsData } = usePublicData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonials = (testimonialsData.testimonials || []).filter((t) => t.active);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) next();
    if (distance < -minSwipeDistance) prev();
  };

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <section className={`section ${styles.testimonials}`}>
      <div className="container">
        <AnimateOnScroll>
          <div className="section-header">
            <span className="section-label">What Guests Say</span>
            <h2 className="section-title">Loved by <span className="gold-text">Food Enthusiasts</span></h2>
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll>
          <div 
            className={styles.testimonialSlider}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndHandler}
          >
            <button className={styles.tSliderBtn} onClick={prev} aria-label="Previous"><ChevronLeft size={20} /></button>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className={styles.testimonialCard}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <div className={styles.stars}>
                  {[...Array(testimonials[currentIndex]?.rating || 5)].map((_, i) => (
                    <Star key={i} size={16} fill="var(--color-gold)" color="var(--color-gold)" />
                  ))}
                </div>
                <p className={styles.testimonialText}>&ldquo;{testimonials[currentIndex]?.comment}&rdquo;</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>
                    {testimonials[currentIndex]?.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={testimonials[currentIndex].image} alt={testimonials[currentIndex].name} />
                    ) : (
                      testimonials[currentIndex]?.name?.charAt(0)
                    )}
                  </div>
                  <span className={styles.authorName}>{testimonials[currentIndex]?.name}</span>
                </div>
              </motion.div>
            </AnimatePresence>
            <button className={styles.tSliderBtn} onClick={next} aria-label="Next"><ChevronRight size={20} /></button>
          </div>
          <div className={styles.dots}>
            {testimonials.map((_, i) => (
              <button key={i} className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ''}`} onClick={() => setCurrentIndex(i)} aria-label={`Testimonial ${i + 1}`} />
            ))}
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/submit-review" className="btn btn-secondary">
              Leave a Review
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

/* ===================== POSTER CTA SECTION ===================== */
function PosterCTASection() {
  const { config } = usePublicData();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const lineVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section ref={containerRef} className={styles.posterCTA}>
      <motion.div className={styles.posterCTABg} style={{ y: bgY }}>
        <Image 
          src="/images/abstract-smoke.png" 
          alt="Abstract Smoke" 
          fill 
          style={{ objectFit: 'cover' }}
          className={styles.bgImagePoster}
          priority
        />
        <div className={styles.bgOverlayPoster}></div>
      </motion.div>
      
      <div className="container">
        <motion.div 
          className={styles.posterCTAContent}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className={styles.posterLineWrapper}>
            <motion.a 
              href="#reservation" 
              className={styles.posterLine1} 
              variants={lineVariants}
              whileHover={{ x: 20, color: 'var(--color-gold)' }}
            >
              BOOK YOUR TABLE
            </motion.a>
          </div>
          
          <div className={styles.posterLineWrapper}>
            <motion.a 
              href="https://wa.me/yournumber" 
              className={styles.posterLine2} 
              variants={lineVariants}
              whileHover={{ x: -20, color: 'var(--color-gold)' }}
            >
              TASTE THE FIRE
            </motion.a>
          </div>

          <motion.div 
            className={styles.posterButtonWrapper}
            variants={lineVariants}
          >
            <motion.a 
              href={`https://wa.me/${RESTAURANT_INFO.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.posterMainButton}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(212, 168, 83, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              RESERVE YOUR TABLE
            </motion.a>
          </motion.div>

          <motion.div 
            className={styles.posterFooter}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.4 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <span>PAPA ROMA FOOD ENGINEERING</span>
            <div className={styles.posterDivider}></div>
            <span>ESTD 2024</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ===================== MAP & CTA ===================== */
function MapCtaSection() {
  const restaurant = RESTAURANT_INFO;
  return (
    <section className={`section ${styles.mapCta}`}>
      <div className="container">
        <div className={styles.mapGrid}>
          <AnimateOnScroll direction="left" className={styles.mapEmbed}>
            <iframe
              src={restaurant.mapEmbed}
              width="100%" height="400" style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
              allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="PAPA ROMA FOOD ENGINEERING Location"
            ></iframe>
          </AnimateOnScroll>
          <AnimateOnScroll direction="right" className={styles.ctaContent}>
            <span className="section-label">Visit Us</span>
            <h2 className="section-title">Experience the <span className="gold-text">Magic</span></h2>
            <div className={styles.ctaDetails}>
              <div className={styles.ctaDetail}><MapPin size={20} className={styles.ctaIcon} /><div><h4>Location</h4><p>{restaurant.address}</p></div></div>
              <div className={styles.ctaDetail}><Clock size={20} className={styles.ctaIcon} /><div><h4>Hours</h4><p>{restaurant.hours}</p></div></div>
            </div>
            <div className={styles.ctaButtons}>
              <a href={`https://wa.me/${restaurant.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Reserve via WhatsApp</a>
              <Link href="/contact" className="btn btn-secondary">Contact Us</Link>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}

/* ===================== MAIN PAGE ===================== */
export default function HomePage() {
  return (
    <>
      <FloatingFoodParticles />
      <HeroSection />
      <BrandHeroSection />
      <HotItemsSection />
      <MenuCategoriesSection />
      <SignatureDishesSection />
      <BeefEaterClubSection />
      <OfferSection />
      <CookingVideosSection />
      <TestimonialsSection />
      <PosterCTASection />
      <MapCtaSection />
    </>
  );
}
