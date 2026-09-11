export type Session = {
  status: 'guest' | 'authenticated' | 'unknown';
  name: string | null;
  photoUrl?: string;
};
