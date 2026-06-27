import { supabase } from './supabase';

export interface MeetItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  locationName: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  attendeesCount: number;
  hasJoined: boolean;
  distanceKm: number | null;
}

function mapRowToMeet(row: any, currentUserId: string, userLat: number | null, userLng: number | null): MeetItem {
  const attendees: any[] = row.meet_attendees ?? [];
  const distanceKm =
    userLat !== null && userLng !== null ? haversineDistanceKm(userLat, userLng, row.latitude, row.longitude) : null;

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    date: row.meet_date,
    time: row.meet_time,
    locationName: row.location_name,
    latitude: row.latitude,
    longitude: row.longitude,
    imageUrl: row.image_url,
    attendeesCount: attendees.length,
    hasJoined: attendees.some((a) => a.user_id === currentUserId),
    distanceKm,
  };
}

/** Υπολογίζει απόσταση σε χιλιόμετρα ανάμεσα σε δύο σημεία (τύπος Haversine). */
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // ακτίνα της Γης σε χλμ
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Φορτώνει όλα τα meets. Αν δοθούν συντεταγμένες χρήστη, υπολογίζει
 * και ταξινομεί κατά απόσταση (πιο κοντινά πρώτα). Διαφορετικά, τα
 * επιστρέφει ταξινομημένα κατά ημερομηνία δημιουργίας.
 */
export async function fetchMeets(
  currentUserId: string,
  userLat: number | null,
  userLng: number | null
): Promise<MeetItem[]> {
  const { data, error } = await supabase
    .from('meets')
    .select('id, title, category, meet_date, meet_time, location_name, latitude, longitude, image_url, meet_attendees ( user_id )')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Αποτυχία φόρτωσης συναντήσεων: ' + error.message);

  const meets = (data ?? []).map((row) => mapRowToMeet(row, currentUserId, userLat, userLng));

  if (userLat !== null && userLng !== null) {
    meets.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  return meets;
}

interface NewMeetInput {
  organizerId: string;
  title: string;
  category: string;
  date: string;
  time: string;
  locationName: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export async function createMeet(input: NewMeetInput): Promise<void> {
  const { error } = await supabase.from('meets').insert({
    organizer_id: input.organizerId,
    title: input.title,
    category: input.category,
    meet_date: input.date,
    meet_time: input.time,
    location_name: input.locationName,
    latitude: input.latitude,
    longitude: input.longitude,
    image_url: input.imageUrl ?? null,
  });
  if (error) throw new Error('Αποτυχία δημιουργίας συνάντησης: ' + error.message);
}

export async function joinMeet(meetId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('meet_attendees').insert({ meet_id: meetId, user_id: userId });
  if (error) throw new Error('Αποτυχία συμμετοχής: ' + error.message);
}

export async function leaveMeet(meetId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('meet_attendees').delete().eq('meet_id', meetId).eq('user_id', userId);
  if (error) throw new Error('Αποτυχία αναίρεσης συμμετοχής: ' + error.message);
}

/**
 * Ζητά την τοποθεσία του χρήστη από τον browser.
 * Επιστρέφει null αν ο χρήστης αρνηθεί ή δεν υποστηρίζεται.
 */
export function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 }
    );
  });
}
