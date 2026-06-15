'use client'

import React, { useEffect, useRef, useState, CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export type RevealAnimation =
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeIn'
  | 'slideInLeft'
  | 'slideInRight'
  | 'scaleUp'
  | 'blurIn'
  | 'flipIn'
  | 'zoomIn'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  animation?: RevealAnimation
  duration?: number   // seconds
  delay?: number      // seconds
  threshold?: number  // 0-1
  once?: boolean
  as?: React.ElementType
  easing?: string
}

/** Returns the "hidden" style for a given animation type */
function hiddenStyle(animation: RevealAnimation): CSSProperties {
  switch (animation) {
    case 'fadeInUp':
      return { opacity: 0, transform: 'translateY(40px)' }
    case 'fadeInDown':
      return { opacity: 0, transform: 'translateY(-40px)' }
    case 'fadeIn':
      return { opacity: 0 }
    case 'slideInLeft':
      return { opacity: 0, transform: 'translateX(-50px)' }
    case 'slideInRight':
      return { opacity: 0, transform: 'translateX(50px)' }
    case 'scaleUp':
      return { opacity: 0, transform: 'scale(0.82)' }
    case 'blurIn':
      return { opacity: 0, filter: 'blur(14px)', transform: 'scale(0.97)' }
    case 'flipIn':
      return { opacity: 0, transform: 'perspective(600px) rotateX(25deg) translateY(24px)' }
    case 'zoomIn':
      return { opacity: 0, transform: 'scale(0.6)' }
    default:
      return { opacity: 0 }
  }
}

/** Returns the "visible" style for a given animation type */
function visibleStyle(animation: RevealAnimation): CSSProperties {
  switch (animation) {
    case 'blurIn':
      return { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' }
    case 'flipIn':
      return { opacity: 1, transform: 'perspective(600px) rotateX(0deg) translateY(0px)' }
    default:
      return { opacity: 1, transform: 'none' }
  }
}

export function ScrollReveal({
  children,
  className,
  animation = 'fadeInUp',
  duration = 0.7,
  delay = 0,
  threshold = 0.12,
  once = true,
  as: Component = 'div',
  easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.unobserve(el)
  }, [threshold, once])

  const baseStyle: CSSProperties = {
    willChange: 'opacity, transform, filter',
    transition: `opacity ${duration}s ${easing} ${delay}s, transform ${duration}s ${easing} ${delay}s, filter ${duration}s ${easing} ${delay}s`,
  }

  const currentStyle: CSSProperties = {
    ...baseStyle,
    ...(isVisible ? visibleStyle(animation) : hiddenStyle(animation)),
  }

  return (
    <Component
      ref={ref}
      className={cn(className)}
      style={currentStyle}
    >
      {children}
    </Component>
  )
}
