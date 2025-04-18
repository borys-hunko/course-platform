import { FC } from 'react';
import NextImage, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

type Props = {
  className?: string;
  src: string | StaticImport;
  alt: string;
  imageClassName?: string;
  height?: number | `${number}`;
  width?: number | `${number}`;
} & Omit<ImageProps, 'className' | 'width' | 'height' | 'sizes'>;

export const FlexibleImage: FC<Props> = ({
  className,
  imageClassName,
  ...props
}) => (
  <div className={className}>
    <NextImage
      // width={0}
      // height={0}
      // sizes={'100vw'}
      className={cn('w-auto h-full block', imageClassName)}
      {...props}
    />
  </div>
);
