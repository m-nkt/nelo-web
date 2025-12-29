'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const TALLY_URL = 'https://tally.so/r/jabRR6'

const tags = [
  'Spanish conversation practice',
  'Learning English',
  'Movie lovers',
  'Work at a startup',
  'Anime & gaming fans'
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
      {/* Glassmorphism Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 z-0">
        {/* Animated gradient orbs for glassmorphism effect */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-8 py-4 md:py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-end">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={handleJoinWaitlist}
            className={twMerge(
              clsx(
                "bg-white/40 backdrop-blur-md border border-white/50 rounded-full",
                "px-6 py-3 text-gray-800 text-sm font-medium",
                "hover:bg-white/60 hover:shadow-lg transition-all",
                "shadow-sm"
              )
            )}
          >
            Join Waitlist
          </motion.button>
        </div>
      </motion.header>

      {/* Main Hero Section */}
      <main className="relative z-20 pt-32 md:pt-40 pb-20 flex items-center justify-center min-h-screen px-6 md:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl w-full text-center"
        >
          {/* Hero Title with Playfair Display */}
          <motion.h1
            variants={fadeInUp}
            className="font-serif text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-normal text-gray-900 mb-6 md:mb-8 leading-tight tracking-tight"
          >
            Text to Friend
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            variants={fadeInUp}
            className="mb-10 md:mb-12"
          >
            <p className="text-lg md:text-xl lg:text-2xl text-gray-700 font-light leading-relaxed">
              Make friends around the world. The easiest way to meet people you actually want to talk to.
            </p>
          </motion.div>

          {/* Input Form with Glassmorphism */}
          <motion.form
            variants={fadeInUp}
            onSubmit={handleSubmit}
            className="mb-6 md:mb-8"
          >
            <div className={twMerge(
              clsx(
                "relative flex items-center",
                "bg-white/40 backdrop-blur-md rounded-full",
                "border border-white/50 shadow-lg",
                "px-4 md:px-6 py-3 md:py-4",
                "transition-all",
                "focus-within:bg-white/50 focus-within:border-white/70 focus-within:shadow-xl"
              )
            )}>
              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Who would you like to talk to? e.g. Someone who speaks Spanish and loves movies."
                className="flex-1 bg-transparent border-none outline-none text-gray-800 text-base md:text-lg font-light placeholder:text-gray-500 pr-3 md:pr-4"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={twMerge(
                  clsx(
                    "bg-gray-900 text-white rounded-full",
                    "w-10 h-10 md:w-12 md:h-12",
                    "flex items-center justify-center",
                    "hover:bg-gray-800 hover:shadow-md transition-all",
                    "flex-shrink-0"
                  )
                )}
              >
                <ArrowRight size={20} strokeWidth={2} />
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
                    "bg-white/40 backdrop-blur-md border border-white/50",
                    "rounded-full px-4 md:px-6 py-2 md:py-3",
                    "text-gray-700 text-xs md:text-sm font-light",
                    "hover:bg-white/60 hover:text-gray-900",
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
    </div>
  )
}
