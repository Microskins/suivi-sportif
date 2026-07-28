import { useCallback, useEffect, useRef, useState } from "react";

type StoredRoutePhoto = {
  blob: Blob;
  createdAt: number;
  fileName: string;
  id: string;
  routeId: string;
};

export type RoutePhoto = Pick<
  StoredRoutePhoto,
  "createdAt" | "fileName" | "id"
> & {
  url: string;
};

const DATABASE_NAME = "vosges-wild-photos";
const STORE_NAME = "route-photos";

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("routeId", "routeId", { unique: false });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function createPhotoId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function useRoutePhotos(routeId: string) {
  const [photos, setPhotos] = useState<RoutePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const urlsRef = useRef<string[]>([]);

  const replacePhotos = useCallback((records: StoredRoutePhoto[]) => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const nextPhotos = records
      .sort((first, second) => second.createdAt - first.createdAt)
      .map((record) => ({
        id: record.id,
        fileName: record.fileName,
        createdAt: record.createdAt,
        url: URL.createObjectURL(record.blob),
      }));

    urlsRef.current = nextPhotos.map((photo) => photo.url);
    setPhotos(nextPhotos);
  }, []);

  const loadPhotos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const database = await openDatabase();
      const transaction = database.transaction(STORE_NAME, "readonly");
      const index = transaction.objectStore(STORE_NAME).index("routeId");
      const request = index.getAll(routeId);
      request.onsuccess = () => {
        replacePhotos(request.result as StoredRoutePhoto[]);
        setIsLoading(false);
        database.close();
      };
      request.onerror = () => {
        setError("Impossible de lire les photos de ce trace.");
        setIsLoading(false);
        database.close();
      };
    } catch {
      setError(
        "Le stockage local des photos est indisponible dans ce navigateur.",
      );
      setIsLoading(false);
    }
  }, [replacePhotos, routeId]);

  useEffect(() => {
    void loadPhotos();
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = [];
    };
  }, [loadPhotos]);

  const importPhotos = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (!imageFiles.length) {
        setError("Choisis des fichiers image pour les ajouter au trace.");
        return;
      }

      try {
        const database = await openDatabase();
        const transaction = database.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        imageFiles.forEach((file) => {
          store.put({
            id: createPhotoId(),
            routeId,
            fileName: file.name,
            blob: file,
            createdAt: Date.now(),
          } satisfies StoredRoutePhoto);
        });

        transaction.oncomplete = () => {
          database.close();
          void loadPhotos();
        };
        transaction.onerror = () => {
          setError("Impossible d'enregistrer ces photos localement.");
          database.close();
        };
      } catch {
        setError(
          "Le stockage local des photos est indisponible dans ce navigateur.",
        );
      }
    },
    [loadPhotos, routeId],
  );

  const removePhoto = useCallback(
    async (photoId: string) => {
      try {
        const database = await openDatabase();
        const transaction = database.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).delete(photoId);
        transaction.oncomplete = () => {
          database.close();
          void loadPhotos();
        };
        transaction.onerror = () => {
          setError("Impossible de supprimer cette photo.");
          database.close();
        };
      } catch {
        setError(
          "Le stockage local des photos est indisponible dans ce navigateur.",
        );
      }
    },
    [loadPhotos],
  );

  return { error, importPhotos, isLoading, photos, removePhoto };
}
