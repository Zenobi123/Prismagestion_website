// Stockage de fichiers local : les fichiers uploadés sont convertis en
// data URL et conservés dans le localStorage, ce qui permet de les
// afficher directement comme "URL publique" sans serveur.

const STORAGE_PREFIX = 'prisma-local-storage:';

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Lecture du fichier impossible'));
    reader.readAsDataURL(file);
  });
}

class LocalBucket {
  constructor(private bucket: string) {}

  private key(path: string) {
    return `${STORAGE_PREFIX}${this.bucket}/${path}`;
  }

  async upload(path: string, file: Blob, _options?: unknown) {
    try {
      const dataUrl = await fileToDataUrl(file);
      localStorage.setItem(this.key(path), dataUrl);
      return { data: { path, id: path, fullPath: `${this.bucket}/${path}` }, error: null };
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'QuotaExceededError'
          ? 'Espace de stockage local insuffisant pour ce fichier. Essayez une image plus légère.'
          : error instanceof Error
            ? error.message
            : String(error);
      return { data: null, error: { name: 'StorageError', message } };
    }
  }

  getPublicUrl(path: string) {
    const stored = localStorage.getItem(this.key(path));
    // Si le fichier n'existe pas localement, renvoyer le chemin tel quel
    // (utile pour les URLs déjà absolues ou les assets du site).
    return { data: { publicUrl: stored ?? path } };
  }

  async remove(paths: string[]) {
    paths.forEach((path) => localStorage.removeItem(this.key(path)));
    return { data: paths.map((path) => ({ path })), error: null };
  }
}

export const localStorageApi = {
  from(bucket: string) {
    return new LocalBucket(bucket);
  },
};
