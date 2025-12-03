import type { Express } from "express";
import { storage } from "./storage";
import { insertEventGalleryEventSchema, insertEventGalleryMediaSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads", "events");

// Ensure upload directory exists
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error as Error, uploadDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `event-${uniqueSuffix}${ext}`);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF) and videos (MP4, MOV, AVI, WEBM) are allowed!'));
    }
  }
});

export function registerEventGalleryRoutes(app: Express) {
  // Middleware to check if user is admin
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
  };

  // Get all events (public)
  app.get("/api/event-gallery/events", async (req, res) => {
    try {
      const { category, featured } = req.query;
      const events = await storage.getEventGalleryEvents({
        category: category as string | undefined,
        featured: featured === "true" ? true : featured === "false" ? false : undefined,
      });
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get single event with media (public)
  app.get("/api/event-gallery/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getEventGalleryEventById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Create new event (admin only)
  app.post("/api/event-gallery/events", isAdmin, async (req: any, res) => {
    try {
      const validatedData = insertEventGalleryEventSchema.parse({
        ...req.body,
        uploadedBy: req.user.id,
      });

      const event = await storage.createEventGalleryEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Update event (admin only)
  app.patch("/api/event-gallery/events/:id", isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const event = await storage.updateEventGalleryEvent(id, updateData);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Delete event (admin only)
  app.delete("/api/event-gallery/events/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteEventGalleryEvent(id);
      if (!result) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Upload media for an event (admin only)
  app.post("/api/event-gallery/events/:id/media", isAdmin, upload.array("files", 10), async (req: any, res) => {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Check if event exists
      const event = await storage.getEventGalleryEventById(id);
      if (!event) {
        // Clean up uploaded files
        await Promise.all(files.map(file => fs.unlink(file.path).catch(console.error)));
        return res.status(404).json({ message: "Event not found" });
      }

      // Create media records
      const mediaItems = await Promise.all(
        files.map(async (file) => {
          const isVideo = file.mimetype.startsWith("video/");
          const mediaData: Omit<any, "id" | "createdAt"> = {
            eventId: id,
            type: (isVideo ? "video" : "photo") as "video" | "photo",
            url: `/uploads/events/${file.filename}`,
            thumbnailUrl: isVideo ? `/uploads/events/${file.filename}-thumb.jpg` : undefined,
            caption: req.body[`caption_${file.filename}`] || "",
            duration: isVideo ? req.body[`duration_${file.filename}`] : undefined,
            order: parseInt(req.body[`order_${file.filename}`] || "0"),
            uploadedBy: req.user.id,
          };

          return storage.createEventGalleryMedia(mediaData);
        })
      );

      res.status(201).json(mediaItems);
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ message: "Failed to upload media" });
    }
  });

  // Get media for an event (public)
  app.get("/api/event-gallery/events/:id/media", async (req, res) => {
    try {
      const { id } = req.params;
      const media = await storage.getEventGalleryMediaByEventId(id);
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  // Delete media (admin only)
  app.delete("/api/event-gallery/media/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const media = await storage.getEventGalleryMediaById(id);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }

      // Delete file from disk
      const filePath = path.join(process.cwd(), media.url);
      await fs.unlink(filePath).catch(console.error);

      // Delete thumbnail if video
      if (media.type === "video" && media.thumbnailUrl) {
        const thumbPath = path.join(process.cwd(), media.thumbnailUrl);
        await fs.unlink(thumbPath).catch(console.error);
      }

      // Delete from database
      const result = await storage.deleteEventGalleryMedia(id);
      if (!result) {
        return res.status(404).json({ message: "Media not found" });
      }

      res.json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  console.log("✓ Event Gallery routes registered");
}
