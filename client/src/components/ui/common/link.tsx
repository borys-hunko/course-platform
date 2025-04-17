import NextLink from 'next/link';
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Link: typeof NextLink = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <NextLink
        ref={ref}
        className={cn('font-medium hover:text-primary', className)}
        {...props}
      >
        {props.children}
      </NextLink>
    );
  },
);

Link.displayName = 'LinkWrapper';
