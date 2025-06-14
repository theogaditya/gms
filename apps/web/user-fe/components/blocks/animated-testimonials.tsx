"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Quote, Star } from "lucide-react"
import { motion, useAnimation, useInView, easeOut, easeInOut } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export interface Testimonial {
  id: number
  name: string
  role: string 
  panchayat: string
  content: string
  rating: number
  avatar: string
}

export interface AnimatedTestimonialsProps {
  title?: string
  subtitle?: string
  badgeText?: string
  testimonials?: Testimonial[]
  autoRotateInterval?: number
  trustedCompanies?: string[]
  trustedCompaniesTitle?: string
  className?: string
}

export function AnimatedTestimonials({
  title = "Loved by the community",
  subtitle = "Hear from citizens and officials who are transforming complaints into constructive change through our platform.",
  badgeText = "Trusted by Citizens",
  testimonials = [],
  autoRotateInterval = 6000,
  className,
}: AnimatedTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Refs for scroll animations
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const controls = useAnimation()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut, // Use imported constant
      },
    },
  }

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [autoRotateInterval, testimonials.length])

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section 
      ref={sectionRef} 
      id="testimonials" 
      className={`py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 overflow-hidden bg-muted/30 ${className || ""}`}
    >
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="grid grid-cols-1 gap-8 sm:gap-12 md:gap-16 lg:gap-20 xl:gap-24 w-full lg:grid-cols-2"
        >
          {/* Left side: Heading and navigation */}
          <motion.div variants={itemVariants} className="flex flex-col justify-center order-2 lg:order-1">
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {badgeText && (
                <div className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-primary/10 text-primary w-fit">
                  <Star className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 fill-primary" />
                  <span>{badgeText}</span>
                </div>
              )}

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter leading-tight">
                {title}
              </h2>

              <p className="max-w-[600px] text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                {subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                      activeIndex === index 
                        ? "w-8 sm:w-10 bg-primary" 
                        : "w-2 sm:w-2.5 bg-muted-foreground/30"
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right side: Testimonial cards */}
          <motion.div
            variants={itemVariants}
            className="relative h-full min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px] xl:min-h-[450px] order-1 lg:order-2"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 100 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  x: activeIndex === index ? 0 : 100,
                  scale: activeIndex === index ? 1 : 0.9,
                }}
                transition={{ duration: 0.5, ease: easeInOut }} // Use imported constant
                style={{ zIndex: activeIndex === index ? 10 : 0 }}
              >
                <div className="bg-card border shadow-lg rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col">
                  <div className="mb-3 sm:mb-4 md:mb-6 flex gap-1 sm:gap-2">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-500 text-yellow-500" />
                      ))}
                  </div>

                  <div className="relative mb-3 sm:mb-4 md:mb-6 flex-1">
                    <Quote className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2 h-6 w-6 sm:h-8 sm:w-8 text-primary/20 rotate-180" />
                    <p className="relative z-10 text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed pl-4 sm:pl-6">
                      "{testimonial.content}"
                    </p>
                  </div>

                  <Separator className="my-3 sm:my-4" />

                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border flex-shrink-0">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="text-xs sm:text-sm">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.panchayat}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Decorative elements - hidden on small screens */}
            <div className="hidden lg:block absolute -bottom-4 lg:-bottom-6 -left-4 lg:-left-6 h-16 w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24 rounded-lg lg:rounded-xl bg-primary/5"></div>
            <div className="hidden lg:block absolute -top-4 lg:-top-6 -right-4 lg:-right-6 h-16 w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24 rounded-lg lg:rounded-xl bg-primary/5"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}