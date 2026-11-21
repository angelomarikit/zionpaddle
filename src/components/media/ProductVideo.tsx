import { useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'

type Props = {
  poster: string
  videoSrc?: string
  alt: string
  className?: string
  playOnHover?: boolean
  autoPlayLoop?: boolean
  children?: ReactNode
  /** `cover` fills the frame (cards, hero); `contain` keeps full product visible */
  mediaFit?: 'contain' | 'cover'
  /** Hero: preload video for instant loop */
  eager?: boolean
}

export function ProductVideo({
  poster,
  videoSrc,
  alt,
  className = '',
  playOnHover = false,
  autoPlayLoop = false,
  children,
  mediaFit = 'contain',
  eager = false,
}: Props) {
  const fitClass = mediaFit === 'cover' ? 'object-cover' : 'object-contain'
  const reduce = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [usePosterOnly, setUsePosterOnly] = useState(false)
  const showVideo = Boolean(videoSrc) && !usePosterOnly && !reduce

  const play = () => {
    if (!showVideo || !videoRef.current) return
    void videoRef.current.play().catch(() => setUsePosterOnly(true))
  }

  const pause = () => {
    videoRef.current?.pause()
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={playOnHover ? play : undefined}
      onMouseLeave={playOnHover ? pause : undefined}
      onFocus={playOnHover ? play : undefined}
      onBlur={playOnHover ? pause : undefined}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          className={`size-full ${fitClass}`}
          poster={poster}
          muted
          playsInline
          loop
          preload={eager || autoPlayLoop ? 'auto' : playOnHover ? 'metadata' : 'none'}
          autoPlay={autoPlayLoop}
          onError={() => setUsePosterOnly(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <img src={poster} alt={alt} className={`size-full ${fitClass}`} loading="lazy" decoding="async" />
      )}
      {children}
    </div>
  )
}