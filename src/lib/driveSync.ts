/**
 * Google Drive sync for LoveNest - stores couple data in a shared Google Drive file.
 * Uses Google Identity Services (GIS) for auth and Drive API v3 for file operations.
 * The sync file is stored in appDataFolder (hidden from user's Drive UI).
 */

const CLIENT_ID = ''; // User must set this in Settings
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const SYNC_FILENAME = 'lovenest-sync.json';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let accessToken: string | null = null;

// Check if Google API scripts are loaded
function isGapiLoaded(): boolean {
  return typeof google !== 'undefined' && !!google?.accounts?.oauth2;
}

export function setClientId(id: string) {
  localStorage.setItem('lovenest-drive-client-id', id);
}

export function getClientId(): string {
  return localStorage.getItem('lovenest-drive-client-id') || '';
}

export function isConnected(): boolean {
  return !!accessToken;
}

export async function initDriveAuth(): Promise<boolean> {
  const clientId = getClientId();
  if (!clientId || !isGapiLoaded()) return false;

  return new Promise((resolve) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          accessToken = response.access_token;
          resolve(true);
        } else {
          resolve(false);
        }
      },
    });

    // Try silent auth first
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

export async function signInToDrive(): Promise<boolean> {
  const clientId = getClientId();
  if (!clientId || !isGapiLoaded()) return false;

  return new Promise((resolve) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          accessToken = response.access_token;
          resolve(true);
        } else {
          resolve(false);
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export function signOutOfDrive() {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {});
    accessToken = null;
  }
}

async function findSyncFile(): Promise<string | null> {
  if (!accessToken) return null;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${SYNC_FILENAME}'&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const data = await res.json();
  return data.files?.[0]?.id || null;
}

export async function uploadToDrive(jsonData: string): Promise<boolean> {
  if (!accessToken) return false;

  try {
    const existingId = await findSyncFile();

    if (existingId) {
      // Update existing file
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: jsonData,
        }
      );
      return res.ok;
    } else {
      // Create new file in appDataFolder
      const metadata = {
        name: SYNC_FILENAME,
        parents: ['appDataFolder'],
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([jsonData], { type: 'application/json' }));

      const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: form,
        }
      );
      return res.ok;
    }
  } catch {
    return false;
  }
}

export async function downloadFromDrive(): Promise<string | null> {
  if (!accessToken) return null;

  try {
    const fileId = await findSyncFile();
    if (!fileId) return null;

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Types for Google Identity Services
declare global {
  namespace google.accounts.oauth2 {
    interface TokenClient {
      requestAccessToken(config?: { prompt?: string }): void;
    }
    interface TokenResponse {
      access_token?: string;
    }
    function initTokenClient(config: {
      client_id: string;
      scope: string;
      callback: (response: TokenResponse) => void;
    }): TokenClient;
    function revoke(token: string, callback: () => void): void;
  }
}
