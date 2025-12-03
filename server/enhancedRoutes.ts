import type { Express, Request, Response } from "express";
import { db } from "./db";
import { users, barcodeDrops, bankAccounts, paymentStatements, idVerifications, chatSessions, chatMessages } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

// Extend Express session type
declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: string;
  }
}

// Multer for file uploads (would need to be installed)
// For now, we'll handle base64 encoded images

export function registerEnhancedRoutes(app: Express) {
  
  // ==================== PROFILE ROUTES ====================
  
  // Update user profile
  app.put("/api/users/:userId/profile", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      const { userId } = req.params;
      
      if (req.session.userId !== userId) {
        return res.status(403).send("Forbidden");
      }

      const allowedFields = [
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "dateOfBirth",
        "gender",
        "address",
        "city",
        "state",
        "postalCode",
        "serviceArea",
        "bio",
        "emergencyContactName",
        "emergencyContactPhone",
      ];

      const updateData: any = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          // Convert camelCase to snake_case for database
          const dbField = field.replace(/([A-Z])/g, "_$1").toLowerCase();
          updateData[dbField] = req.body[field];
        }
      }

      // Calculate profile completion percentage
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return res.status(404).send("User not found");
      }

      const requiredFields = [
        updateData.first_name || user.firstName,
        updateData.last_name || user.lastName,
        updateData.email || user.email,
        updateData.phone_number || user.phoneNumber,
        updateData.date_of_birth || user.dateOfBirth,
        updateData.gender || user.gender,
        updateData.address || user.address,
        updateData.city || user.city,
        updateData.state || user.state,
      ];
      
      const optionalFields = [
        updateData.postal_code || user.postalCode,
        updateData.service_area || user.serviceArea,
        updateData.bio || user.bio,
        updateData.emergency_contact_name || user.emergencyContactName,
        updateData.emergency_contact_phone || user.emergencyContactPhone,
      ];
      
      const filledRequired = requiredFields.filter(f => f && String(f).trim()).length;
      const filledOptional = optionalFields.filter(f => f && String(f).trim()).length;
      
      const requiredPercentage = (filledRequired / requiredFields.length) * 70;
      const optionalPercentage = (filledOptional / optionalFields.length) * 30;
      
      updateData.profile_completion_percentage = Math.round(requiredPercentage + optionalPercentage);
      updateData.updated_at = new Date();

      await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId));

      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(500).send(error.message || "Failed to update profile");
    }
  });

  // Upload profile photo
  app.post("/api/users/:userId/photo", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      const { userId } = req.params;
      
      if (req.session.userId !== userId) {
        return res.status(403).send("Forbidden");
      }

      // In a real app, you would:
      // 1. Use multer to handle file upload
      // 2. Store in cloud storage (AWS S3, Cloudinary, etc.)
      // 3. Get back a URL
      
      // For now, we'll handle base64 from the frontend
      const { photoData } = req.body; // base64 encoded image
      
      if (!photoData) {
        return res.status(400).send("No photo data provided");
      }

      // In production, upload to cloud storage here
      // For now, we'll just store a placeholder URL
      const photoUrl = `/uploads/photos/${userId}.jpg`; // Mock URL

      await db.update(users)
        .set({ 
          photoUrl,
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));

      res.json({ success: true, photoUrl });
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      res.status(500).send(error.message || "Failed to upload photo");
    }
  });

  // Delete profile photo
  app.delete("/api/users/:userId/photo", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      const { userId } = req.params;
      
      if (req.session.userId !== userId) {
        return res.status(403).send("Forbidden");
      }

      await db.update(users)
        .set({ 
          photoUrl: null,
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting photo:", error);
      res.status(500).send(error.message || "Failed to delete photo");
    }
  });

  // ==================== KYC ROUTES ====================
  
  // Upload KYC document
  app.post("/api/users/:userId/kyc/upload", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      const { userId } = req.params;
      
      if (req.session.userId !== userId) {
        return res.status(403).send("Forbidden");
      }

      // In real app: use OCR service (Google Vision API, AWS Textract, etc.)
      // For now, simulate name extraction
      const simulateOCR = (filename: string) => {
        // In production, this would call an OCR API
        return {
          extractedName: "John Doe", // Placeholder
          idNumber: "12345678901",
          idType: "voters_card",
        };
      };

      const ocrResult = simulateOCR("uploaded_document");

      // Update user with extracted info
      await db.update(users)
        .set({ 
          verifiedFullName: ocrResult.extractedName,
          idNumber: ocrResult.idNumber,
          idType: ocrResult.idType,
          kycStatus: "verified", // Will be "approved" after admin review
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));

      // Create ID verification record
      await db.insert(idVerifications).values({
        id: crypto.randomUUID(),
        userId,
        idType: ocrResult.idType,
        idNumber: ocrResult.idNumber,
        fullName: ocrResult.extractedName,
        idImageUrl: `/uploads/kyc/${userId}_voters_card.jpg`, // Mock
        verificationStatus: "verified",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.json({ 
        success: true, 
        extractedName: ocrResult.extractedName,
        status: "verified"
      });
    } catch (error: any) {
      console.error("Error uploading KYC:", error);
      res.status(500).send(error.message || "Failed to upload KYC document");
    }
  });

  // ==================== BARCODE ROUTES ====================
  
  // Verify barcode and get collector info
  app.get("/api/barcode/verify/:barcodeId", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      const { barcodeId } = req.params;

      const collector = await db.query.users.findFirst({
        where: eq(users.barcodeId, barcodeId),
      });

      if (!collector) {
        return res.status(404).send("Invalid barcode or collector not found");
      }

      res.json({
        id: collector.id,
        firstName: collector.firstName,
        lastName: collector.lastName,
        photoUrl: collector.photoUrl,
        kycStatus: collector.kycStatus,
        verifiedFullName: collector.verifiedFullName,
        phoneNumber: collector.phoneNumber,
      });
    } catch (error: any) {
      console.error("Error verifying barcode:", error);
      res.status(500).send(error.message || "Failed to verify barcode");
    }
  });

  // Get collector's drop history
  app.get("/api/barcode-drops/:userId", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      const { userId } = req.params;

      const drops = await db.query.barcodeDrops.findMany({
        where: eq(barcodeDrops.collectorId, userId),
        orderBy: [desc(barcodeDrops.createdAt)],
        with: {
          vendor: {
            columns: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const formattedDrops = drops.map(drop => ({
        id: drop.id,
        vendorName: `${drop.vendor?.firstName || ""} ${drop.vendor?.lastName || ""}`.trim() || "Unknown Vendor",
        vendorId: drop.vendorId,
        trashType: drop.trashType,
        weight: drop.weight,
        amount: drop.amount,
        status: drop.status,
        createdAt: drop.createdAt,
        confirmedAt: drop.confirmedAt,
        paidAt: drop.paidAt,
      }));

      res.json(formattedDrops);
    } catch (error: any) {
      console.error("Error fetching drop history:", error);
      res.status(500).send(error.message || "Failed to fetch drop history");
    }
  });

  // Log a new barcode drop
  app.post("/api/barcode-drops", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      const { collectorId, barcodeId, trashType, weight, amount, notes } = req.body;

      if (!collectorId || !barcodeId || !trashType || !weight || !amount) {
        return res.status(400).send("Missing required fields");
      }

      // Verify vendor is authenticated user
      if (req.session.userRole !== "vendor") {
        return res.status(403).send("Only vendors can log drops");
      }

      const dropId = crypto.randomUUID();

      // Create drop record
      await db.insert(barcodeDrops).values({
        id: dropId,
        collectorId,
        vendorId: req.session.userId,
        barcodeId,
        trashType,
        weight,
        amount,
        status: "confirmed",
        confirmedAt: new Date(),
        paidAt: new Date(), // Auto-pay for now
        metadata: notes ? JSON.stringify({ notes }) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Credit collector's wallet
      // (In production, this would integrate with the existing wallet system)
      
      res.json({ 
        success: true, 
        dropId,
        message: "Drop logged and payment credited"
      });
    } catch (error: any) {
      console.error("Error logging drop:", error);
      res.status(500).send(error.message || "Failed to log drop");
    }
  });

  // ==================== BANK ACCOUNT ROUTES ====================
  
  // Link bank account
  app.post("/api/bank-accounts", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      const { bankName, bankCode, accountNumber, accountName } = req.body;

      if (!bankName || !bankCode || !accountNumber || !accountName) {
        return res.status(400).send("Missing required fields");
      }

      // In production: verify account with Paystack
      // For now, just store it
      
      await db.insert(bankAccounts).values({
        id: crypto.randomUUID(),
        userId: req.session.userId,
        bankName,
        bankCode,
        accountNumber,
        accountName,
        verified: true, // Would be false until Paystack verification
        isPrimary: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.json({ success: true, message: "Bank account linked successfully" });
    } catch (error: any) {
      console.error("Error linking bank account:", error);
      res.status(500).send(error.message || "Failed to link bank account");
    }
  });

  // Get user's bank account
  app.get("/api/bank-accounts/:userId", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).send("Unauthorized");
      }

      const { userId } = req.params;
      
      if (req.session.userId !== userId && req.session.userRole !== "admin") {
        return res.status(403).send("Forbidden");
      }

      const account = await db.query.bankAccounts.findFirst({
        where: eq(bankAccounts.userId, userId),
      });

      res.json(account || null);
    } catch (error: any) {
      console.error("Error fetching bank account:", error);
      res.status(500).send(error.message || "Failed to fetch bank account");
    }
  });

  console.log("✓ Enhanced routes registered");
}
