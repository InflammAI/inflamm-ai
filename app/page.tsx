import React from 'react'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import WhatIsSection from '@/components/WhatIsSection'
import FeaturesSection from '@/components/FeaturesSection'
import CoreFeaturesSection from '@/components/CoreFeaturesSection'
import OneProtocolSection from '@/components/OneProtocolSection'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-beige">
      <Navbar />
      <div className="pt-20">
        <HeroSection />
      </div>
      <WhatIsSection />
      <FeaturesSection />
      <CoreFeaturesSection />
      <OneProtocolSection />
      <CTASection />
      <Footer />
    </main>
  )
}
