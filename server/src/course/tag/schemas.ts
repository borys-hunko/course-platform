import z from 'zod';

export const tagsSearchSchema = z.object({
  q: z.string().max(20).optional(),
  quantity: z
    .string()
    .default('15')
    .transform((v) => Number(v))
    .refine((v) => !isNaN(v))
    .refine((v) => v <= 300),
});
