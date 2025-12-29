'use client'

import { motion, useScroll, useTransform } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
}

export default function Page2() {
  const { scrollY } = useScroll()
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const whiteBackgroundOpacity = useTransform(scrollY, [0, 300], [0, 1])

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
          opacity: backgroundOpacity,
        }}
      >
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

      {/* Main Content */}
      <main className="relative z-20 pt-32 md:pt-40 pb-20 min-h-screen px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 md:mb-24"
          >
            <motion.h1 
              className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6"
              style={{
                color: useTransform(scrollY, [0, 300], ['rgb(255, 255, 255)', 'rgb(17, 24, 39)']),
              }}
            >
              What you'll find on Nelo
            </motion.h1>
          </motion.div>

          {/* Features Grid */}
          <div className="space-y-16 md:space-y-24">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <motion.h2 
                className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6"
                style={{
                  color: useTransform(scrollY, [0, 300], ['rgb(255, 255, 255)', 'rgb(17, 24, 39)']),
                }}
              >
                Meet new language friends
              </motion.h2>
              <div className="space-y-4">
                <motion.p 
                  className="text-xl md:text-2xl font-light leading-relaxed"
                  style={{
                    color: useTransform(scrollY, [0, 300], ['rgba(255, 255, 255, 0.9)', 'rgba(55, 65, 81, 1)']),
                  }}
                >
                  Make friends who are learning and speaking the same language as you.
                </motion.p>
                <motion.p 
                  className="text-lg md:text-xl font-light"
                  style={{
                    color: useTransform(scrollY, [0, 300], ['rgba(255, 255, 255, 0.7)', 'rgba(107, 114, 128, 1)']),
                  }}
                >
                  Not lessons. Not tutors. Real people.
                </motion.p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <motion.h2 
                className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6"
                style={{
                  color: useTransform(scrollY, [0, 300], ['rgb(255, 255, 255)', 'rgb(17, 24, 39)']),
                }}
              >
                Friends who share your interests
              </motion.h2>
              <div className="space-y-4">
                <motion.p 
                  className="text-xl md:text-2xl font-light leading-relaxed"
                  style={{
                    color: useTransform(scrollY, [0, 300], ['rgba(255, 255, 255, 0.9)', 'rgba(55, 65, 81, 1)']),
                  }}
                >
                  Games, anime, startups, life.
                </motion.p>
                <motion.p 
                  className="text-lg md:text-xl font-light"
                  style={{
                    color: useTransform(scrollY, [0, 300], ['rgba(255, 255, 255, 0.9)', 'rgba(55, 65, 81, 1)']),
                  }}
                >
                  Meet people who love the same things as you around the world.
                </motion.p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <motion.h2 
                className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6"
                style={{
                  color: useTransform(scrollY, [0, 300], ['rgb(255, 255, 255)', 'rgb(17, 24, 39)']),
                }}
              >
                No DMs. Set for you.
              </motion.h2>
              <div className="space-y-4">
                <motion.p 
                  className="text-xl md:text-2xl font-light leading-relaxed"
                  style={{
                    color: useTransform(scrollY, [0, 300], ['rgba(255, 255, 255, 0.9)', 'rgba(55, 65, 81, 1)']),
                  }}
                >
                  A 15 minute conversation, already scheduled.
                </motion.p>
                <motion.p 
                  className="text-lg md:text-xl font-light"
                  style={{
                    color: useTransform(scrollY, [0, 300], ['rgba(255, 255, 255, 0.9)', 'rgba(55, 65, 81, 1)']),
                  }}
                >
                  Just show up and talk.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

