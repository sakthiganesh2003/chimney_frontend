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
    title: 'Professional Chimney Services at Your Doorstep.',
    subtitle: 'Expert installation and maintenance ensuring a smoke-free, pristine kitchen environment.',
  },
  {
    image: '/hero2.jpg',
    badge: 'Deep Cleaning Experts',
    title: 'Deep Cleaning & Restoration.',
    subtitle: 'We remove stubborn grease and soot to bring your chimney back to peak performance.',
  },
  {
    image: '/hero3.jpg',
    badge: 'Certified Technicians',
    title: 'Reliable Repair Services.',
    subtitle: 'From motor noises to suction issues, our technicians fix it all with a warranty.',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [contentVisible, setContentVisible] = useState(true)

  const goTo = useCallback(
    (next: number) => {
      if (isTransitioning || next === current) return
      setIsTransitioning(true)
      setContentVisible(false)

      setTimeout(() => {
        setCurrent(next)
      }, 350)

      setTimeout(() => {
        setContentVisible(true)
        setIsTransitioning(false)
      }, 500)
    },
    [isTransitioning, current]
  )

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length)
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-slate-950">
      {/* ── Slide backgrounds ── */}
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          aria-hidden={index !== current}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-in-out',
            index === current ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Gradient overlay — strong on left for text, fades right */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-800/10" />
          {/* Extra bottom gradient so dots are readable */}
          <div className="absolute inset-x-0 bottom-0 h-32 z-10 bg-gradient-to-t from-slate-950/60 to-transparent" />

          <img
            src={slide.image}
            alt={slide.title}
            className={cn(
              'absolute inset-0 w-full h-full object-cover brightness-110 transition-transform duration-[9000ms] ease-out',
              index === current ? 'scale-105' : 'scale-100'
            )}
          />
        </div>
      ))}

      {/* ── Slide content ── */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="w-full px-5 sm:px-10 md:px-16 lg:px-24">
          <div
            className={cn(
              'max-w-xl md:max-w-2xl transition-all duration-500 ease-out',
              contentVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            )}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs sm:text-sm font-semibold text-white mb-5">
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-primary animate-pulse" />
              {SLIDES[current].badge}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-white leading-[1.12] mb-4 drop-shadow-lg">
              {SLIDES[current].title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-white/75 leading-relaxed mb-8 max-w-lg">
              {SLIDES[current].subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/#services"
                className={buttonVariants({
                  size: 'lg',
                  className:
                    'rounded-full px-7 py-3 text-sm sm:text-base font-bold shadow-xl shadow-primary/30 hover:scale-105 hover:shadow-primary/50 transition-all duration-300',
                })}
              >
                Book a Service
              </Link>
              <Link
                href="tel:+919361564650"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white font-semibold text-sm sm:text-base hover:bg-white/20 transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Arrows ── */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-between px-3 sm:px-5 pointer-events-none">
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="pointer-events-auto h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="pointer-events-auto h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              idx === current
                ? 'w-8 bg-primary shadow-md shadow-primary/40'
                : 'w-2 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </section>
  )
}
