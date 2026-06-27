/**
 * Μετατρέπει ένα όνομα τοποθεσίας (π.χ. "Αθήνα, Πίστα Μεγάρων") σε συντεταγμένες,
 * χρησιμοποιώντας το δωρεάν OpenStreetMap Nominatim API (χωρίς να χρειάζεται API key).
 */
export interface GeocodingResult {
  displayName: string;
  lat: number;
  lng: number;
}

export async function geocodeLocation(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=5`;

  const response = await fetch(url, {
    headers: {
      // Το Nominatim ζητάει ένα αναγνωριστικό header στις αιτήσεις του
      'Accept-Language': 'el,en',
    },
  });

  if (!response.ok) throw new Error('Αποτυχία αναζήτησης τοποθεσίας.');

  const data = await response.json();
  return (data as any[]).map((item) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}
