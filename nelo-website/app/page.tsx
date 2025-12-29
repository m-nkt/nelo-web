'use client'

import { useState } from 'react'
import { MoveUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

const TALLY_URL = 'https://tally.so/r/jabRR6'

const topics = [
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

  const handleTopicClick = (topic: string) => {
    if (intent.trim()) {
      setIntent(prev => prev + ', ' + topic)
    } else {
      setIntent(topic)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalIntent = intent.trim() || 'General Interest'
    const url = `${TALLY_URL}?intent=${encodeURIComponent(finalIntent)}`
    window.open(url, '_blank')
  }

  const handleJoinWaitlist = () => {
    const url = `${TALLY_URL}?intent=General%20Interest`
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
      {/* Abstract Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#a8d5ba] via-[#9bc4b0] to-[#8ba99f]">
        {/* Abstract blur shapes for depth */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/8 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-8 py-4 md:py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/30 backdrop-blur-[20px] rounded-full px-4 md:px-6 py-2 border border-white/50"
          >
            <span className="font-serif text-lg md:text-xl text-white/95 tracking-wide">nelo</span>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              href="#pricing"
              className="text-white/90 text-sm font-light bg-white/10 backdrop-blur-[10px] px-4 py-2 rounded-full hover:bg-white/20 hover:text-white transition-colors"
            >
              Pricing
            </motion.a>
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              href="#docs"
              className="text-white/90 text-sm font-light bg-white/10 backdrop-blur-[10px] px-4 py-2 rounded-full hover:bg-white/20 hover:text-white transition-colors"
            >
              Docs
            </motion.a>
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              href="#blog"
              className="text-white/90 text-sm font-light bg-white/10 backdrop-blur-[10px] px-4 py-2 rounded-full hover:bg-white/20 hover:text-white transition-colors"
            >
              Blog
            </motion.a>
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              href="#careers"
              className="text-white/90 text-sm font-light bg-white/10 backdrop-blur-[10px] px-4 py-2 rounded-full hover:bg-white/20 hover:text-white transition-colors"
            >
              Careers
            </motion.a>
          </nav>

          {/* Join Waitlist Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            onClick={handleJoinWaitlist}
            className="bg-white/90 backdrop-blur-[20px] border border-white/50 rounded-full px-4 md:px-6 py-2 md:py-3 text-gray-800 text-sm font-medium hover:bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all whitespace-nowrap"
          >
            Join Waitlist
          </motion.button>
        </div>
      </motion.header>

      {/* Main Hero Section */}
      <main className="relative z-10 pt-28 md:pt-32 pb-20 flex items-center justify-center min-h-screen px-6 md:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl w-full text-center"
        >
          {/* Hero Title */}
          <motion.h1
            variants={fadeInUp}
            className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal text-white/98 mb-6 md:mb-8 leading-tight tracking-tight"
          >
            Text to Friend
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            variants={fadeInUp}
            className="mb-10 md:mb-12 space-y-2"
          >
            <p className="text-lg md:text-xl lg:text-2xl text-white/95 font-light leading-relaxed">
              Make friends around the world.
            </p>
            <p className="text-lg md:text-xl lg:text-2xl text-white/95 font-light leading-relaxed">
              The easiest way to meet people you actually want to talk to.
            </p>
          </motion.div>

          {/* Input Form */}
          <motion.form
            variants={fadeInUp}
            onSubmit={handleSubmit}
            className="mb-6 md:mb-8"
          >
            <div className="relative flex items-center bg-white/30 backdrop-blur-[20px] rounded-full border border-white/50 px-4 md:px-6 py-3 md:py-4 transition-all focus-within:bg-white/40 focus-within:border-white/70 focus-within:shadow-lg">
              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Who would you like to talk to? e.g. Someone who speaks Spanish and loves movies."
                className="flex-1 bg-transparent border-none outline-none text-white/95 text-base md:text-lg font-light placeholder:text-white/60 pr-3 md:pr-4"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/90 backdrop-blur-[10px] border-none rounded-full w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-gray-800 hover:bg-white hover:shadow-md transition-all flex-shrink-0"
              >
                <MoveUpRight size={18} strokeWidth={2} className="md:w-5 md:h-5" />
              </motion.button>
            </div>
          </motion.form>

          {/* Topic Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3"
          >
            {topics.map((topic, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTopicClick(topic)}
                className="bg-white/30 backdrop-blur-[20px] border border-white/50 rounded-full px-4 md:px-6 py-2 md:py-3 text-white/90 text-xs md:text-sm font-light hover:bg-white/40 hover:text-white transition-all whitespace-nowrap"
              >
                {topic}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
