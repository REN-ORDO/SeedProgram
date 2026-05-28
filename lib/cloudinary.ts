/**
 * Cloudinary unsigned upload helper.
 *
 * Para que esto funcione necesitas en Cloudinary Console:
 *   1. Crear un "Upload preset" en modo UNSIGNED:
 *      Settings → Upload → Upload presets → Add upload preset
 *      - Signing mode: Unsigned
 *      - Folder (opcional): cvs
 *      - Allowed formats: pdf,doc,docx
 *      - Max file size: 5 MB
 *   2. Setear NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y
 *      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env.local
 *
 * Endpoint /auto/upload detecta automáticamente el tipo de archivo
 * (PDF → image, .doc/.docx → raw).
 */

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  /**
   * Cloudinary no siempre devuelve `format` (depende del resource_type
   * y del archivo). Para .pdf/.jpg/.png viene como "pdf"/"jpg"/"png",
   * pero para raw files genéricos puede venir undefined.
   */
  format?: string;
  originalFilename: string;
};

export async function uploadCvToCloudinary(
  file: File,
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error(
      "Cloudinary no está configurado. Setea NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env.local.",
    );
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  fd.append("folder", "cvs");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: fd,
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Cloudinary upload falló (${res.status}): ${text.slice(0, 200)}`,
    );
  }

  const data = (await res.json()) as {
    secure_url: string;
    public_id: string;
    resource_type: string;
    bytes: number;
    format?: string;
    original_filename: string;
  };

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    bytes: data.bytes,
    format: data.format,
    originalFilename: data.original_filename,
  };
}
