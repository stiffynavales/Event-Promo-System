export interface Host {
  id: string;
  hostName: string;
  hostEmail: string;
  hostBio: string;
  city: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  slug: string;
  status: "pending" | "generating" | "complete" | "error";
  driveFolderUrl?: string;
  registrationPageUrl?: string;
  generatedCopy?: GeneratedCopy;
  createdAt: string;
}

export interface GeneratedCopy {
  confirmationEmail: string;
  reminder1DayBefore: string;
  reminder1HourBefore: string;
  followUpEmail: string;
  socialPost1: string;
  socialPost2: string;
  socialPost3: string;
  eventDescription: string;
  pageHeadline: string;
}

export interface Attendee {
  id: string;
  hostSlug: string;
  name: string;
  email: string;
  registeredAt: string;
}
