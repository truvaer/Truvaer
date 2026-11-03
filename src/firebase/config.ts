import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize the Firebase application
export const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const currentFirebaseProjectId = firebaseConfig.projectId;
export const currentFirestoreDatabaseId = firebaseConfig.firestoreDatabaseId;

// Official Universal Public URL (Accessible to all users worldwide)
export const PUBLIC_LIVE_URL = 'https://ais-pre-6vw3cse4l4yjwgjxlw4rpk-643333790710.asia-southeast1.run.app';

// Development Environment URL (For Developer & Admin Code Access)
export const DEV_APP_URL = 'https://ais-dev-6vw3cse4l4yjwgjxlw4rpk-643333790710.asia-southeast1.run.app';

// Development Account
export const DEV_ADMIN_EMAIL = 'aditya@yarifly.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await getDocFromServer(doc(firestore, 'test', 'connection'));
    return { success: true, message: 'Connected to Firestore Enterprise (' + firebaseConfig.projectId + ')' };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return { success: false, message: 'Client offline or network unreachable' };
    }
    // Attempt doc write to seed test connection doc if missing
    try {
      await setDoc(doc(firestore, 'test', 'connection'), {
        status: 'online',
        timestamp: new Date().toISOString(),
      });
      return { success: true, message: 'Connected to Firestore Enterprise' };
    } catch {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown connection error' };
    }
  }
}

// Automatically initiate health check connection test on boot
testConnection().then((res) => {
  if (res.success) {
    console.log('[Firebase HealthCheck] Successfully connected to Firestore:', res.message);
  } else {
    console.warn('[Firebase HealthCheck] Connection warning:', res.message);
  }
});

// Live Module Synchronization with Firestore Enterprise
export async function syncCustomCategoryToFirestore(request: {
  id: string;
  business_id: string;
  business_name?: string;
  category_name: string;
  sub_category_name: string;
  description?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  requested_by: string;
  requested_at?: string;
}) {
  try {
    const docRef = doc(firestore, 'customCategoryRequests', request.id);
    await setDoc(docRef, request, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firestore] Sync customCategoryRequest:', err);
    return false;
  }
}

export async function syncQuotationToFirestore(quote: {
  id: string;
  business_id: string;
  client_id: string;
  title: string;
  total_amount: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}) {
  try {
    const docRef = doc(firestore, 'quotations', quote.id);
    await setDoc(docRef, quote, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firestore] Sync quotation:', err);
    return false;
  }
}
