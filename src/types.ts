export type Role = 'employee' | 'admin';
export type Batch = 1 | 2;
export type SeatType = 'fixed' | 'floater';
export type BookingStatus = 'booked' | 'blocked';
export type BookingType = 'designated' | 'floater';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  squadId: string;
  batch: Batch;
  role: Role;
}

export interface Seat {
  id: string;
  number: number;
  type: SeatType;
  squadId?: string;
}

export interface Booking {
  id?: string;
  date: string; // YYYY-MM-DD
  seatId: string;
  userId: string;
  userName: string;
  status: BookingStatus;
  type: BookingType;
}

export interface SystemConfig {
  rotationStartDate: string;
  holidays: string[];
}

export interface Squad {
  id: string;
  name: string;
}
