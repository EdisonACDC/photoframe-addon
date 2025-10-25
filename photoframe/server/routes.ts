import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { insertPhotoSchema } from "@shared/schema";

// Use UPLOAD_DIR from environment (set in run.sh to /data/uploads)
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and WebP are allowed."));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  });
  app.use("/uploads", (await import("express")).static(UPLOAD_DIR));

  app.get("/api/photos", async (req, res) => {
    try {
      const photos = await storage.getAllPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  app.get("/api/photos/:id", async (req, res) => {
    try {
      const photo = await storage.getPhoto(req.params.id);
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }
      res.json(photo);
    } catch (error) {
      console.error("Error fetching photo:", error);
      res.status(500).json({ error: "Failed to fetch photo" });
    }
  });

  app.post("/api/photos/upload", upload.array("photos", 50), async (req, res) => {
    try {
      console.log("[UPLOAD] Inizio upload, UPLOAD_DIR:", UPLOAD_DIR);
      
      const files = req.files as Express.Multer.File[];
      console.log("[UPLOAD] File ricevuti:", files?.length || 0);
      
      if (!files || files.length === 0) {
        console.error("[UPLOAD] Nessun file ricevuto");
        return res.status(400).json({ error: "No files uploaded" });
      }

      console.log("[UPLOAD] Elaborazione file...");
      const uploadedPhotos = await Promise.all(
        files.map(async (file) => {
          console.log("[UPLOAD] File:", file.originalname, "→", file.filename);
          const photoData = insertPhotoSchema.parse({
            filename: file.originalname,
            filepath: `/uploads/${file.filename}`,
          });
          const photo = await storage.createPhoto(photoData);
          console.log("[UPLOAD] Foto salvata:", photo.id);
          return photo;
        })
      );

      console.log("[UPLOAD] Upload completato:", uploadedPhotos.length, "foto");
      res.json(uploadedPhotos);
    } catch (error) {
      console.error("[UPLOAD] ERRORE:", error);
      console.error("[UPLOAD] Stack:", error instanceof Error ? error.stack : "N/A");
      res.status(500).json({ 
        error: "Failed to upload photos",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.delete("/api/photos/:id", async (req, res) => {
    try {
      const photo = await storage.getPhoto(req.params.id);
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }

      const filename = path.basename(photo.filepath);
      const filepath = path.join(UPLOAD_DIR, filename);
      try {
        await fs.unlink(filepath);
      } catch (error) {
        console.error("Error deleting file:", error);
      }

      const deleted = await storage.deletePhoto(req.params.id);
      if (!deleted) {
        return res.status(500).json({ error: "Failed to delete photo" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });

  app.patch("/api/photos/:id/trash", async (req, res) => {
    try {
      const photo = await storage.moveToTrash(req.params.id);
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }
      res.json(photo);
    } catch (error) {
      console.error("Error moving photo to trash:", error);
      res.status(500).json({ error: "Failed to move photo to trash" });
    }
  });

  app.patch("/api/photos/:id/restore", async (req, res) => {
    try {
      const photo = await storage.restoreFromTrash(req.params.id);
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }
      res.json(photo);
    } catch (error) {
      console.error("Error restoring photo:", error);
      res.status(500).json({ error: "Failed to restore photo" });
    }
  });

  app.post("/api/photos/empty-trash", async (req, res) => {
    try {
      const deletedCount = await storage.emptyTrash();
      res.json({ success: true, deletedCount });
    } catch (error) {
      console.error("Error emptying trash:", error);
      res.status(500).json({ error: "Failed to empty trash" });
    }
  });

  app.get("/api/slideshow/status", (req, res) => {
    res.json({ 
      playing: true,
      interval: 15 
    });
  });

  app.post("/api/slideshow/control", async (req, res) => {
    const { action, interval } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: "Action is required" });
    }

    res.json({ 
      success: true, 
      action,
      interval: interval || 15 
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
