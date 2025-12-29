'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const TALLY_URL = 'https://tally.so/r/jabRR6'

const tags = [
  'English speakers',
  'Spanish speakers',
  'French speakers',
  'Japanese speakers',
  'Startup workers',
  'Remote workers',
  'Music lovers',
  'Game fans'
]

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
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
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])
  const backgroundOpacity = useTransform(scrollY, [300, 600], [1, 0])
  const whiteBackgroundOpacity = useTransform(scrollY, [300, 600], [0, 1])

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image with Parallax */}
            <motion.div
        className="fixed inset-0 z-0"
              style={{
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          y: backgroundY,
          opacity: backgroundOpacity,
        }}
      >
        {/* Animated gradient overlay */}
          <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10"
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
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 md:px-8 py-2.5 md:py-3">
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
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
            onClick={handleJoinWaitlist}
                      className={twMerge(
                        clsx(
                          "bg-black text-white rounded-lg",
                          "px-5 py-2.5 text-sm font-medium",
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
          <main className="relative z-20 pt-20 md:pt-28 pb-20 flex items-center justify-center min-h-screen px-6 md:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl w-full text-center"
        >
          {/* Hero Title with Playfair Display */}
          <motion.h1
            variants={fadeInUp}
            className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal text-white mb-8 md:mb-10 leading-tight tracking-tight whitespace-nowrap"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.1)' }}
          >
            New Friends, Everywhere.
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            variants={fadeInUp}
            className="mb-12 md:mb-16"
          >
            <p className="text-lg md:text-xl lg:text-2xl text-white font-light leading-tight max-w-2xl mx-auto font-sans">
              Make friends around the world.
              <br />
              The easiest way to meet people you actually want to talk to.
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
                    "relative flex items-center",
                    "bg-white rounded-full",
                    "border border-gray-200 shadow-xl",
                    "px-6 md:px-8 py-4 md:py-5",
                    "transition-all",
                    "focus-within:shadow-2xl"
                  )
                )}>
                  <div className="flex-1 relative flex items-center">
                    {!intent && (
                      <div className="absolute inset-0 flex flex-col justify-center items-start pointer-events-none">
                        <span className="text-gray-400 text-sm md:text-base font-light text-left opacity-70">Who would you like to talk to?</span>
                        <span className="text-gray-400 text-sm md:text-base font-light text-left opacity-70">e.g. Someone who speaks Spanish and loves movies.</span>
                      </div>
                    )}
              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                onKeyDown={handleKeyDown}
                      className="w-full bg-transparent border-none outline-none text-gray-400 text-sm md:text-base font-light pr-4 text-left opacity-70"
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
                    "self-end mb-0.5"
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
                    "bg-white/10 backdrop-blur-md border border-white/20",
                    "rounded-full px-4 md:px-6 py-2 md:py-3",
                    "text-white text-xs md:text-sm font-light",
                    "hover:bg-white/20 hover:text-white",
                    "transition-all whitespace-nowrap",
                    "shadow-sm"
                  )
                )}
              >
                {tag}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="relative z-20 py-20 md:py-32 px-6 md:px-8 overflow-hidden">
        {/* Background Image from Unsplash */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.1,
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.h2
              className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 font-normal"
              style={{
                color: useTransform(scrollY, [300, 600], ['rgb(255, 255, 255)', 'rgb(75, 85, 99)']),
              }}
            >
              What is Nelo?
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
            {[
              {
                title: 'Talk with language friends',
                description: 'Make friends who are learning and speaking the same language as you.',
                image: '/What_is_Nelo_01.jpg',
              },
              {
                title: 'Talk new friends just for fun',
                description: 'Music, games, anime, life.',
                subDescription: 'This is not a language class.\nJust real conversations around what you love.',
                image: '/What_is_Nelo_02.jpg',
              },
              {
                title: 'Voice only',
                description: 'No profiles. No personal info.',
                subDescription: 'Just a 15 minute conversation.',
                image: '/What_is_Nelo_03.jpg',
              },
              {
                title: 'No messages. Just talk.',
                description: 'A 15-minute conversation. Already scheduled.',
                subDescription: 'No messages, no coordination. Just talk.',
                image: '/What_is_Nelo_04.jpg',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                {/* Title */}
                <h3 className="font-modern text-xl md:text-2xl font-medium mb-6 text-gray-700 whitespace-pre-line tracking-tight">
                  {feature.title}
                </h3>
                
                {/* Graphic/Image - Taller */}
                <div className="mb-6 h-40 md:h-52 lg:h-64 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Description */}
                <p className="text-base text-gray-600 font-sans leading-relaxed whitespace-pre-line">
                  {feature.description}
                  {feature.subDescription && (
                    <>
                      <br />
                      {feature.subDescription}
                    </>
                  )}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-registration Section */}
      <section className="relative z-20 py-20 md:py-32 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.h2 
              className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 font-normal"
              style={{
                color: useTransform(scrollY, [300, 600], ['rgb(255, 255, 255)', 'rgb(75, 85, 99)']),
              }}
            >
              Join the Waitlist
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl font-light font-sans"
              style={{
                color: useTransform(scrollY, [300, 600], ['rgba(255, 255, 255, 0.9)', 'rgba(75, 85, 99, 1)']),
              }}
            >
              Be among the first to experience Nelo.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md mx-auto"
          >
            <motion.button
              onClick={handleJoinWaitlist}
              whileHover={{ 
                scale: 1.02,
                y: -2,
              }}
              whileTap={{ scale: 0.98 }}
              className={twMerge(
                clsx(
                  "w-full bg-black text-white rounded-full",
                  "px-8 py-4 text-base font-medium",
                  "hover:bg-gray-900 transition-all",
                  "shadow-xl relative overflow-hidden"
                )
              )}
            >
              <span className="relative z-10">
                Join Waitlist
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </motion.button>
            <motion.p 
              className="text-sm text-center mt-4 font-normal font-sans"
              style={{
                color: useTransform(scrollY, [300, 600], ['rgba(255, 255, 255, 0.7)', 'rgba(75, 85, 99, 1)']),
              }}
            >
              We'll email you when it's ready.
              <br />
              No spam. Just your invite.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer with Stylized Logo */}
      <footer className="relative z-20 py-20 md:py-32 px-6 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <h2 
              className="text-8xl md:text-9xl lg:text-[12rem] font-bold leading-none tracking-tight"
              style={{
                fontFamily: 'Playfair Display, serif',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              <span
                className="inline-block"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ne
              </span>
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 50%, #1E90FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                lo
              </span>
            </h2>
          </motion.div>
        </div>
      </footer>

      {/* Copyright - Bottom of page */}
      <div className="relative z-20 py-8 px-6 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-sm text-gray-500"
          >
            Copyright © 2025. Nelo. All rights reserved.
          </motion.p>
        </div>
      </div>
    </div>
  )
}
