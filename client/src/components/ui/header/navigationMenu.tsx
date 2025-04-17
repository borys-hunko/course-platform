'use client';

import { Button, Link } from '@/components/ui/common';
import { useRouter } from 'next/navigation';

export const NavigationMenu = () => {
  const router = useRouter();
  return (
    <div
      className='flex justify-between items-center gap-8
      max-md:h-full max-md:flex-col max-md:justify-between'
    >
      <Link href={''} className={'order-2'}>
        Courses
      </Link>{' '}
      {/*<Link href={''} className={'order-1 font-medium hover:text-primary'}>*/}
      {/*  Courses2*/}
      {/*</Link>{' '}*/}
      <div className={'order-3 flex gap-3 max-md:flex-col max-md:w-full'}>
        <Button
          onClick={() => router.push('')}
          variant={'outline'}
          className={'w-24 max-md:w-full max-md:h-12'}
        >
          Log In
        </Button>
        <Button
          onClick={() => router.push('')}
          className={'w-24 max-md:w-full max-md:h-12'}
        >
          Join
        </Button>
      </div>
    </div>
  );
};
