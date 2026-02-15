'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const features = [
  {
    title: 'We filter for what you really want.',
    description: 'Friendship. Dating. Language exchange. It\'s up to you. Tell us what kind of connection you\'re looking for, and who you\'d actually enjoy talking to.',
    image: '/What_is_Nelo_01.jpg',
  },
  {
    title: 'We introduce people who truly fit you.',
    description: 'The more we learn about you, the better the match. We don\'t introduce people with bad reputations. You choose how many introductions you want each week.',
    image: '/What_is_Nelo_02.jpg',
  },
  {
    title: 'No swiping. No DMs. Just show up.',
    description: 'No endless chatting. No ghosting. We match and schedule for you. All you have to do is talk.',
    image: '/What_is_Nelo_03.jpg',
  },
  {
    title: 'Designed for relationships that last.',
    description: 'Reconnect with people you enjoyed talking to. Built to support regular conversations and easy reconnects, so relationships don\'t fade.',
    image: '/What_is_Nelo_04.jpg',
  },
]

export default function FeaturesSection() {
  return (
    <section className="relative z-20 py-20 md:py-32 px-6 md:px-8 overflow-hidden bg-gray-50">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2
            className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 font-normal text-gray-700"
          >
            What is Nelo?
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="font-modern text-xl md:text-2xl font-medium mb-6 text-gray-700 whitespace-pre-line tracking-tight">
                {feature.title}
              </h3>
              
              <div className="mb-6 h-40 md:h-52 lg:h-64 rounded-lg overflow-hidden bg-gray-50 relative">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={85}
                  unoptimized
                />
              </div>
              
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
  )
}

