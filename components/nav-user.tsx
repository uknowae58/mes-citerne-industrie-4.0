"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { signOutAction } from "@/app/actions"
import { Button } from "./ui/button"

type UserData = {
  username: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  photo_url: string | null;
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const supabase = createClient()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('username, email, firstname, lastname, photo_url')
        .eq('id', user.id)
        .single()

      if (data && !error) {
        setUserData(data as UserData)
      }
      
      setIsLoading(false)
    }

    fetchUserData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserData()
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isLoading) {
    return <div className="flex items-center p-2">
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarFallback className="rounded-lg">
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    </div>
  }

  if (!userData) return null
  
  // Generate display name from available fields
  const displayName = userData.firstname && userData.lastname 
    ? `${userData.firstname} ${userData.lastname}`
    : userData.username

  // Generate initials for avatar fallback
  const initials = userData.firstname && userData.lastname
    ? `${userData.firstname[0]}${userData.lastname[0]}`
    : userData.username.substring(0, 2)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userData.photo_url || ''} alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  {initials.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{userData.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userData.photo_url || ''} alt={displayName} />
                  <AvatarFallback className="rounded-lg">
                    {initials.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs">{userData.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <form action={signOutAction} className="w-full">
                <Button type="submit" variant="destructive" className="w-full">
                  Me déconnecter
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}