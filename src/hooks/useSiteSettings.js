import { useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/api/dataClient';

export const DEFAULT_SETTINGS = {
  site_name: "Alhind Medical Care",
  email: "info@alhindmedical.com",
  phone: "+91 987 654 3210",
  whatsapp_number: "+919876543210",
  address: "Alhind Medical Care Pvt Ltd, 98, 2nd Floor, Sector 44, Gurgaon, National Capital Region, Haryana, INDIA, PIN 122001",
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  linkedin_url: "",
  youtube_url: "",
  emergency_phone: "+91 987 654 3210",
  support_email: "support@alhindmedical.com",
  postal_code: "122001",
  weekday_hours: "Mon - Fri: 8:00 AM - 8:00 PM",
  weekend_hours: "Sat - Sun: 9:00 AM - 5:00 PM",
  departments: "[]",
  google_maps_embed_url: "",
  latitude: "",
  longitude: "",
  // Homepage hero stats — editable from Admin Settings so the team can update
  // these as the business grows, without needing a code change.
  patients_assisted: "1,00,000+",
  google_rating: "4.7",
  trusted_since_year: "2016",
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const items = await db.entities.SiteSettings.list('-created_date', 1);
      if (items.length > 0) {
        return { ...DEFAULT_SETTINGS, ...items[0] };
      }
      return { ...DEFAULT_SETTINGS };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useInvalidateSettings() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
}

export function getWhatsAppLink(number) {
  const fallback = "https://wa.me/919876543210";
  if (!number) return fallback;
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : fallback;
}

export function getTelLink(phone) {
  if (!phone) return "tel:+919876543210";
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function parseDepartments(deptStr) {
  if (!deptStr) return [];
  try {
    const parsed = JSON.parse(deptStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}