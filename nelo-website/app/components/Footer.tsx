'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <div>
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

