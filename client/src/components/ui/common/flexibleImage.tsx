import { FC } from 'react';
import NextImage, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  src: string;
  alt: string;
  imageClassName?: string;
} & Omit<ImageProps, 'className' | 'width' | 'height' | 'sizes'>;

export const FlexibleImage: FC<Props> = ({
  className,
  src,
  alt,
  imageClassName,
  ...props
}) => (
  <div className={className}>
    <NextImage
      width={0}
      height={0}
      sizes={'100vw'}
      src={src}
      alt={alt}
      className={cn('w-auto h-full block', imageClassName)}
      {...props}
    />
  </div>
);
