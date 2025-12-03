import crypto from "crypto";
import { db } from "./db";
import { paymentRates } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Generate a unique transaction token
 * Format: TRX-YYYY-TYPE-XXXXX
 * Example: TRX-2025-PLST-A7B9C
 */
export function generateTransactionToken(trashType: string): string {
  const year = new Date().getFullYear();
  const typeCode = getTrashTypeCode(trashType);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 5);
  
  return `TRX-${year}-${typeCode}-${random}`;
}

/**
 * Get trash type code for token
 */
function getTrashTypeCode(trashType: string): string {
  const codes: Record<string, string> = {
    'plastic': 'PLST',
    'metal': 'METL',
    'organic': 'ORGN',
    'paper': 'PAPR',
    'glass': 'GLAS',
    'electronic': 'ELEC',
    'textile': 'TEXT',
  };
  
  return codes[trashType.toLowerCase()] || 'OTHR';
}

/**
 * Validate token format
 */
export function isValidTokenFormat(token: string): boolean {
  const pattern = /^TRX-\d{4}-[A-Z]{4}-[A-Z0-9]{5}$/;
  return pattern.test(token);
}

/**
 * Add entry to audit trail
 */
export function addAuditEntry(
  currentTrail: any[],
  action: string,
  userId: string,
  metadata?: any
): any[] {
  const entry = {
    action,
    userId,
    timestamp: new Date().toISOString(),
    metadata: metadata || {},
  };
  
  return [...currentTrail, entry];
}

/**
 * Calculate payment amount based on trash type and weight
 * Uses admin-editable rates from database
 */
export async function calculatePayment(trashType: string, weight: number): Promise<number> {
  try {
    // Get rate from database using SQL template
    const rates = await db
      .select()
      .from(paymentRates)
      .where(sql`${paymentRates.trashType} = ${trashType}`);
    
    const rate = rates[0];
    if (rate && rate.isActive) {
      return Math.round(weight * rate.ratePerKg * 100) / 100; // Round to 2 decimal places
    }
    
    // Fallback to default rate if not found
    return Math.round(weight * 40 * 100) / 100;
  } catch (error) {
    console.error("Error calculating payment:", error);
    // Fallback rate
    return Math.round(weight * 40 * 100) / 100;
  }
}

/**
 * Get payment rate per ton for factory billing
 */
export async function getRatePerTon(trashType: string): Promise<number> {
  try {
    const rates = await db
      .select()
      .from(paymentRates)
      .where(sql`${paymentRates.trashType} = ${trashType}`);
    
    const rate = rates[0];
    if (rate && rate.isActive) {
      return rate.ratePerTon;
    }
    
    // Fallback to default
    return 80000; // ₦80,000 per ton
  } catch (error) {
    console.error("Error getting rate per ton:", error);
    return 80000;
  }
}

/**
 * Verify transaction integrity
 */
export function verifyTransactionIntegrity(transaction: any): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check required fields
  if (!transaction.token || !isValidTokenFormat(transaction.token)) {
    issues.push("Invalid token format");
  }
  
  if (!transaction.collectorId) {
    issues.push("Missing collector ID");
  }
  
  if (!transaction.vendorId) {
    issues.push("Missing vendor ID");
  }
  
  if (!transaction.weight || transaction.weight <= 0) {
    issues.push("Invalid weight");
  }
  
  if (!transaction.trashType) {
    issues.push("Missing trash type");
  }
  
  // Check for suspicious patterns
  if (transaction.weight > 1000) {
    issues.push("Unusually high weight (>1000kg) - requires verification");
  }
  
  // Check timestamp integrity
  const auditTrail = transaction.auditTrail || [];
  if (auditTrail.length > 0) {
    const timestamps = auditTrail.map((e: any) => new Date(e.timestamp).getTime());
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] < timestamps[i - 1]) {
        issues.push("Audit trail timestamps out of order");
        break;
      }
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}
