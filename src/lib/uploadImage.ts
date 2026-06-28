import { supabase } from './supabase';

/**
 * Ανεβάζει μια εικόνα ή ένα βίντεο στο Supabase Storage (bucket: post-images)
 * και επιστρέφει το δημόσιο URL της, έτοιμο για αποθήκευση σε ένα post.
 *
 * Το αρχείο αποθηκεύεται μέσα σε φάκελο με το user id, π.χ.:
 *   post-images/<user_id>/1719234567-photo.jpg
 * Αυτό ταιριάζει με τους storage policies που επιτρέπουν στον χρήστη
 * να γράφει/σβήνει μόνο μέσα στον δικό του φάκελο.
 */
export async function uploadPostImage(file: File, userId: string): Promise<{ url: string; isVideo: boolean }> {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  if (!isVideo && !isImage) {
    throw new Error('Επιτρέπονται μόνο αρχεία εικόνας ή βίντεο.');
  }

  // Διαφορετικό όριο μεγέθους ανάλογα τον τύπο — τα βίντεο επιτρέπονται
  // πιο μεγάλα, αλλά πάντα με ένα λογικό ανώτατο όριο.
  const MAX_IMAGE_MB = 8;
  const MAX_VIDEO_MB = 60;
  const maxSizeMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`Το αρχείο είναι πολύ μεγάλο (μέγιστο ${maxSizeMB}MB).`);
  }

  // Μοναδικό όνομα αρχείου ώστε να μη γράφει το ένα πάνω στο άλλο
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error('Αποτυχία ανεβάσματος: ' + uploadError.message);
  }

  const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
  return { url: data.publicUrl, isVideo };
}
