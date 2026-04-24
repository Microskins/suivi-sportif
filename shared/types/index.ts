// Shared types for Suivi Sportif

export interface Profile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  profileId: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports';
  duration: number;
  calories?: number;
  date: Date;
}
