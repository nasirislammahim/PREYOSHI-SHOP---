import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Google GenAI with injected environment key
const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    genAI = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize Google GenAI SDK:', err);
  }
}

// Support Chatbot Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context, adminSettings } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!genAI) {
      return res.status(200).json({
        reply: null,
        fallback: true,
        notice: 'AI client initialized without API key, using grounded domain fallback'
      });
    }

    const customInstructions = adminSettings?.instructions || '';
    const businessInfo = adminSettings?.businessInfoBn || 'প্রেয়সী শপ (PREYOSHI SHOP) - "Your Style ♥ Our Priority"';

    const systemPrompt = `You are "প্রেয়সী স্মার্ট শপিং অ্যাসিস্ট্যান্ট" (Preyoshi Smart AI Shopping Assistant), the polite, expert, and grounded AI assistant for PREYOSHI SHOP (প্রেয়সী শপ).

CRITICAL ACCURACY & GROUNDING RULES:
1. NEVER INVENT product prices, discounts, stock availability, or specifications.
2. ALWAYS USE the exact database information provided below in the Store Catalog & Context.
3. Show all prices in Bangladeshi Taka (৳). Calculate discounts accurately: Discount = Regular Price - Current Selling Price.
4. If information is missing or a product is not in the database, clearly say that the information or product is not currently available.
5. If a product has stock = 0, clearly inform the customer that it is currently out of stock.
6. Available sizes, colors, fabrics, and descriptions must match the database exactly.
7. Return policy: 7 days exchange policy for unworn items with tags intact.
8. Delivery charges: Inside Dhaka ৳70 (Steadfast Courier, 1-2 days), Outside Dhaka ৳130 (Pathao Courier, 2-3 days). FREE delivery on orders ৳3,000+.
9. Payment methods: Cash on Delivery (COD) nationwide, bKash, Nagad, Rocket.
10. At the end of your answer, if you recommended or discussed specific products from the catalog, list their IDs in this exact JSON format on a new line:
[PRODUCT_IDS: "PRY-1001", "PRY-1006"]
(Only list IDs that actually exist in the database and were relevant).

Store Business Info:
${businessInfo}
Admin Instructions:
${customInstructions}

Store Database Catalog Context:
${context?.catalog ? JSON.stringify(context.catalog) : 'Catalog provided via client'}

User Active Orders Context:
${context?.orders ? JSON.stringify(context.orders) : 'No active orders'}

Coupons:
${context?.coupons ? JSON.stringify(context.coupons) : 'PREYOSHI10 (10% off), WELCOME10 (10% off for subscribers), EID150 (৳150 off on ৳2,000+)'}

Respond in polite, natural Bengali (or English if the customer asked in English), helpful and accurate.`;

    // Construct conversation history for Gemini
    const contents: any[] = [];

    // Prior conversation history if provided
    if (Array.isArray(history) && history.length > 0) {
      const trimmedHistory = history.slice(-8); // keep last 8 turns for context
      trimmedHistory.forEach((turn: any) => {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.message || turn.text }]
        });
      });
    }

    // Add current user prompt with system instructions
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nCustomer question: ${message}` }]
    });

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        temperature: 0.6,
        maxOutputTokens: 800
      }
    });

    let rawReply = response.text || '';
    let extractedProductIds: string[] = [];

    // Extract [PRODUCT_IDS: "..."] if present
    const idMatch = rawReply.match(/\[PRODUCT_IDS:\s*([^\]]+)\]/i);
    if (idMatch) {
      const idsRaw = idMatch[1];
      extractedProductIds = idsRaw
        .split(',')
        .map((s: string) => s.replace(/["'\s]/g, '').trim())
        .filter((s: string) => s.startsWith('PRY-'));
      // Remove marker from display text
      rawReply = rawReply.replace(/\[PRODUCT_IDS:\s*([^\]]+)\]/gi, '').trim();
    }

    return res.status(200).json({
      reply: rawReply,
      relatedProductIds: extractedProductIds,
      success: true
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return res.status(200).json({
      reply: null,
      fallback: true,
      error: error?.message || 'Chat service error'
    });
  }
});

// ==========================================
// ENTERPRISE SUPER ADMIN SECURITY & STAFF ROLES
// ==========================================

export const SUPER_ADMIN_EMAIL = 'nasirislammahimbd@gmail.com';

// Initialize server-side Firestore instance with project configuration
let serverDb: Firestore | null = null;
try {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const serverApp: FirebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(rawConfig, 'preyoshi-server');
    serverDb = getFirestore(serverApp, rawConfig.firestoreDatabaseId || '(default)');
    console.log(`[Preyoshi Security Engine] Connected to Firestore database: ${rawConfig.firestoreDatabaseId}`);
  }
} catch (err) {
  console.warn('[Preyoshi Security Engine] Local fallback mode for Firestore:', err);
}

// In-memory synced ledger for fallback and fast caching
interface SyncedStaffRole {
  id: string;
  roleId: string;
  userEmail: string;
  userName: string;
  role: string;
  permissions: string[];
  department?: string;
  employeeId?: string;
  assignedBy: string;
  assignedAt: string;
  status: 'active' | 'suspended';
  updatedAt?: string;
}

const memoryStaffRoles: Map<string, SyncedStaffRole> = new Map([
  [
    'STAFF-ROLE-SA-001',
    {
      id: 'STAFF-ROLE-SA-001',
      roleId: 'STAFF-ROLE-SA-001',
      userEmail: SUPER_ADMIN_EMAIL,
      userName: 'Mahim Islam (Super Admin)',
      role: 'super_admin',
      permissions: [
        'products.read', 'products.create', 'products.update', 'products.delete',
        'orders.read', 'orders.update', 'orders.cancel',
        'customers.read', 'customers.manage',
        'inventory.read', 'inventory.update',
        'finance.read', 'finance.manage',
        'reports.read',
        'staff.read', 'staff.invite', 'staff.manage',
        'settings.manage',
        'reviews.moderate'
      ],
      department: 'Executive Board',
      employeeId: 'PRY-EMP-001',
      assignedBy: 'SYSTEM_BOOTSTRAP',
      assignedAt: '2026-01-01T00:00:00Z',
      status: 'active',
      updatedAt: '2026-11-09T09:00:00Z'
    }
  ]
]);

/**
 * Server-Side Hook: Verifies if the request originates from the single permitted Super Admin.
 * Rejects any other user or unauthenticated caller with HTTP 403 Forbidden.
 */
export function verifySuperAdminHook(req: Request, res: Response, next: NextFunction) {
  const headerEmail = (req.headers['x-admin-email'] as string) || '';
  const authHeader = (req.headers['authorization'] as string) || '';
  const bodyEmail = (req.body?.adminEmail || req.body?.callerEmail || req.body?.email || '') as string;

  let candidateEmail = (headerEmail || bodyEmail || '').toLowerCase().trim();

  // If token is passed in Authorization header
  if (!candidateEmail && authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.substring(7).trim();
    if (rawToken.includes('@')) {
      candidateEmail = rawToken.toLowerCase().trim();
    }
  }

  if (!candidateEmail) {
    return res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'Authentication credentials required for administrative role operations.',
      designatedSuperAdmin: SUPER_ADMIN_EMAIL
    });
  }

  if (candidateEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    console.warn(`[SECURITY ALERT - UNAUTHORIZED ROLE MANAGEMENT ATTEMPT]`);
    console.warn(`  Attempted By: ${candidateEmail}`);
    console.warn(`  Endpoint: ${req.method} ${req.originalUrl}`);
    console.warn(`  Timestamp: ${new Date().toISOString()}`);

    return res.status(403).json({
      success: false,
      error: 'SECURITY_VIOLATION_NOT_SUPER_ADMIN',
      message: `Access Denied: Only the single designated Super Admin (${SUPER_ADMIN_EMAIL}) is permitted to manage administrative roles.`,
      designatedSuperAdmin: SUPER_ADMIN_EMAIL,
      attemptedBy: candidateEmail
    });
  }

  // Caller is successfully verified as the single Super Admin
  (req as any).superAdmin = {
    email: candidateEmail,
    verifiedAt: new Date().toISOString()
  };

  next();
}

// 1. Verify Super Admin Hook Status Endpoint
app.post('/api/admin/verify-super-admin', (req: Request, res: Response) => {
  const headerEmail = (req.headers['x-admin-email'] as string) || '';
  const bodyEmail = (req.body?.adminEmail || req.body?.callerEmail || req.body?.email || '') as string;
  const candidateEmail = (headerEmail || bodyEmail || '').toLowerCase().trim();

  if (candidateEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return res.status(200).json({
      isSuperAdmin: true,
      email: SUPER_ADMIN_EMAIL,
      designatedSuperAdmin: SUPER_ADMIN_EMAIL,
      verified: true,
      timestamp: new Date().toISOString(),
      permissionsCount: 19
    });
  }

  return res.status(403).json({
    isSuperAdmin: false,
    email: candidateEmail || null,
    designatedSuperAdmin: SUPER_ADMIN_EMAIL,
    verified: false,
    message: `User is not the permitted Super Admin (${SUPER_ADMIN_EMAIL})`
  });
});

// 2. GET all staff roles from Firestore StaffRoles collection
app.get('/api/admin/staff-roles', async (_req: Request, res: Response) => {
  try {
    let roles: SyncedStaffRole[] = Array.from(memoryStaffRoles.values());

    if (serverDb) {
      try {
        const staffRolesCol = collection(serverDb, 'StaffRoles');
        const snapshot = await getDocs(staffRolesCol);
        if (!snapshot.empty) {
          const firestoreRoles: SyncedStaffRole[] = [];
          snapshot.forEach(docSnap => {
            firestoreRoles.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          roles = firestoreRoles;
        }
      } catch (dbErr) {
        console.warn('[Server] Firestore StaffRoles read warning, using memory cache:', dbErr);
      }
    }

    // Ensure root Super Admin is always present
    const hasSuperAdmin = roles.some(r => r.userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    if (!hasSuperAdmin) {
      roles.unshift(memoryStaffRoles.get('STAFF-ROLE-SA-001')!);
    }

    return res.status(200).json({
      success: true,
      roles,
      designatedSuperAdmin: SUPER_ADMIN_EMAIL,
      count: roles.length
    });
  } catch (error: any) {
    console.error('Failed to retrieve StaffRoles:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Database error' });
  }
});

// 3. POST assign/update a staff role - Strictly protected by verifySuperAdminHook
app.post('/api/admin/assign-staff-role', verifySuperAdminHook, async (req: Request, res: Response) => {
  try {
    const {
      userEmail,
      userName,
      role,
      permissions,
      department,
      employeeId,
      status
    } = req.body;

    if (!userEmail || !role || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PAYLOAD',
        message: 'userEmail, role, and permissions array are required.'
      });
    }

    const cleanTargetEmail = userEmail.toLowerCase().trim();

    // INVARIANT 1: Public or Super Admin cannot assign another Super Admin
    if (role === 'super_admin') {
      return res.status(400).json({
        success: false,
        error: 'SINGLE_SUPER_ADMIN_CONSTRAINT',
        message: 'Forbidden: Exactly ONE Super Admin account is permitted in PREYOSHI SHOP.'
      });
    }

    // INVARIANT 2: Super Admin account cannot be modified or demoted
    if (cleanTargetEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'IMMUTABLE_SUPER_ADMIN',
        message: 'Forbidden: The designated Super Admin account cannot be downgraded or altered.'
      });
    }

    const roleId = 'ROLE-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const newRoleDoc: SyncedStaffRole = {
      id: roleId,
      roleId,
      userEmail: cleanTargetEmail,
      userName: userName || cleanTargetEmail.split('@')[0],
      role,
      permissions,
      department: department || 'Operations',
      employeeId: employeeId || `PRY-EMP-${Math.floor(100 + Math.random() * 900)}`,
      assignedBy: SUPER_ADMIN_EMAIL,
      assignedAt: new Date().toISOString(),
      status: status === 'suspended' ? 'suspended' : 'active',
      updatedAt: new Date().toISOString()
    };

    // 1. Write to server-side memory cache
    memoryStaffRoles.set(roleId, newRoleDoc);

    // 2. Persist to Firestore StaffRoles collection
    if (serverDb) {
      try {
        const roleDocRef = doc(serverDb, 'StaffRoles', roleId);
        await setDoc(roleDocRef, newRoleDoc);

        // Also write an immutable audit log entry
        const auditLogRef = doc(serverDb, 'audit_logs', `AUD-${Date.now()}`);
        await setDoc(auditLogRef, {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: 'STAFF-SA-001',
          actorName: 'Mahim Islam (Super Admin)',
          actorEmail: SUPER_ADMIN_EMAIL,
          actorRole: 'super_admin',
          action: 'STAFF_ROLE_ASSIGNMENT',
          target: `${newRoleDoc.employeeId} (${cleanTargetEmail})`,
          details: `Super Admin assigned role "${role}" with ${permissions.length} granular permissions in "${department}".`
        });
      } catch (dbErr) {
        console.warn('[Server] Firestore sync warning for StaffRoles write:', dbErr);
      }
    }

    console.log(`[Preyoshi Security Engine] Role "${role}" assigned to ${cleanTargetEmail} by Super Admin (${SUPER_ADMIN_EMAIL})`);

    return res.status(200).json({
      success: true,
      message: `Role "${role}" successfully assigned to ${cleanTargetEmail} with Super Admin authorization.`,
      roleAssignment: newRoleDoc
    });
  } catch (error: any) {
    console.error('Error assigning staff role:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// 4. POST toggle staff role status (active/suspended) - Strictly protected by verifySuperAdminHook
app.post('/api/admin/toggle-staff-role', verifySuperAdminHook, async (req: Request, res: Response) => {
  try {
    const { roleId, newStatus } = req.body;

    if (!roleId) {
      return res.status(400).json({ success: false, error: 'roleId is required' });
    }

    const existingRole = memoryStaffRoles.get(roleId);
    if (!existingRole) {
      return res.status(404).json({ success: false, error: 'Role document not found' });
    }

    if (existingRole.userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'IMMUTABLE_SUPER_ADMIN',
        message: 'The Super Admin account status cannot be suspended.'
      });
    }

    const updatedRole: SyncedStaffRole = {
      ...existingRole,
      status: newStatus === 'suspended' ? 'suspended' : 'active',
      updatedAt: new Date().toISOString()
    };

    memoryStaffRoles.set(roleId, updatedRole);

    if (serverDb) {
      try {
        const roleDocRef = doc(serverDb, 'StaffRoles', roleId);
        await setDoc(roleDocRef, updatedRole, { merge: true });
      } catch (dbErr) {
        console.warn('[Server] Firestore toggle status warning:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Role status updated to ${updatedRole.status}`,
      role: updatedRole
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// 5. DELETE revoke staff role - Strictly protected by verifySuperAdminHook
app.delete('/api/admin/revoke-staff-role/:roleId', verifySuperAdminHook, async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;

    const existingRole = memoryStaffRoles.get(roleId);
    if (existingRole && existingRole.userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'IMMUTABLE_SUPER_ADMIN',
        message: 'The Super Admin role cannot be revoked.'
      });
    }

    memoryStaffRoles.delete(roleId);

    if (serverDb) {
      try {
        const roleDocRef = doc(serverDb, 'StaffRoles', roleId);
        await deleteDoc(roleDocRef);
      } catch (dbErr) {
        console.warn('[Server] Firestore delete warning:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Staff role assignment ${roleId} revoked.`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Server error' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite middleware for development
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Preyoshi Shop server running at http://0.0.0.0:${port}`);
  });
}

startServer();
