import { Avatar as Avatar, AvatarFallback as AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthProfileButtonSkeleton() {
 return (
 <div className="relative inline-block">
 <Avatar className="h-8 w-8">
 <AvatarFallback className="bg-[oklch(0.65_0.22_260/0.06)]">
 <Skeleton className="h-full w-full rounded-full" />
 </AvatarFallback>
 </Avatar>
 </div>
 )
}
