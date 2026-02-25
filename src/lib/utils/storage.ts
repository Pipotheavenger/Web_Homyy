import { supabase } from '@/lib/supabase';

/**
 * Sube una imagen al bucket de 'images' de Supabase
 * @param file Archivo a subir
 * @param folder Carpeta opcional dentro del bucket (por defecto 'chat-images')
 * @returns URL pública de la imagen
 */
export const uploadImage = async (file: File, folder: string = 'chat-images'): Promise<string> => {
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Validar tamaño (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no debe superar los 5MB');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw new Error('Error al subir la imagen');
  }

  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
