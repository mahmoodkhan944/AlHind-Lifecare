import { createEntity } from '@/api/entityFactory';
import { auth } from '@/api/authClient';
import { UploadFile, deleteFileByUrl } from '@/api/uploadFile';

export const db = {
  entities: {
    Appointment: createEntity('appointments', { publicInsert: true }),
    BlogPost: createEntity('blog_posts'),
    Doctor: createEntity('doctors'),
    FAQ: createEntity('faqs'),
    Hospital: createEntity('hospitals'),
    Lead: createEntity('leads', { publicInsert: true }),
    Newsletter: createEntity('newsletter_subscribers', { publicInsert: true, ignoreDuplicates: true }),
    Quote: createEntity('quotes'),
    SiteSettings: createEntity('site_settings'),
    SiteContent: createEntity('site_content_items'),
    Testimonial: createEntity('testimonials'),
    Treatment: createEntity('treatments'),
  },
  auth,
  integrations: {
    Core: {
      UploadFile,
      DeleteFile: deleteFileByUrl,
    },
  },
};