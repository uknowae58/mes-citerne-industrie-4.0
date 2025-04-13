'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface NavigationItem {
  title: string
  href: string
  items?: NavigationItem[]
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

interface NavigationProps {
  navigation: {
    pagePrincipales: NavigationSection
    autres: NavigationSection
    ControleGestion: NavigationSection
  }
}

export function NavigationWithActiveLink({ navigation }: NavigationProps) {
  const pathname = usePathname()

  const renderNavigationItem = (item: NavigationItem) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild isActive={pathname === item.href}>
        <Link href={item.href}>{item.title}</Link>
      </SidebarMenuButton>
      {item.items && (
        <SidebarMenuSub>
          {item.items.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                <Link href={subItem.href}>{subItem.title}</Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )

  const renderNavigationGroup = (section: NavigationSection) => (
    <SidebarGroup key={section.title}>
      <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {section.items.map(renderNavigationItem)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <>
      {renderNavigationGroup(navigation.pagePrincipales)}
      {renderNavigationGroup(navigation.ControleGestion)}
      {renderNavigationGroup(navigation.autres)}
    </>
  )
}

