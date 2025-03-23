import z from 'zod';

const TAGS_SCHEMA = z.array(z.string().max(20)).max(30);
const COURSE_NAME = z.string().max(70).min(5);
const COURSE_DESCRIPTION = z.string().max(2000);
const NUMBER_REGEX = /^\d+$/;
const COURSE_ID_SCHEMA = z.string().regex(NUMBER_REGEX);

export const createCourseSchema = z.object({
  name: COURSE_NAME,
  description: COURSE_DESCRIPTION,
  tags: TAGS_SCHEMA,
});

export const updateCourseSchema = {
  body: z
    .object({
      name: COURSE_NAME.optional(),
      description: COURSE_DESCRIPTION.optional(),
      tags: TAGS_SCHEMA.optional(),
      isDraft: z.boolean().optional(),
    })
    .partial()
    .refine((fields) => Object.keys(fields).length !== 0, {
      message: 'At least one field is required',
    }),
  params: z.object({
    courseId: COURSE_ID_SCHEMA,
  }),
};

export const searchCoursesSchema = z.object({
  tags: z
    .array(
      z
        .string()
        .transform((v) => Number(v))
        .refine((v) => !isNaN(v))
        .refine((v) => v > 0),
    )
    .optional(),
  page: z
    .string()
    .default('1')
    .transform((v) => Number(v))
    .refine((v) => !isNaN(v))
    .refine((v) => v <= 400),
  itemsPerPage: z
    .string()
    .default('20')
    .transform((v) => Number(v))
    .refine((v) => !isNaN(v))
    .refine((v) => v <= 300),
  q: z.string().optional(),
});

export const getCourseByIdSchema = z.object({
  courseId: COURSE_ID_SCHEMA,
});

export const uploadPhotoSchema = {
  params: z.object({
    courseId: COURSE_ID_SCHEMA,
  }),
  headers: z.object({
    'content-type': z.string().includes('multipart/form-data'),
  }),
};
