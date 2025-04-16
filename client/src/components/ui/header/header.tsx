'use client';

import { FlexibleImage } from '@/components/ui/common';
import Link from 'next/link';
import { SidebarMenuButton } from '@/components/ui/header/dropdownMenuBtn';
import { NavigationMenu } from '@/components/ui/header/navigationMenu';

const HeaderLogo = () => {
  return (
    <Link
      onClick={() => console.log('click')}
      href={''}
      className='h-full max-md:justify-self-center'
    >
      <FlexibleImage
        priority
        src={'/logo.webp'}
        alt='Logo'
        className={'h-full'}
      />
    </Link>
  );
};

export const Header = () => {
  return (
    <header
      className='top-0 fixed z-10  w-full px-6 py-3
     bg-secondary bg-white border-b-gray-400 shadow-sm
    '
    >
      <nav
        className='
      flex justify-between lg:gap-20 max-lg:md:gap-16
      items-center h-10 mx-auto
      max-md:justify-center lg:w-4/5
      max-md:grid max-md:grid-cols-[1fr_5fr_1fr]'
      >
        <SidebarMenuButton />
        <HeaderLogo />
        <div className={'max-md:hidden flex-grow justify-self-center'}>
          <NavigationMenu />
        </div>
      </nav>
    </header>
  );
};
