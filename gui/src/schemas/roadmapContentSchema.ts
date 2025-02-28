import { z } from 'zod';

export const ContentSectionSchema = z.union([
  z.object({
    type: z.literal('markdown'),
    content: z.string()
  }),
  z.object({
    type: z.literal('code'),
    language: z.string(),
    content: z.string()
  })
]);

export const RoadmapContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  sections: z.array(ContentSectionSchema)
}); 