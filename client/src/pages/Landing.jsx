import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import CtaBand from '../components/landing/CtaBand'
import Footer from '../components/landing/Footer'

export default function Landing() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Helmet>
        <title>FormCraft — Build forms people actually finish</title>
        <meta name="description" content="Create beautiful forms and surveys in minutes. Share a link, collect responses, watch the insights roll in — no code required." />
        <meta property="og:title"       content="FormCraft — Build forms people actually finish" />
        <meta property="og:description" content="Create beautiful forms and surveys in minutes. No code required." />
        <meta property="og:type"        content="website" />
        <meta name="twitter:title"      content="FormCraft — Build forms people actually finish" />
        <meta name="twitter:description" content="Create beautiful forms and surveys in minutes. No code required." />
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CtaBand />
      </main>
      <Footer />
    </div>
  )
}
