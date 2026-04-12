import { cn } from "@/lib/utils"
import Link from "next/link"
import { Building2, Tag } from "lucide-react"
import { listPropFirmBannerItems } from "@/server/prop-firms"
import { getCurrentLocale } from "@/locales/server"

const edgeFadeMask = {
 maskImage:"linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
 WebkitMaskImage:"linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
}

export default async function RollingAdBanner() {
 const [items, locale] = await Promise.all([
 listPropFirmBannerItems(),
 getCurrentLocale(),
 ])

 if (items.length === 0) {
 return null
 }

 const repeatedItems = [...items, ...items, ...items]

 return (
 <div className="relative overflow-hidden rounded-xl bg-white/[0.080]">
 <div style={edgeFadeMask}>
 <div className="flex animate-scroll whitespace-nowrap py-2.5">
 {repeatedItems.map((item, idx) => (
 <Link
 key={`${item.id}-${idx}`}
 href={`/${locale}/firm/${item.firmSlug}`}
 className={cn("inline-flex items-center gap-2.5 px-4 transition-opacity duration-300 hover:opacity-80","text-[0.8rem] font-medium tracking-wide"
 )}
 >
 {item.type ==="deal" ? (
 <Tag className="h-4 w-4 text-primary" />
 ) : (
 <Building2 className="h-4 w-4 text-muted-foreground" />
 )}
 <span className="text-foreground/90">{item.firmName}</span>
 <span
 className={cn("rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide",
 item.type ==="deal"
 ?"bg-primary/10 text-primary"
 :"bg-success/10 text-success"
 )}
 >
 {item.badge}
 </span>
 </Link>
 ))}
 </div>
 </div>
 </div>
 )
}
