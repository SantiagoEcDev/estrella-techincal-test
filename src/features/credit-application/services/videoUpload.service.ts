import { fetchAuthSession } from "aws-amplify/auth";

export async function uploadVideoToS3(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/credit-applications/video-upload-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size, 
      }),
    },
  );

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(
      error?.message ?? "No fue posible obtener la URL de subida",
    );
  }

  const { uploadUrl, key } = await res.json();

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () =>
      xhr.status === 200
        ? resolve()
        : reject(new Error("Falló la subida a S3"));
    xhr.onerror = () => reject(new Error("Error de red al subir el video"));
    xhr.send(file);
  });

  return key;
}
