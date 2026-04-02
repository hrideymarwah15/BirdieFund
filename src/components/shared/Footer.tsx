import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Logo } from './Logo'

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="mb-6 block">
              <Logo variant="white" size="sm" />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 mt-4">
              The premier platform for golfers to compete for luxury prizes while supporting world-class charities.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <span>Made with</span>
              <Heart size={12} className="text-green-light fill-green-light" />
              <span>for charity</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-bold text-sm mb-4 text-white/90 uppercase tracking-wider">Platform</h4>
            <div className="flex flex-col gap-3">
              <Link href="/#how-it-works" className="text-white/50 hover:text-green-light text-sm transition-colors">How It Works</Link>
              <Link href="/#pricing" className="text-white/50 hover:text-green-light text-sm transition-colors">Pricing</Link>
              <Link href="/#charities" className="text-white/50 hover:text-green-light text-sm transition-colors">Charities</Link>
              <Link href="/dashboard" className="text-white/50 hover:text-green-light text-sm transition-colors">Dashboard</Link>
            </div>
          </div>

          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-bold text-sm mb-4 text-white/90 uppercase tracking-wider">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-white/50 hover:text-green-light text-sm transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-white/50 hover:text-green-light text-sm transition-colors">Terms of Service</Link>
              <Link href="#" className="text-white/50 hover:text-green-light text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>

          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-bold text-sm mb-4 text-white/90 uppercase tracking-wider">Connect</h4>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-white/50 hover:text-green-light text-sm transition-colors">Twitter / X</a>
              <a href="#" className="text-white/50 hover:text-green-light text-sm transition-colors">Instagram</a>
              <a href="mailto:hello@birdiefund.co" className="text-white/50 hover:text-green-light text-sm transition-colors">hello@birdiefund.co</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} BirdieFund. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Registered Charity Platform · Responsible Gaming
          </p>
        </div>
      </div>
    </footer>
  )
}
