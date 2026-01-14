import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SVGProps,
} from "react"
import { AnimatePresence, motion } from "framer-motion"

export interface Logo {
  name: string
  id: number
  img: React.ComponentType<React.SVGProps<SVGSVGElement>> | string
}

interface LogoColumnProps {
  logos: Logo[]
  index: number
  currentTime: number
}

const LogoColumn: React.FC<LogoColumnProps> = React.memo(
  ({ logos, index, currentTime }) => {
    const cycleInterval = 2500 
    // Increase stagger to make it look more dynamic and less synced
    const columnDelay = index * 800 
    const adjustedTime = currentTime + columnDelay
    
    // Logic to ensure uniqueness across columns at any given moment:
    // We base the logo index on time, but shift it by 'index' (column number).
    // This assumes logos.length >= columnCount for perfect uniqueness.
    
    // Calculate which cycle we are in for this column
    const cycleCount = Math.floor(adjustedTime / cycleInterval)
    
    // The base index depends on the cycle count + the column index
    const logoIndex = (cycleCount + index) % logos.length

    const CurrentLogo = useMemo(() => logos[logoIndex].img, [logos, logoIndex])

    return (
      <motion.div
        className="relative h-24 w-40 overflow-hidden md:h-40 md:w-80"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.1,
          duration: 0.5,
          ease: "easeOut",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${logos[logoIndex].id}-${logoIndex}`}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: "10%", opacity: 0, filter: "blur(8px)" }}
            animate={{
              y: "0%",
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 1,
                bounce: 0.2,
                duration: 0.5,
              },
            }}
            exit={{
              y: "-20%",
              opacity: 0,
              filter: "blur(6px)",
              transition: {
                type: "tween",
                ease: "easeIn",
                duration: 0.3,
              },
            }}
          >
            {typeof CurrentLogo === 'string' ? (
               <img 
                 src={CurrentLogo} 
                 alt={logos[logoIndex].name}
                 className="h-32 w-32 max-h-[90%] max-w-[90%] object-contain md:h-52 md:w-52"
               />
            ) : (
               <CurrentLogo className="h-32 w-32 max-h-[90%] max-w-[90%] object-contain md:h-52 md:w-52" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }
)

interface LogoCarouselProps {
  columnCount?: number
  logos: Logo[]
}

export function LogoCarousel({ columnCount = 2, logos }: LogoCarouselProps) {
  const [currentTime, setCurrentTime] = useState(0)

  const updateTime = useCallback(() => {
    setCurrentTime((prevTime) => prevTime + 100)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(updateTime, 100)
    return () => clearInterval(intervalId)
  }, [updateTime])

  return (
    <div className="flex space-x-4 justify-center">
      {Array.from({ length: columnCount }).map((_, index) => (
        <LogoColumn
          key={index}
          logos={logos}
          index={index}
          currentTime={currentTime}
        />
      ))}
    </div>
  )
}
