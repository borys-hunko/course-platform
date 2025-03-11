import z from 'zod';
import {
  createCourseSchema,
  getCourseByIdSchema,
  searchCoursesSchema,
  updateCourseSchema,
} from './schemas';
import { Pagination } from '../common/types';
import { Tag } from './tag';
import { User } from '../user/types';

export interface Course {
  id: number;
  name: string;
  description: string;
  isDraft: boolean;
  tags: Tag[];
  imageUrl?: string;
  author: Pick<User, 'id' | 'name' | 'login'>;
}

export interface CourseTable {
  id: number;
  name: string;
  description: string;
  isDraft: boolean;
  imageUrl?: string;
  authorId: number;
}

export interface CourseFtsTable {
  id: number;
  fulltext: any;
}

// dto
export type CreateCourseRequest = z.infer<typeof createCourseSchema>;
export type UpdateCourseRequest = z.infer<typeof updateCourseSchema.body>;
export type SearchCourseRequest = z.infer<typeof searchCoursesSchema>;
export type GetCourseByIdRequest = z.infer<typeof getCourseByIdSchema>;
export type CoursesPageResponse = Pagination<Course>;
