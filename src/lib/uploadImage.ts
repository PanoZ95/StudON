import { supabase } from './supabase';

/**
 * Ανεβάζει μια εικόνα στο Supabase Storage (bucket: post-images)
 * και επιστρέφει το δημόσιο URL της, έτοιμο για αποθήκευση σε ένα post.
 *
 * Η εικόνα αποθηκεύεται μέσα σε φάκελο με το user id, π.χ.:
 *   post-images/<user_id>/1719234567-photo.jpg
 * Αυτό ταιριάζει με τους storage policies που επιτρέπουν στον χρήστη
 * να γράφει/σβήνει μόνο μέσα στον δικό του φάκελο.
 */
export async function uploadPostImage(file: File, userId: string): Promise<string> {
  // Βασικός έλεγχος μεγέθους/τύπου πριν στείλουμε τίποτα στον server
  const MAX_SIZE_MB = 8;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Η εικόνα είναι πολύ μεγάλη (μέγιστο ${MAX_SIZE_MB}MB).`);
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Επιτρέπονται μόνο αρχεία εικόνας.');
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
    throw new Error('Αποτυχία ανεβάσματος εικόνας: ' + uploadError.message);
  }

  const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
  return data.publicUrl;
}
