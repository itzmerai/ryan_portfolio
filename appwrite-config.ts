import * as Appwrite from "appwrite";

const endpoint = (import.meta.env.VITE_APPWRITE_ENDPOINT ?? "") as string;
const projectId = (import.meta.env.VITE_APPWRITE_PROJECT_ID ?? "") as string;

const client = new Appwrite.Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Appwrite.Account(client);
export const databases = new Appwrite.Databases(client);
export const storage = new Appwrite.Storage(client);
export const APPWRITE = { client, endpoint, projectId, ID: Appwrite.ID };

export const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
export const PROFILE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROFILE_COLLECTION_ID;
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;
export const ADMIN_USER_ID = import.meta.env.VITE_APPWRITE_ADMIN_USER_ID;

