import * as React from "react"

// Enhanced breakpoints for better mobile detection
const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isTablet, setIsTablet] = React.useState<boolean>(false)
  const [isLandscape, setIsLandscape] = React.useState<boolean>(false)
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Mobile: < 768px, Tablet: 768px - 1024px
      const mobile = width < BREAKPOINTS.md
      const tablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg
      const landscape = width > height
      
      setIsMobile(mobile)
      setIsTablet(tablet)
      setIsLandscape(landscape)
    }

    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    // Initial check
    checkDevice()
    checkTouchDevice()

    // Event listeners
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    const handleResize = () => checkDevice()
    const handleOrientationChange = () => checkDevice()

    mql.addEventListener("change", handleResize)
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      mql.removeEventListener("change", handleResize)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return {
    isMobile: !!isMobile,
    isTablet,
    isLandscape,
    isTouchDevice,
    breakpoint: Object.entries(BREAKPOINTS).find(([, width]) => window.innerWidth < width)?.[0] || '2xl'
  }
}

// Hook for specific breakpoint checks
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS) {
  const [isAbove, setIsAbove] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkBreakpoint = () => {
      setIsAbove(window.innerWidth >= BREAKPOINTS[breakpoint])
    }

    checkBreakpoint()
    window.addEventListener('resize', checkBreakpoint)
    
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [breakpoint])

  return isAbove
}
