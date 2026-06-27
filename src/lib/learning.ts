import { supabase } from './supabase';

export interface CourseItem {
  id: string;
  title: string;
  instructor: string;
  isVIP: boolean;
  image: string;
  category: string;
  priceCents: number | null;
}

export async function fetchCourses(): Promise<CourseItem[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, category, image_url, is_vip, price_cents, profiles!courses_instructor_id_fkey ( username )')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Αποτυχία φόρτωσης μαθημάτων: ' + error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    instructor: row.profiles?.username ?? 'Άγνωστος εκπαιδευτής',
    isVIP: row.is_vip,
    image: row.image_url,
    category: row.category,
    priceCents: row.price_cents,
  }));
}

interface NewCourseInput {
  instructorId: string;
  title: string;
  category: string;
  imageUrl: string;
  isVIP: boolean;
  priceCents?: number;
}

export async function createCourse(input: NewCourseInput): Promise<void> {
  const { error } = await supabase.from('courses').insert({
    instructor_id: input.instructorId,
    title: input.title,
    category: input.category,
    image_url: input.imageUrl,
    is_vip: input.isVIP,
    price_cents: input.priceCents ?? null,
  });
  if (error) throw new Error('Αποτυχία δημιουργίας μαθήματος: ' + error.message);
}

export interface BookingItem {
  id: string;
  courseTitle: string;
  instructorName: string;
  date: string;
  timeSlot: string;
}

export async function fetchMyBookings(studentId: string): Promise<BookingItem[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, booking_date, time_slot, courses ( title, profiles!courses_instructor_id_fkey ( username ) )')
    .eq('student_id', studentId)
    .order('booking_date', { ascending: true });

  if (error) throw new Error('Αποτυχία φόρτωσης κρατήσεων: ' + error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    courseTitle: row.courses?.title ?? 'Μάθημα',
    instructorName: row.courses?.profiles?.username ?? 'Εκπαιδευτής',
    date: row.booking_date,
    timeSlot: row.time_slot,
  }));
}

interface NewBookingInput {
  courseId: string;
  studentId: string;
  date: string;
  timeSlot: string;
}

export async function createBooking(input: NewBookingInput): Promise<void> {
  const { error } = await supabase.from('bookings').insert({
    course_id: input.courseId,
    student_id: input.studentId,
    booking_date: input.date,
    time_slot: input.timeSlot,
  });
  if (error) throw new Error('Αποτυχία κράτησης: ' + error.message);
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
  if (error) throw new Error('Αποτυχία ακύρωσης κράτησης: ' + error.message);
}

export interface WorkshopItem {
  id: string;
  organizerName: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  eventDate: string | null;
  location: string | null;
  externalUrl: string;
}

export async function fetchWorkshops(): Promise<WorkshopItem[]> {
  const { data, error } = await supabase
    .from('workshops')
    .select('id, organizer_name, title, description, category, image_url, event_date, location, external_url')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Αποτυχία φόρτωσης workshops: ' + error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    organizerName: row.organizer_name,
    title: row.title,
    description: row.description,
    category: row.category,
    imageUrl: row.image_url,
    eventDate: row.event_date,
    location: row.location,
    externalUrl: row.external_url,
  }));
}

interface NewWorkshopInput {
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  eventDate?: string;
  location?: string;
  externalUrl: string;
}

export async function createWorkshop(input: NewWorkshopInput): Promise<void> {
  const { error } = await supabase.from('workshops').insert({
    organizer_id: input.organizerId,
    organizer_name: input.organizerName,
    title: input.title,
    description: input.description,
    category: input.category,
    image_url: input.imageUrl,
    event_date: input.eventDate ?? null,
    location: input.location ?? null,
    external_url: input.externalUrl,
  });
  if (error) throw new Error('Αποτυχία δημιουργίας ανακοίνωσης workshop: ' + error.message);
}
