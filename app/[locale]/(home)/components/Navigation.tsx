'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavigationProps {
  locale: string
}

export default function Navigation({ locale }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: `/${locale}/features`, label: 'Features' },
    { href: `/${locale}/pricing`, label: 'Pricing' },
    { href: `/${locale}/docs`, label: 'Docs' },
    { href: `/${locale}/blog`, label: 'Blog' },
  ]

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-[#1A1A21] bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2962FF] flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="font-semibold text-[#E0E0E0]">Qunt Edge</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#9E9E9E] hover:text-[#E0E0E0] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Login
            </Button>
            <Button size="sm" className="bg-[#2962FF] hover:bg-[#2962FF]/90">
              Start Free
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-[#E0E0E0]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-[#050505]/95 backdrop-blur-xl md:hidden transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full pt-20 px-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-4 text-lg text-[#E0E0E0] border-b border-[#1A1A21]"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-4 mt-8">
            <Button variant="outline" size="lg">
              Login
            </Button>
            <Button size="lg" className="bg-[#2962FF] hover:bg-[#2962FF]/90">
              Start Free
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
