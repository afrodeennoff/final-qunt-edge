import Link from 'next/link'
import { Twitter, Github, MessageCircle } from 'lucide-react'

const footerLinks = {
  product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Integrations', href: '/integrations' },
    { label: 'Changelog', href: '/changelog' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api-docs' },
    { label: 'Blog', href: '/blog' },
    { label: 'Community', href: '/community' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Legal', href: '/legal' },
  ],
}

const socialLinks = [
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/quntedge' },
  { icon: MessageCircle, label: 'Discord', href: 'https://discord.gg/quntedge' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/quntedge' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[#1A1A21] bg-[#0b0b0d]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#2962FF] flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="font-semibold text-[#E0E0E0]">Qunt Edge</span>
            </Link>
            <p className="text-sm text-[#707070] max-w-xs">
              The trading journal and analytics platform for discretionary traders who take their craft seriously.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-[#E0E0E0] mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#707070] hover:text-[#E0E0E0] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-[#E0E0E0] mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#707070] hover:text-[#E0E0E0] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-[#E0E0E0] mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#707070] hover:text-[#E0E0E0] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#1A1A21]">
          <p className="text-sm text-[#707070]">
            © 2026 Qunt Edge. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#707070] hover:text-[#E0E0E0] transition-colors"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
