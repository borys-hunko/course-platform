'use client';

import { FC } from 'react';
import { Menu, X as Close } from 'lucide-react';
import { Button, useSidebar } from '@/components/ui/common';
import { cn } from '@/lib/utils';

interface DropdownMenuBtnProps {
  className?: string;
}

function getIcon(isDropdownMenuOpen: boolean) {
  return isDropdownMenuOpen ? <Close /> : <Menu />;
}

export const SidebarMenuButton: FC<DropdownMenuBtnProps> = ({ className }) => {
  const { toggleSidebar, openMobile } = useSidebar();
  return (
    <Button
      variant={'ghost'}
      className={cn('md:hidden', className)}
      onClick={toggleSidebar}
    >
      {getIcon(openMobile)}
    </Button>
  );
};
