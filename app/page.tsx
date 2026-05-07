import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Problema from '@/components/Problema'
import Solucion from '@/components/Solucion'
import Proceso from '@/components/Proceso'
import Formulario from '@/components/Formulario'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Problema />
      <Solucion />
      <Proceso />
      <Formulario />
      <Footer />
    </main>
  )
}
