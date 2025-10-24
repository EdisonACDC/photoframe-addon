import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { insertPhotoSchema } from "@shared/schema";

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
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
  app.use("/uploads", (await import("express")).static("uploads"));

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
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedPhotos = await Promise.all(
        files.map(async (file) => {
          const photoData = insertPhotoSchema.parse({
            filename: file.originalname,
            filepath: `/uploads/${file.filename}`,
          });
          return await storage.createPhoto(photoData);
        })
      );

      res.json(uploadedPhotos);
    } catch (error) {
      console.error("Error uploading photos:", error);
      res.status(500).json({ error: "Failed to upload photos" });
    }
  });

  app.delete("/api/photos/:id", async (req, res) => {
    try {
      const photo = await storage.getPhoto(req.params.id);
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }

      const filename = path.basename(photo.filepath);
      const filepath = path.join(process.cwd(), "uploads", filename);
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
