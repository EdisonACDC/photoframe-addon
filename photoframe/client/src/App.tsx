import { useState, useCallback, useEffect } from "react";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import SlideshowPage from "@/pages/SlideshowPage";
import ManagementPage from "@/pages/ManagementPage";

interface Photo {
  id: string;
  filename: string;
  filepath: string;
  uploadedAt: Date;
}

function PhotoFrameApp() {
  const [isSlideshow, setIsSlideshow] = useState(false);
  const { toast } = useToast();

  const { data: photos = [], refetch } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("photos", file);
      });

      return apiRequest("/api/photos/upload", {
        method: "POST",
        body: formData,
        headers: {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Foto caricate",
        description: "Le foto sono state caricate con successo",
      });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le foto",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/photos/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Foto eliminata",
        description: "La foto è stata eliminata con successo",
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la foto",
        variant: "destructive",
      });
    },
  });

  const handleUpload = useCallback(
    (files: FileList) => {
      uploadMutation.mutate(files);
    },
    [uploadMutation]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleStartSlideshow = useCallback(() => {
    setIsSlideshow(true);
  }, []);

  useEffect(() => {
    if (!isSlideshow) {
      refetch();
    }
  }, [isSlideshow, refetch]);

  const handleExitSlideshow = useCallback(() => {
    setIsSlideshow(false);
  }, []);

  // Convert absolute image paths to relative for Home Assistant Ingress compatibility
  const photosWithUrls = photos.map((photo) => ({
    ...photo,
    url: photo.filepath.startsWith('/') ? '.' + photo.filepath : photo.filepath,
  }));

  return (
    <>
      {isSlideshow ? (
        <SlideshowPage photos={photosWithUrls} onExit={handleExitSlideshow} />
      ) : (
        <ManagementPage
          photos={photosWithUrls}
          onUpload={handleUpload}
          onDelete={handleDelete}
          onStartSlideshow={handleStartSlideshow}
        />
      )}
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PhotoFrameApp />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
