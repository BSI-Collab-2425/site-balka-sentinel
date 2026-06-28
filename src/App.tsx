import { useState } from 'react'
import Navbar from './components/Navbar'
import Presentation from './components/sections/Presentation'
import Demo from './components/sections/Demo'
import Offres from './components/sections/Offres'
import Newsletter from './components/sections/Newsletter'
import Footer from './components/sections/Footer'        // ← NOUVEAU
import './styles/global.css'

export type Section = 'presentation' | 'demo' | 'offres' | 'newsletter'

export default function App() {
  const [active, setActive] = useState<Section>('presentation')

  const renderSection = () => {
    switch (active) {
      case 'presentation': return <Presentation />
      case 'demo':         return <Demo />
      case 'offres':       return <Offres />
      case 'newsletter':   return <Newsletter />
    }
  }

  return (
    <>
      <Navbar active={active} onNavigate={setActive} />
      <main>{renderSection()}</main>
      <Footer />    
    </>
  )
}
