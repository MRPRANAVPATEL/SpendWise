import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../android_source/androidProjectFiles.ts';

/**
 * Packs all native Android Studio project files into a downloadable zip file.
 */
export async function downloadAndroidProjectZip(onProgress?: (percent: number) => void): Promise<void> {
  const zip = new JSZip();

  // Add all Android project files
  for (const file of ANDROID_PROJECT_FILES) {
    zip.file(file.path, file.content);
  }

  // Generate binary zip
  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  // Trigger download
  const url = URL.createObjectURL(content);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'CashTrace-Android-Studio-Project.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
