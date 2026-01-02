'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const features = [
  {
    title: 'Talk language partners,\nnot strangers.',
    description: 'Meet people who are serious about building a real language partnership. Learn together, or exchange languages with native speakers.',
    image: '/What_is_Nelo_01.jpg',
  },
  {
    title: 'Talk with people who share your interests.',
    description: 'Music, games, anime, life.',
    subDescription: 'This is not a language class.\nJust real conversations around what you love.',
    image: '/What_is_Nelo_02.jpg',
  },
  {
    title: 'We schedule it for you.',
    description: 'No ghosting. No endless chatting.',
    subDescription: 'We match you and book the conversation.',
    image: '/What_is_Nelo_03.jpg',
  },
  {
    title: 'Your connections don\'t fade.',
    description: 'Reconnect with people you enjoyed talking to.',
    subDescription: 'Turn one good conversation into something ongoing.',
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

