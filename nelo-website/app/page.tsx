'use client'

import { useState, useMemo } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// 動的インポートで遅延読み込み
const FeaturesSection = dynamic(() => import('./components/FeaturesSection'), {
  ssr: true,
  loading: () => <div className="h-96 bg-gray-50" />,
})

const WaitlistSection = dynamic(() => import('./components/WaitlistSection'), {
  ssr: true,
  loading: () => <div className="h-96" />,
})

const Footer = dynamic(() => import('./components/Footer'), {
  ssr: true,
})

const TALLY_URL = 'https://tally.so/r/jabRR6'

// 背景画像の黒オーバーレイの濃さ（0 = なし、1 = 真っ黒）
const BACKGROUND_OVERLAY_OPACITY = 0.05

// ヘッダー・タグのぼかし強さ（0 = なし、4 = 弱め、12 = 中、24 = 強め）
const BACKDROP_BLUR_PX = 4

const tags = [
  'Friends',
  'Dating',
  'International friends',
  'English speakers',
  'Spanish speakers',
  'Japanese speakers',
  'man',
  'woman',
  'Music lovers',
  'Game fans',
  'Entrepreneurs',
  'NYC',
  'SF',
  'London',
  'Paris',
  'Tokyo',
]

// ヒーローセクション用の高速アニメーション（LCP改善のため）
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
}
 

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  const [intent, setIntent] = useState('')
  const { scrollY } = useScroll()
  
  // スクロールアニメーションの最適化
  const backgroundY = useTransform(scrollY, [0, 800], [0, 75])
  const backgroundOpacity = useTransform(scrollY, [400, 800], [1, 0])
  const whiteBackgroundOpacity = useTransform(scrollY, [400, 800], [0, 1])

  const handleTagClick = (tag: string) => {
    if (intent.trim()) {
      setIntent(prev => prev + ', ' + tag)
    } else {
      setIntent(tag)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalIntent = intent.trim() || 'General Interest'
    const url = `${TALLY_URL}?intent=${encodeURIComponent(finalIntent)}`
    window.open(url, '_blank')
  }

  const handleJoinWaitlist = () => {
    const url = `${TALLY_URL}?intent=${encodeURIComponent('General Interest')}`
    window.open(url, '_blank')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const finalIntent = intent.trim() || 'General Interest'
      const url = `${TALLY_URL}?intent=${encodeURIComponent(finalIntent)}`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image with Parallax - Mobile */}
            <motion.div
        className="fixed inset-0 z-0 md:hidden"
              style={{
          y: backgroundY,
          opacity: backgroundOpacity,
              }}
              transition={{
          type: "tween",
          ease: [0.25, 0.1, 0.25, 1],
          duration: 0.3
        }}
      >
        <div className="absolute inset-0">
          <Image
            src="/background_hero.png"
            alt="Background"
            fill
            priority
            className="object-cover object-center-top"
            sizes="100vw"
            quality={85}
          />
        </div>
        {/* 黒半透明オーバーレイ（BACKGROUND_OVERLAY_OPACITYで調整） */}
        <div
          className="absolute inset-0 z-[5]"
          style={{ backgroundColor: `rgba(0, 0, 0, ${BACKGROUND_OVERLAY_OPACITY})` }}
        />
        {/* Animated gradient overlay */}
          <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10 z-10"
            animate={{
            opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
      </motion.div>

      {/* Background Image with Parallax - Desktop */}
          <motion.div
        className="hidden md:block fixed inset-0 z-0"
        style={{
          y: backgroundY,
          opacity: backgroundOpacity,
            }}
            transition={{
          type: "tween",
          ease: [0.25, 0.1, 0.25, 1],
          duration: 0.3
        }}
      >
        <div className="absolute inset-0">
          <Image
            src="/background_hero.png"
            alt="Background"
            fill
            priority
            className="object-cover object-center-top"
            sizes="100vw"
            quality={85}
          />
        </div>
        {/* 黒半透明オーバーレイ（BACKGROUND_OVERLAY_OPACITYで調整） */}
        <div
          className="absolute inset-0 z-[5]"
          style={{ backgroundColor: `rgba(0, 0, 0, ${BACKGROUND_OVERLAY_OPACITY})` }}
        />
        {/* Animated gradient overlay */}
          <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10 z-10"
            animate={{
            opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
      </motion.div>

      {/* White background that appears on scroll */}
          <motion.div
        className="fixed inset-0 z-0 bg-white"
        style={{
          opacity: whiteBackgroundOpacity,
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 pt-4 md:pt-6"
      >
        <div className="w-[70%] mx-auto px-6 md:px-8">
          {/* Glassmorphism background for header - only covers content area */}
          <div
            className="bg-white/10 border border-white/20 rounded-full px-6 md:px-8 py-2.5 md:py-3"
            style={BACKDROP_BLUR_PX > 0 ? { backdropFilter: `blur(${BACKDROP_BLUR_PX}px)`, WebkitBackdropFilter: `blur(${BACKDROP_BLUR_PX}px)` } : undefined}
          >
            <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
                className="font-serif text-2xl md:text-3xl text-white font-normal italic"
                style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 400 }}
          >
                nelo
          </motion.div>

          {/* Navigation */}
          <nav className="flex items-center gap-4 md:gap-6 lg:gap-8">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
            onClick={handleJoinWaitlist}
                      className={twMerge(
                        clsx(
                          "bg-black text-white rounded-lg",
                          "px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-medium",
                          "hover:bg-gray-900 transition-all",
                          "shadow-sm"
                        )
                      )}
          >
            Join Waitlist
          </motion.button>
                  </nav>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Hero Section */}
          <main className="relative z-20 pt-80 md:pt-48 pb-20 flex items-center justify-center min-h-screen px-6 md:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl w-full text-center"
        >
          {/* Hero Title with Playfair Display */}
          <motion.h1
            variants={fadeInUp}
            className="font-serif text-7xl sm:text-5xl md:text-[5rem] lg:text-[6rem] xl:text-[7rem] font-normal text-white mb-6 leading-[0.95] md:leading-tight tracking-tighter md:tracking-[-0.05em]"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.1)' }}
          >
            <span className="md:hidden">
              Nelo sets you up
            </span>
            <span className="hidden md:inline">
              Nelo sets you up
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            variants={fadeInUp}
            className="mb-6 md:mb-16"
          >
            <p className="text-[15px] sm:text-base md:text-lg lg:text-xl text-white font-light leading-tight max-w-2xl mx-auto font-sans tracking-tight">
              <span className="md:hidden">
                Your personalized AI matchmaker<br />
                for <span className="font-semibold">friends</span> and <span className="font-semibold">dates</span> that actually fit.
              </span>
              <span className="hidden md:inline">
                Your personalized AI matchmaker<br />
                for <span className="font-semibold">friends</span> and <span className="font-semibold">dates</span> that actually fit.
              </span>
            </p>
          </motion.div>

          {/* Input Form with Glassmorphism */}
          <motion.form
            variants={fadeInUp}
            onSubmit={handleSubmit}
            className="mb-6 md:mb-8 max-w-4xl mx-auto"
          >
                <div className={twMerge(
                  clsx(
                    "relative flex items-start",
                    "bg-white rounded-[12px]",
                    "border border-gray-200 shadow-xl",
                    "px-4 py-3 md:px-8 md:py-5",
                    "transition-all",
                    "focus-within:shadow-2xl"
                  )
                )}>
                  <div className="flex-1 relative flex items-start min-h-[4rem] md:min-h-[3rem] bg-white rounded-lg py-2 md:py-0">
                    {!intent && (
                      <div className="absolute inset-0 flex flex-col justify-center items-start pointer-events-none px-0 pt-2 md:pt-0">
                        <span className="text-gray-400 text-sm md:text-base font-light text-left opacity-70 pl-0">Who would you like to talk to?</span>
                        <span className="text-gray-400 text-sm md:text-base font-light text-left opacity-70 pl-0">e.g. Someone who speaks Spanish and loves movies.</span>
                      </div>
                    )}
              <textarea
                value={intent}
                onChange={(e) => {
                  setIntent(e.target.value)
                  // 自動高さ調整
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 192)}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    const form = e.currentTarget.closest('form')
                    if (form) {
                      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent
                      handleSubmit(formEvent)
                    }
                  }
                }}
                onFocus={() => {
                  // モバイルでのフォーカス時に確実にプレースホルダーを非表示
                }}
                placeholder=""
                rows={1}
                className="w-full bg-white border-none outline-none text-gray-800 text-sm md:text-base font-light pr-3 md:pr-4 pl-0 text-left resize-none overflow-hidden min-h-[4rem] md:min-h-[3rem] leading-relaxed pt-2 md:pt-0"
                style={{
                  minHeight: '4rem',
                  maxHeight: '12rem',
                }}
              />
                  </div>
              {/* Single circular button with arrow up */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={twMerge(
                  clsx(
                    "bg-black text-white rounded-full",
                    "w-6 h-6 md:w-7 md:h-7",
                    "flex items-center justify-center",
                    "hover:bg-gray-900 transition-all",
                    "flex-shrink-0 shadow-lg",
                    "absolute bottom-3 md:bottom-5 right-3 md:right-5",
                    "z-10"
                  )
                )}
              >
                <ArrowUp size={12} strokeWidth={2.5} className="text-white md:w-3.5 md:h-3.5" />
              </motion.button>
            </div>
          </motion.form>

          {/* Tag Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3"
          >
            {tags.map((tag, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTagClick(tag)}
                className={twMerge(
                  clsx(
                    "bg-white/10 border border-white/20",
                    "rounded-full px-4 md:px-6 py-2 md:py-3",
                    "text-white text-xs md:text-sm font-light",
                    "hover:bg-white/20 hover:text-white",
                    "transition-all whitespace-nowrap",
                    "shadow-sm"
                  )
                )}
                style={BACKDROP_BLUR_PX > 0 ? { backdropFilter: `blur(${BACKDROP_BLUR_PX}px)`, WebkitBackdropFilter: `blur(${BACKDROP_BLUR_PX}px)` } : undefined}
              >
                {tag}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Features Section - 動的インポートで遅延読み込み */}
      <FeaturesSection />

      {/* Pre-registration Section - 動的インポートで遅延読み込み */}
      <WaitlistSection />

      {/* Footer - 動的インポートで遅延読み込み */}
      <Footer />
    </div>
  )
}
