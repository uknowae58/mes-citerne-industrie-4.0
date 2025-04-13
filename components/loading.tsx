'use client'

import Lottie from 'lottie-react'
import loadingAnimation from '@/public/loading-animation.json' // Adjust this path based on your file location

interface LoadingProps {
  size?: number
  loop?: boolean
  autoplay?: boolean
  title?: string
  subtitle?: string
}

export default function Loading({ 
  size = 200, 
  loop = true, 
  autoplay = true,
  title = "Chargement en cours...",
  subtitle = "Nous préparons vos données, merci de patienter"
}: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold ">{title}</h2>
        <p className="">{subtitle}</p>
      </div>
      <div className="flex items-center justify-center">
        <Lottie
          animationData={loadingAnimation}
          loop={loop}
          autoplay={autoplay}
          style={{ width: size, height: size }}
        />
      </div>
    </div>
  )
}

