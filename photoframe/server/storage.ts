import { type Photo, type InsertPhoto } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getAllPhotos(): Promise<Photo[]>;
  getPhoto(id: string): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: string): Promise<boolean>;
  moveToTrash(id: string): Promise<Photo | undefined>;
  restoreFromTrash(id: string): Promise<Photo | undefined>;
  emptyTrash(): Promise<number>;
}

export class FileStorage implements IStorage {
  private photos: Map<string, Photo>;
  private dbPath: string;
  private uploadsDir: string;

  constructor(dbPath: string = "/data/photos.json", uploadsDir: string = "/data/uploads") {
    this.photos = new Map();
    this.dbPath = dbPath;
    this.uploadsDir = uploadsDir;
    this.init();
  }

  private async init() {
    try {
      console.log("[FileStorage] Inizializzazione storage persistente...");
      
      // Create uploads directory if not exists
      try {
        await fs.mkdir(this.uploadsDir, { recursive: true });
        console.log(`[FileStorage] Directory uploads: ${this.uploadsDir}`);
      } catch (err) {
        console.error("[FileStorage] Errore creazione uploads dir:", err);
      }

      // Load existing database
      try {
        const data = await fs.readFile(this.dbPath, "utf-8");
        const photosArray: Photo[] = JSON.parse(data);
        this.photos = new Map(photosArray.map(p => [p.id, p]));
        console.log(`[FileStorage] Database caricato: ${this.photos.size} foto`);
      } catch (err) {
        console.log("[FileStorage] Database non trovato, creazione nuovo...");
        await this.save();
      }

      // Scan uploads directory and sync with database
      await this.scanAndSync();

      // Clean up trashed photos on startup
      await this.cleanupTrashedPhotos();
    } catch (error) {
      console.error("[FileStorage] Errore inizializzazione:", error);
    }
  }

  private async cleanupTrashedPhotos() {
    try {
      const trashedPhotos = Array.from(this.photos.values()).filter(p => p.inTrash);
      
      if (trashedPhotos.length === 0) {
        console.log("[FileStorage] Nessuna foto nel cestino da eliminare");
        return;
      }

      console.log(`[FileStorage] Eliminazione ${trashedPhotos.length} foto dal cestino...`);
      
      for (const photo of trashedPhotos) {
        try {
          const fullPath = path.join(this.uploadsDir, path.basename(photo.filepath));
          await fs.unlink(fullPath);
          this.photos.delete(photo.id);
          console.log(`[FileStorage] Eliminata: ${photo.filename}`);
        } catch (err) {
          console.error(`[FileStorage] Errore eliminazione ${photo.filename}:`, err);
        }
      }
      
      await this.save();
      console.log("[FileStorage] Pulizia cestino completata");
    } catch (error) {
      console.error("[FileStorage] Errore pulizia cestino:", error);
    }
  }

  private async scanAndSync() {
    try {
      console.log("[FileStorage] Scansione directory uploads...");
      const files = await fs.readdir(this.uploadsDir);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
      
      console.log(`[FileStorage] Trovati ${imageFiles.length} file immagine`);

      // Find orphaned files (files without metadata)
      const existingPaths = new Set(
        Array.from(this.photos.values()).map(p => path.basename(p.filepath))
      );

      const orphanedFiles = imageFiles.filter(f => !existingPaths.has(f));
      
      if (orphanedFiles.length > 0) {
        console.log(`[FileStorage] Recupero ${orphanedFiles.length} foto orfane...`);
        
        for (const filename of orphanedFiles) {
          const stats = await fs.stat(path.join(this.uploadsDir, filename));
          const photo: Photo = {
            id: randomUUID(),
            filename: filename,
            filepath: `/uploads/${filename}`,
            uploadedAt: stats.birthtime || new Date(),
            inTrash: false,
          };
          this.photos.set(photo.id, photo);
          console.log(`[FileStorage] Recuperata: ${filename}`);
        }
        
        await this.save();
      }

      // Remove metadata for deleted files
      const dbFilenames = Array.from(this.photos.values()).map(p => path.basename(p.filepath));
      const deletedFiles = dbFilenames.filter(f => !imageFiles.includes(f));
      
      if (deletedFiles.length > 0) {
        console.log(`[FileStorage] Rimozione ${deletedFiles.length} metadati obsoleti...`);
        const entries = Array.from(this.photos.entries());
        for (const [id, photo] of entries) {
          if (deletedFiles.includes(path.basename(photo.filepath))) {
            this.photos.delete(id);
          }
        }
        await this.save();
      }

      console.log(`[FileStorage] Sincronizzazione completata: ${this.photos.size} foto attive`);
    } catch (error) {
      console.error("[FileStorage] Errore scansione:", error);
    }
  }

  private async save() {
    try {
      const photosArray = Array.from(this.photos.values());
      await fs.writeFile(this.dbPath, JSON.stringify(photosArray, null, 2), "utf-8");
      console.log(`[FileStorage] Database salvato: ${photosArray.length} foto`);
    } catch (error) {
      console.error("[FileStorage] Errore salvataggio database:", error);
    }
  }

  async getAllPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async getPhoto(id: string): Promise<Photo | undefined> {
    return this.photos.get(id);
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = randomUUID();
    const photo: Photo = {
      ...insertPhoto,
      id,
      uploadedAt: new Date(),
      inTrash: false,
    };
    this.photos.set(id, photo);
    await this.save();
    return photo;
  }

  async deletePhoto(id: string): Promise<boolean> {
    const result = this.photos.delete(id);
    if (result) {
      await this.save();
    }
    return result;
  }

  async moveToTrash(id: string): Promise<Photo | undefined> {
    const photo = this.photos.get(id);
    if (!photo) return undefined;
    
    photo.inTrash = true;
    this.photos.set(id, photo);
    await this.save();
    
    console.log(`[FileStorage] Foto spostata nel cestino: ${photo.filename}`);
    return photo;
  }

  async restoreFromTrash(id: string): Promise<Photo | undefined> {
    const photo = this.photos.get(id);
    if (!photo) return undefined;
    
    photo.inTrash = false;
    this.photos.set(id, photo);
    await this.save();
    
    console.log(`[FileStorage] Foto ripristinata dal cestino: ${photo.filename}`);
    return photo;
  }

  async emptyTrash(): Promise<number> {
    const trashedPhotos = Array.from(this.photos.values()).filter(p => p.inTrash);
    let deleted = 0;
    
    for (const photo of trashedPhotos) {
      try {
        const fullPath = path.join(this.uploadsDir, path.basename(photo.filepath));
        await fs.unlink(fullPath);
        this.photos.delete(photo.id);
        deleted++;
        console.log(`[FileStorage] Eliminata dal cestino: ${photo.filename}`);
      } catch (err) {
        console.error(`[FileStorage] Errore eliminazione ${photo.filename}:`, err);
      }
    }
    
    if (deleted > 0) {
      await this.save();
    }
    
    console.log(`[FileStorage] Cestino svuotato: ${deleted} foto eliminate`);
    return deleted;
  }
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/data/uploads";
const DB_PATH = process.env.DB_PATH || "/data/photos.json";

export const storage = new FileStorage(DB_PATH, UPLOAD_DIR);
