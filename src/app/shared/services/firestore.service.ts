import { getApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";

type FirestoreModule = typeof import("firebase/firestore");

let ready: Promise<{ db: Firestore; fs: FirestoreModule }> | undefined;

export const loadFirestore = (): Promise<{ db: Firestore; fs: FirestoreModule }> =>
  (ready ??= import("firebase/firestore").then(fs => ({
    fs,
    db: fs.initializeFirestore(getApp(), { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) }),
  })));
