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

/** Error de red identificable (la petición no llegó al servidor). */
export class NetworkError extends Error {
  readonly code = "network" as const;
  constructor(message = "No se pudo conectar con el servidor.") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * POST con timeout (AbortController) y un reintento ante fallos de red.
 * Solo reintenta cuando el fetch falla a nivel de red o por timeout —
 * NO ante respuestas HTTP 4xx/5xx (eso lo maneja quien llama).
 */
async function postWithRetry(
  url: string,
  body: FormData,
  { timeoutMs = 30_000, retries = 1 } = {},
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, {
        method: "POST",
        body,
        signal: controller.signal,
      });
    } catch (err) {
      // fetch() rechaza con TypeError ("Failed to fetch" / "Load failed" en
      // Safari) ante fallos de red, o con AbortError si vencio el timeout.
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) {
        const reason =
          err instanceof DOMException && err.name === "AbortError"
            ? "La conexión tardó demasiado."
            : "No se pudo conectar con el servidor.";
        throw new NetworkError(reason);
      }
      // Backoff breve antes de reintentar.
      await new Promise((r) => setTimeout(r, 800));
    } finally {
      clearTimeout(timer);
    }
  }
  // Inalcanzable: el bucle siempre retorna o lanza.
  throw new NetworkError();
}

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

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  // El fetch del navegador lanza `TypeError: Failed to fetch` cuando la
  // petición ni siquiera llega al servidor (red caída, móvil con señal
  // intermitente, bloqueador de anuncios/privacidad o proxy corporativo).
  // Ese mensaje crudo no le dice nada al usuario, así que lo capturamos,
  // reintentamos una vez (los cortes móviles suelen ser momentáneos) y, si
  // persiste, lanzamos un error de red identificable (.code = "network").
  const res = await postWithRetry(url, fd);

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
