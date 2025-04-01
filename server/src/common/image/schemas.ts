import z from 'zod';

const IMAGE_FORMAT = /^[a-z]+_\d+_[A-Za-z0-9+/=]+\.(png|jpg|jpeg|webp)$/;

export const imageCompressMessageSchema = z.object({
  filename: z.string().regex(IMAGE_FORMAT),
});
