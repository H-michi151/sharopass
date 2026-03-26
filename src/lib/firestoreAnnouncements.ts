import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: Timestamp | null;
  published: boolean;
}

/** published: true のお知らせを新着順で取得 */
export async function getPublishedAnnouncements(
  maxCount = 10
): Promise<Announcement[]> {
  if (!db) return [];
  try {
    const col = collection(db, 'announcements');
    const q = query(
      col,
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.slice(0, maxCount).map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Announcement, 'id'>),
    }));
  } catch {
    return [];
  }
}
