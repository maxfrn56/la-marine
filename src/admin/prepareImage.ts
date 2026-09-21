/*
 * Les photos arrivent souvent d'un téléphone : 4000 pixels de large et
 * plusieurs méga-octets. On les ramène à une taille raisonnable et on les
 * convertit en WebP dans le navigateur, avant l'envoi. En cas de souci, on
 * renvoie le fichier d'origine : mieux vaut une photo lourde que pas de photo.
 */

const MAX_SIDE = 1600;
const QUALITY = 0.82;
const ALREADY_LIGHT = 400 * 1024;

export async function prepareImage(file: File): Promise<File> {
  // Un GIF animé ne survivrait pas au passage par le canvas.
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap | null = null;
  try {
    // `from-image` respecte l'orientation EXIF, sans quoi les photos prises
    // en portrait arriveraient couchées.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= ALREADY_LIGHT) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${name}.webp`, { type: "image/webp" });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}
