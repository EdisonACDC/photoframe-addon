// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  photos;
  constructor() {
    this.photos = /* @__PURE__ */ new Map();
  }
  async getAllPhotos() {
    return Array.from(this.photos.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }
  async getPhoto(id) {
    return this.photos.get(id);
  }
  async createPhoto(insertPhoto) {
    const id = randomUUID();
    const photo = {
      ...insertPhoto,
      id,
      uploadedAt: /* @__PURE__ */ new Date()
    };
    this.photos.set(id, photo);
    return photo;
  }
  async deletePhoto(id) {
    return this.photos.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull()
});
var insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true
});

// server/routes.ts
var upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
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
    fileSize: 10 * 1024 * 1024
    // 10MB
  }
});
async function registerRoutes(app2) {
  app2.use("/uploads", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  });
  app2.use("/uploads", (await import("express")).static("uploads"));
  app2.get("/api/photos", async (req, res) => {
    try {
      const photos2 = await storage.getAllPhotos();
      res.json(photos2);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });
  app2.get("/api/photos/:id", async (req, res) => {
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
  app2.post("/api/photos/upload", upload.array("photos", 50), async (req, res) => {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      const uploadedPhotos = await Promise.all(
        files.map(async (file) => {
          const photoData = insertPhotoSchema.parse({
            filename: file.originalname,
            filepath: `/uploads/${file.filename}`
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
  app2.delete("/api/photos/:id", async (req, res) => {
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
  app2.get("/api/slideshow/status", (req, res) => {
    res.json({
      playing: true,
      interval: 15
    });
  });
  app2.post("/api/slideshow/control", async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var APP_ROOT = process.env.APP_ROOT || process.cwd();
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(APP_ROOT, "client", "src"),
      "@shared": path2.resolve(APP_ROOT, "shared"),
      "@assets": path2.resolve(APP_ROOT, "attached_assets")
    }
  },
  root: path2.resolve(APP_ROOT, "client"),
  build: {
    outDir: path2.resolve(APP_ROOT, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var APP_ROOT2 = process.env.APP_ROOT || "/app";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        APP_ROOT2,
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(APP_ROOT2, "dist", "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
