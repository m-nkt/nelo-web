'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const TALLY_URL = 'https://tally.so/r/jabRR6'

export default function WaitlistSection() {
  const { scrollY } = useScroll()
  
  const handleJoinWaitlist = () => {
    const url = `${TALLY_URL}?intent=${encodeURIComponent('General Interest')}`
    window.open(url, '_blank')
  }

  return (
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
  )
}

