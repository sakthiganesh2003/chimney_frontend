'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const SLIDES = [
  {
    image: '/hero-1.jpg',
    title: 'Professional Chimney Services at Your Doorstep.',
    subtitle: 'Expert installation and maintenance ensuring a smoke-free, pristine kitchen environment.',
  },
  {
    image: '/hero-2.jpg',
    title: 'Deep Cleaning & Restoration.',
    subtitle: 'We remove stubborn grease and soot to bring your chimney back to peak performance.',
  },
  {
    image: '/hero-3.jpg',
    title: 'Reliable Repair Services.',
    subtitle: 'From motor noises to suction issues, our technicians fix it all with a warranty.',
  }
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-[95vh] min-h-[680px] w-full overflow-hidden bg-slate-950 flex items-center">
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === current ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-[10000ms] ease-out scale-105"
            style={{ transform: index === current ? 'scale(1)' : 'scale(1.05)' }}
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">
            <div 
              className={cn(
                "max-w-4xl mx-auto transition-all duration-1000 delay-300 transform",
                index === current ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              )}
            >
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-white mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Top Rated Service in Town
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-xl text-balance">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto text-balance drop-shadow-md">
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/#services" className={buttonVariants({ size: "lg", className: "text-base h-14 px-8 shadow-xl" })}>
                  Book a Service
                </Link>
                <Link href="#services" className={buttonVariants({ size: "lg", variant: "outline", className: "text-base h-14 px-8 bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white backdrop-blur-sm" })}>
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation Arrows */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-between px-4 md:px-8 pointer-events-none">
        <button 
          onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
          className="pointer-events-auto h-12 w-12 rounded-full bg-black/20 hover:bg-black/50 border border-white/10 text-white backdrop-blur-md flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
          className="pointer-events-auto h-12 w-12 rounded-full bg-black/20 hover:bg-black/50 border border-white/10 text-white backdrop-blur-md flex items-center justify-center transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              idx === current ? "w-8 bg-primary" : "w-2 bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </section>
  )
}
