export interface AlbumSummary {
  id: string;
  name: string;
  description: string | null;
  template: string;
  photoCount: number;
  customerCount: number;
  status: string;
  linkToken: string;
  createdAt: string;
  expiryDate: string | null;
}

export interface AlbumPhoto {
  id: string;
  filename: string;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  originalUrl?: string;
  likeCount: number;
  starCount: number;
  liked?: boolean;
  starred?: boolean;
  orderIndex: number | null;
}

export interface AlbumCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  lastViewedAt: string | null;
  submittedAt: string | null;
  likes: number;
  stars: number;
  selectedFilenames: string[];
}

export interface PublicAlbumInfo {
  name: string;
  description: string | null;
  template: string;
  photoCount: number;
  requiresPassword: boolean;
  expiryDate: string | null;
  studioName: string;
  downloadEnabled: boolean;
  requiresDownloadPassword: boolean;
  coverPhotoId: string | null;
  coverPhotoUrl: string | null;
  coverPosY: number;
  eventDate: string | null;
}

export interface PublicWebsiteInfo {
  studio: {
    name: string;
    slug: string;
    logoUrl: string | null;
    cover: string | null;
    description: string | null;
    address: string | null;
    phone: string | null;
    email: string;
    socialLinks: Record<string, string> | null;
  };
  templateId: string;
  sections: {
    id: string;
    type: string;
    enabled: boolean;
    orderIndex: number;
    settings: Record<string, unknown> | null;
  }[];
  featuredPhotos: string[];
  albums: {
    id: string;
    name: string;
    description: string | null;
    photoCount: number;
    linkToken: string;
    coverUrl: string | null;
  }[];
}

export interface AlbumDetail {
  id: string;
  name: string;
  description: string | null;
  template: string;
  status: string;
  linkToken: string;
  photoCount: number;
  expiryDate: string | null;
  eventDate: string | null;
  passwordProtected: boolean;
  createdAt: string;
  googleDriveFolderId: string | null;
  lastGoogleSyncAt: string | null;
  maxSelectionCount: number | null;
  downloadEnabled: boolean;
  downloadPasswordProtected: boolean;
  downloadExpiryDate: string | null;
  photos: AlbumPhoto[];
  customers: AlbumCustomer[];
}
