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
 <footer className="border-t border-border/20 bg-white/[0.030]">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
 <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-14">
 <div className="col-span-2">
 <Link href="/" className="flex items-center gap-2.5 mb-5 group">
 <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_16px_-4px_hsl(var(--primary)/0.5)] transition-shadow duration-300 group-hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.65)]">
 <span className="text-primary-foreground font-bold text-sm">Q</span>
 </div>
 <span className="font-semibold text-foreground/95 tracking-tight">Qunt Edge</span>
 </Link>
 <p className="text-[0.875rem] text-muted-foreground/70 max-w-xs leading-relaxed">
 The trading journal and analytics platform for discretionary traders who take their craft seriously.
 </p>
 </div>

 <div>
 <h4 className="font-semibold text-foreground/95 mb-4 text-[0.85rem] tracking-[-0.01em]">Product</h4>
 <ul className="space-y-2.5">
 {footerLinks.product.map((link) => (
 <li key={link.href}>
 <Link
 href={link.href}
 className="text-[0.85rem] text-muted-foreground/70 hover:text-foreground/95 transition-colors duration-200"
 >
 {link.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="font-semibold text-foreground/95 mb-4 text-[0.85rem] tracking-[-0.01em]">Resources</h4>
 <ul className="space-y-2.5">
 {footerLinks.resources.map((link) => (
 <li key={link.href}>
 <Link
 href={link.href}
 className="text-[0.85rem] text-muted-foreground/70 hover:text-foreground/95 transition-colors duration-200"
 >
 {link.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="font-semibold text-foreground/95 mb-4 text-[0.85rem] tracking-[-0.01em]">Company</h4>
 <ul className="space-y-2.5">
 {footerLinks.company.map((link) => (
 <li key={link.href}>
 <Link
 href={link.href}
 className="text-[0.85rem] text-muted-foreground/70 hover:text-foreground/95 transition-colors duration-200"
 >
 {link.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>
 </div>
 <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/40">
 <p className="text-[0.8rem] text-muted-foreground/60">
 © 2026 Qunt Edge. All rights reserved.
 </p>
 <div className="flex items-center gap-5 mt-4 md:mt-0">
 {socialLinks.map((social) => {
 const Icon = social.icon
 return (
 <a
 key={social.label}
 href={social.href}
 target="_blank"
 rel="noopener noreferrer"
 className="text-muted-foreground/50 hover:text-foreground/95 transition-colors duration-200 p-1 rounded-lg hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
 aria-label={social.label}
 >
 <Icon className="w-[1.15rem] h-[1.15rem]" />
 </a>
 )
 })}
 </div>
 </div>
 </div>
 </footer>
 )
}
