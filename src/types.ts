export interface Comment {
  id: string;
  username: string;
  avatar: string;
  timeAgo: string;
  text: string;
}

export interface Post {
  id: string;
  username: string;
  avatar: string;
  timeAgo: string;
  contentImage: string;
  isVideo?: boolean;
  engineTag?: string;
  likes: number;
  fireCount: number;
  commentsCount: number;
  contentText: string;
  category: string;
  hasLiked?: boolean;
  hasFired?: boolean;
  commentsList: Comment[];
}

export interface Discovery {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  likesCount: number;
  tag?: string;
  isCustomContent?: boolean;
}

export interface Meet {
  id: string;
  category: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
  detailImage: string;
  attendeesAvatars: string[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  isVIP: boolean;
  image: string;
  category: string;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'course' | 'meet' | 'system';
  title: string;
  message: string;
  timeAgo: string;
  isUnread: boolean;
  avatar?: string;
  metadata?: {
    postId?: string;
    meetId?: string;
    courseId?: string;
    showAcceptDecline?: boolean;
    status?: 'pending' | 'accepted' | 'declined';
  };
}
