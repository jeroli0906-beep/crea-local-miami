export default function Footer() {
  return (
    <footer className="bg-dark2 border-t border-white/8 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="font-black text-xl mb-1 tracking-tight">
            <span className="text-primary">Crea</span>
            <span className="text-white"> Local</span>
            <span className="text-muted"> Miami</span>
          </div>
          <p className="text-muted text-sm">Contenido bilingüe para negocios locales.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-muted">
          <a
            href="mailto:jeroli0906@gmail.com"
            className="hover:text-white transition-colors"
          >
            jeroli0906@gmail.com
          </a>
          <a
            href="https://instagram.com/crealocalmiami"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors font-medium"
          >
            @crealocalmiami
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 text-center text-muted text-xs">
        © {new Date().getFullYear()} Crea Local Miami. Todos los derechos reservados.
      </div>
    </footer>
  )
}
