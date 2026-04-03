/**
 * Google Drive personal backup for LoveNest.
 * Uses the Firebase Auth OAuth access token to save/load data from Drive appDataFolder.
 * Each user's data is stored privately in their own Google Drive.
 */

const SYNC_FILENAME = 'lovenest-backup.json';

async function findSyncFile(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${SYNC_FILENAME}'&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.files?.[0]?.id || null;
  } catch {
    return null;
  }
}

export async function uploadToDrive(accessToken: string, jsonData: string): Promise<boolean> {
  if (!accessToken) return false;

  try {
    const existingId = await findSyncFile(accessToken);

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

export async function downloadFromDrive(accessToken: string): Promise<string | null> {
  if (!accessToken) return null;

  try {
    const fileId = await findSyncFile(accessToken);
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
