import { FlexibleImage } from '@/components/ui/common';
import Link from 'next/link';
import { SidebarMenuButton } from '@/components/ui/header/dropdownMenuBtn';
import { NavigationMenu } from '@/components/ui/header/navigationMenu';
import logo from '@/../public/logo.webp';

const HeaderLogo = () => {
  return (
    <Link href={''} className='h-full max-md:justify-self-center'>
      <FlexibleImage src={logo} alt='Logo' className={'h-full'} />
    </Link>
  );
};

export const Header = () => {
  return (
    <header
      className='top-0 sticky z-10  w-full px-6 py-3
     bg-white border-b-border shadow-sm
    '
    >
      <nav
        className='
      flex justify-between lg:gap-20 max-lg:md:gap-16
      items-center h-11 lg:max-w-[84rem] mx-auto
      max-md:justify-center
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
