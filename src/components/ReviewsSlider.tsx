'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const REVIEWS = [
  { name: "Priya Sharma", location: "Mumbai", text: "Excellent service! The technician was very professional and cleaned the chimney spotlessly. Highly recommend!", rating: 5 },
  { name: "Rahul Verma", location: "Delhi", text: "Very quick response and fair pricing. My chimney now works perfectly. Will definitely book again.", rating: 5 },
  { name: "Anita Patel", location: "Bangalore", text: "Great experience from booking to completion. Easy website and very reliable technicians.", rating: 5 },
]

export function ReviewsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToCard = (index: number) => {
    if (!containerRef.current) return
    const container = containerRef.current
    const cards = container.children
    if (cards && cards[index]) {
      const card = cards[index] as HTMLElement
      // Scroll to the card's relative offset inside the container
      const targetLeft = card.offsetLeft - container.offsetLeft - 16 // 16px offset for padding/centering
      container.scrollTo({
        left: targetLeft,
        behavior: 'smooth',
      })
      setCurrentIndex(index)
    }
  }

  const next = () => {
    const nextIndex = (currentIndex + 1) % REVIEWS.length
    scrollToCard(nextIndex)
  }

  const prev = () => {
    const prevIndex = (currentIndex - 1 + REVIEWS.length) % REVIEWS.length
    scrollToCard(prevIndex)
  }

  // Automatic roll (auto scroll)
  useEffect(() => {
    const timer = setInterval(() => {
      // Only auto scroll on mobile (when container width is small/has scrollable content)
      if (containerRef.current && containerRef.current.scrollWidth > containerRef.current.clientWidth) {
        const nextIndex = (currentIndex + 1) % REVIEWS.length
        scrollToCard(nextIndex)
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [currentIndex])

  // Track scroll position to update dots/arrows active state when user manually swipes
  const handleScroll = () => {
    if (!containerRef.current) return
    const container = containerRef.current
    const scrollLeft = container.scrollLeft
    const scrollWidth = container.scrollWidth - container.clientWidth
    if (scrollWidth <= 0) return

    // Find which card is closest to the left edge of the container
    const children = Array.from(container.children) as HTMLElement[]
    let closestIndex = 0
    let minDiff = Infinity

    children.forEach((child, idx) => {
      const diff = Math.abs(child.offsetLeft - container.offsetLeft - scrollLeft - 16)
      if (diff < minDiff) {
        minDiff = diff
        closestIndex = idx
      }
    })

    if (closestIndex !== currentIndex && closestIndex >= 0 && closestIndex < REVIEWS.length) {
      setCurrentIndex(closestIndex)
    }
  }

  return (
    <div className="relative w-full">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex flex-row overflow-x-auto snap-x snap-mandatory flex-nowrap md:grid md:grid-cols-3 gap-6 pb-4 scrollbar-none px-4 sm:px-0"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {REVIEWS.map((review, i) => (
          <ScrollReveal
            key={i}
            animation="scaleUp"
            delay={i * 0.1}
            duration={0.6}
            className="h-full w-[85vw] sm:w-[350px] shrink-0 snap-center md:w-auto md:shrink md:snap-align-none"
          >
            <div className="bg-white border border-slate-200/80 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">&quot;{review.text}&quot;</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{review.name}</div>
                  <div className="text-xs text-slate-400">{review.location}</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Small arrows and dots for manual nav — mobile only */}
      <div className="flex md:hidden items-center justify-center gap-4 mt-6">
        <button
          onClick={prev}
          aria-label="Previous review"
          className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center shadow-sm active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToCard(idx)}
              aria-label={`Go to review ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-5 bg-primary' : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next review"
          className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center shadow-sm active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
