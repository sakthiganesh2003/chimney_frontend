'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import { ChevronLeft, ChevronRight, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

const SLIDES = [
  {
    image: '/hero1.jpg',
    badge: 'Top Rated Chimney Service',
    title: 'Professional Chimney Services.',
    subtitle: 'Expert installation and maintenance for a smoke-free kitchen environment.',
  },
  {
    image: '/hero2.jpg',
    badge: 'Deep Cleaning Experts',
    title: 'Deep Cleaning & Restoration.',
    subtitle: 'Remove stubborn grease and soot — chimney back to peak performance.',
  },
  {
    image: '/hero3.jpg',
    badge: 'Certified Technicians',
    title: 'Reliable Repair Services.',
    subtitle: 'Motor noises to suction issues — fixed with a warranty.',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [contentVisible, setContentVisible] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const goTo = useCallback(
    (next: number) => {
      if (isTransitioning || next === current) return
      setIsTransitioning(true)
      setContentVisible(false)
      setTimeout(() => setCurrent(next), 300)
      setTimeout(() => {
        setContentVisible(true)
        setIsTransitioning(false)
      }, 450)
    },
    [isTransitioning, current]
  )

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length)
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo])

  // Touch handlers for swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) {
      next()
    } else if (isRightSwipe) {
      prev()
    }
  }

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section 
      className="relative w-full overflow-hidden bg-slate-900" 
      style={{ height: 'var(--hero-height)', minHeight: 'var(--hero-min-height)', maxHeight: 'var(--hero-max-height)' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* ── Backgrounds ── */}
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            index === current ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Very light overlay — just enough for text contrast */}
          <div className="absolute inset-0 z-10 bg-black/30" />
          {/* Left-side stronger tint for text area only */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-3/4 z-10 bg-gradient-to-r from-black/60 to-transparent" />
          {/* Bottom gradient for dots */}
          <div className="absolute bottom-0 inset-x-0 h-24 z-10 bg-gradient-to-t from-black/40 to-transparent" />

          <img
            src={slide.image}
            alt={slide.title}
            className={cn(
              'absolute inset-0 w-full h-full object-cover',
              'brightness-[1.35]',   /* noticeably brighter */
              'transition-transform duration-[9000ms] ease-out',
              index === current ? 'scale-[1.04]' : 'scale-100'
            )}
          />
        </div>
      ))}

      {/* ── Content ── */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="w-full px-6 sm:px-10 md:px-16 lg:px-24">
          <div
            className={cn(
              'max-w-[90vw] sm:max-w-md md:max-w-2xl',
              'transition-all duration-450 ease-out',
              contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            )}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1 text-[11px] sm:text-sm font-semibold text-white mb-3 sm:mb-4">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse block" />
              {SLIDES[current].badge}
            </div>

            {/* Title — short & punchy on mobile */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-white leading-[1.15] mb-2.5 sm:mb-4 drop-shadow-xl">
              {SLIDES[current].title}
            </h1>

            {/* Subtitle — visible from xs up */}
            <p className="text-xs sm:text-base md:text-lg text-white/80 leading-relaxed mb-5 sm:mb-7 max-w-xs sm:max-w-sm">
              {SLIDES[current].subtitle}
            </p>

            {/* CTA Buttons — always side by side */}
            <div className="flex flex-row gap-2 sm:gap-3">
              <Link
                href="/#services"
                className={buttonVariants({
                  size: 'sm',
                  className:
                    'rounded-full px-4 sm:px-7 h-9 sm:h-11 text-xs sm:text-base font-bold shadow-lg shadow-primary/40 hover:scale-105 transition-all duration-300 whitespace-nowrap',
                })}
              >
                Book a Service
              </Link>
              <Link
                href="tel:+919361564650"
                className="inline-flex items-center gap-1.5 h-9 sm:h-11 px-4 sm:px-6 rounded-full border border-white/35 bg-white/10 backdrop-blur-sm text-white font-semibold text-xs sm:text-base hover:bg-white/20 transition-all duration-300 whitespace-nowrap"
              >
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                Call Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows — mobile: bottom-left corner (away from WhatsApp) ── */}
      {/* Mobile arrows */}
      <div className="absolute bottom-6 left-6 z-30 flex gap-2 sm:hidden">
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="h-8 w-8 rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-sm flex items-center justify-center active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="h-8 w-8 rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-sm flex items-center justify-center active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop arrows: sides */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 hidden sm:flex justify-between px-4 md:px-6 pointer-events-none">
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="pointer-events-auto h-11 w-11 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="pointer-events-auto h-11 w-11 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* ── Dot indicators — centered bottom ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              idx === current
                ? 'w-7 bg-primary shadow-md shadow-primary/50'
                : 'w-1.5 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </section>
  )
}
