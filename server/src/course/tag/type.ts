import { tagsSearchSchema } from './schemas';
import z from 'zod';

export interface Tag {
  id: number;
  name: string;
}

export interface CourseToTagTable {
  courseId: number;
  tagId: number;
}

export type TagsSearchRequest = z.infer<typeof tagsSearchSchema>;
export type TagsSearchResponse = { tags: Tag[] };
