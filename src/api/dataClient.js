import { createEntity } from '@/api/entityFactory';
import { auth } from '@/api/authClient';
import { UploadFile, deleteFileByUrl } from '@/api/uploadFile';

export const db = {
  entities: {
    Appointment: createEntity('appointments', { publicInsert: true }),
    BlogPost: createEntity('blog_posts'),
    Doctor: createEntity('doctors', { countryColumn: 'country', hospitalColumn: 'hospital_id' }),
    FAQ: createEntity('faqs'),
    Hospital: createEntity('hospitals', { countryColumn: 'country' }),
    Lead: createEntity('leads', { publicInsert: true }),
    Newsletter: createEntity('newsletter_subscribers', { publicInsert: true, ignoreDuplicates: true }),
    Package: createEntity('packages', { countryColumn: 'country', hospitalColumn: 'hospital_id' }),
    Quote: createEntity('quotes'),
    SiteSettings: createEntity('site_settings'),
    SiteContent: createEntity('site_content_items'),
    Testimonial: createEntity('testimonials'),
    Treatment: createEntity('treatments', { countryColumn: 'country' }),
  },
  auth,
  integrations: {
    Core: {
      UploadFile,
      DeleteFile: deleteFileByUrl,
    },
  },
};