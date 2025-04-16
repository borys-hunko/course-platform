'use client';

import { Sidebar } from '@/components/ui/common/sidebar';
import { NavigationMenu } from '@/components/ui/header/navigationMenu';
import { useIsMobile } from '@/hooks/use-mobile';

export const SidebarMenu = () => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }
  return (
    <Sidebar variant={'inset'}>
      <NavigationMenu />
    </Sidebar>
  );
};
