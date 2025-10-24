import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

interface UseImageUploadProps {
  onUpload?: (url: string) => void;
}

interface UploadedFile {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export function useImageUpload({ onUpload }: UseImageUploadProps = {}) {
  const { user } = useAuth();
  const previewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setFileName(file.name);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        previewRef.current = url;
        onUpload?.(url);
      }
    },
    [onUpload],
  );

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName(null);
    previewRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  // Carregar arquivos do usuário
  const loadFiles = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImageFiles(data || []);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Upload de arquivo
  const uploadFile = useCallback(async (file: File, type: 'image' | 'video' | 'audio' = 'image') => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      // Salvar informações no banco de dados
      const { data: dbData, error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: type,
          file_size: file.size,
          storage_path: fileName
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Atualizar lista de arquivos
      await loadFiles();

      return dbData;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }, [user, loadFiles]);

  // Deletar arquivo
  const deleteFile = useCallback(async (fileId: string) => {
    if (!user) return false;

    try {
      // Buscar informações do arquivo
      const { data: fileData, error: fetchError } = await supabase
        .from('uploaded_files')
        .select('storage_path')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('site-assets')
        .remove([fileData.storage_path]);

      if (storageError) throw storageError;

      // Deletar do banco de dados
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Atualizar lista de arquivos
      await loadFiles();

      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false;
    }
  }, [user, loadFiles]);

  // Deletar múltiplos arquivos
  const deleteMultipleFiles = useCallback(async (fileIds: string[]) => {
    if (!user) return false;

    try {
      // Buscar informações dos arquivos
      const { data: filesData, error: fetchError } = await supabase
        .from('uploaded_files')
        .select('storage_path')
        .in('id', fileIds);

      if (fetchError) throw fetchError;

      // Deletar do storage
      const storagePaths = filesData.map(f => f.storage_path);
      const { error: storageError } = await supabase.storage
        .from('site-assets')
        .remove(storagePaths);

      if (storageError) throw storageError;

      // Deletar do banco de dados
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .in('id', fileIds);

      if (dbError) throw dbError;

      // Atualizar lista de arquivos
      await loadFiles();

      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivos:', error);
      return false;
    }
  }, [user, loadFiles]);

  // Carregar arquivos ao montar
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  return {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    // Novas funcionalidades
    imageFiles,
    loading,
    uploadFile,
    deleteFile,
    deleteMultipleFiles,
    loadFiles,
  };
} 