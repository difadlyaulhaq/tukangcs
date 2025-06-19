import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp = null;
function getFirebaseAdmin() {
  if (adminApp) {
    return adminApp;
  }
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = getApp();
    return adminApp;
  }
  const projectId = "tukang-cs";
  const clientEmail = "firebase-adminsdk-fbsvc@tukang-cs.iam.gserviceaccount.com";
  const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQCiEFycvggJVkxo\nMaJQ6R/5aWFtcnTsVz1HY0B9ARFTpOvgW7YAUqFHXI0+6+T5z7ss81fDCgk4E8Dn\n2mfZ8+6QLHKs27zTUBYQS/lhEXwSvZPbd2TUhnqrZRsxMH60uaZ0/H5PUlYm4MEw\n3OiwThxooHplpOxs4QqiD64C3loTvtqIMSLNi+Nxr1k9l5gUq/RAEJ95O5iKzCv7\ncFiqRXSlD0MO48ekKPPKqKRScvigakog9g+gWVlMj/RNfwX49kP96BVB1/vA/OqX\n8DPCUJKHfG/2rN4raeEMPNQGKHIzoawOwtxUnWGCRgZt9XjK+vLFFuydhiYb0HoP\nGsy3b3NnAgMBAAECgf9uqQtcVOuMEHH6cMhqVbnH3M6C/gMmleWrpx+TzGQN9oly\nugtaevtXVTm4+nCn4LBuatxbVui8+A3yyI4V/Kx0VmrsLioJsQ92BifNieWjgh1j\nSWug1Bx0njaUe8XcdSrKf0VnMkZ07Ii7SZb9lEJMI82yg+VFUd9akgFFebseZlpO\nxJOws/teza2OmhO/AkrafDb6Q5UO6Owco2v7xciNxoT0JbVg6QWtIDrkuK4UtFaL\ndTxqxlae+vy5xpNder5b3QsEU4i0GUekrrOAlmVZI8poDuDF4DG3HqKGXTeUhZ4k\nTwYJUgNsJbfFh38ZMu2YE5Pai6p3gt11+WDZJH0CgYEA1sAh/b236Awy1xTXai58\nV3asVoAL2wShc4E5ibVISf1M0yvmEJ6Sgs7kR6Z8xbXzDe5/mpJIgEUWBgVz1xzB\nq0WZOVeckcPajh1s3Amb5HNvEs/i/zFi+FsdQBhaUBxIeDizLyUQ+B9IVeWd7Pv6\nJceCy8e5sKBhCvrBspSnn/UCgYEAwTF8OkNHvkoib1tgFxqPEQiQNyrZ6oPi3Ixu\ncRUthJgKmXrtVgpxp+86tZh0AYo7qOe41voexLXz7iOGHAeEsq5QTtyrgCrREwbX\nZZYnaO1p5rbhdZblwFEW6i+lL9SupjV9DGnpPRijtEfcU7dRHjkTMUUMGpoGnlWg\nTU2aOGsCgYAa5wLbGLM7PJv52cCKqrwk8NbyFyRlEZVwNNYSbEVcD4FaSvuNRXAx\nNt3eI/spgXurWR9fK8gtWXpC0tgKMK4KWLOzPUh98j0k5IbIoeOHoPZfMu/K7FLr\nre5iIyrdMk3Z0bCQzWHs025qZFN+ZqqVpQK7qI+Ykt7VU0iEqJ6/KQKBgGa0wR9U\nT1rJnL7orA/8TZy3mbvKaylyzfOEMN6rbJR2JARuRqicSsoFs4eBMgLzkz37Wtfn\nBt57AOBUQGK8WH6JjyYtyHsNyDK+S1q1VeRBezBtfzT9cM0qDu2XQNFJ10ODYiRs\nVdPmOnmIToivB0/y9dIWrBWkVupsCRmvrNJbAoGAXCJYY0DHbbRE6T2fTeGT5EtR\ntA7R9xEa95teBkirpkytwKksnj0mBIhgJc25Qi55nsGmLWcMln1vikjgZSLuXekf\n8e/4/Bh06qP5qK/ROJVT8S+/x+1jcNq3lchLZoiBbc4fS6AnJMayHdDwA49D7fGM\nE4HkimrkRCQ3DFOh0oc=\n-----END PRIVATE KEY-----\n";
  const privateKeyId = "14d8371c0374105279969f5e3d29522a17850f5b";
  console.log("Firebase Admin initialization:", {
    projectId: "✓" ,
    clientEmail: "✓" ,
    privateKey: `✓ (${privateKey.substring(0, 50)}...)` ,
    privateKeyId: "✓" 
  });
  try {
    let cleanPrivateKey = privateKey;
    if (cleanPrivateKey.startsWith('"') && cleanPrivateKey.endsWith('"')) {
      cleanPrivateKey = cleanPrivateKey.slice(1, -1);
    }
    cleanPrivateKey = cleanPrivateKey.replace(/\\n/g, "\n");
    const firebaseConfig = {
      type: "service_account",
      project_id: projectId,
      private_key_id: privateKeyId,
      private_key: cleanPrivateKey,
      client_email: clientEmail,
      client_id: "112435870433554933388",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tukang-cs.iam.gserviceaccount.com"
    };
    adminApp = initializeApp({
      credential: cert(firebaseConfig),
      projectId
    });
    console.log("Firebase Admin initialized successfully for project:", projectId);
    return adminApp;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    if (error instanceof Error) {
      throw new Error(`Firebase Admin initialization failed: ${error.message}`);
    } else {
      throw new Error("Firebase Admin initialization failed: Unknown error");
    }
  }
}
const app = getFirebaseAdmin();
const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { adminAuth as a, adminDb as b };
