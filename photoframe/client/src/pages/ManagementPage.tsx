import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadZone from "@/components/UploadZone";
import PhotoGrid from "@/components/PhotoGrid";

interface Photo {
  id: string;
  url: string;
  filename: string;
}

interface ManagementPageProps {
  photos: Photo[];
  onUpload: (files: FileList) => void;
  onDelete: (id: string) => void;
  onStartSlideshow: () => void;
}

export default function ManagementPage({
  photos,
  onUpload,
  onDelete,
  onStartSlideshow,
}: ManagementPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">PhotoFrame</h1>
          <Button
            onClick={onStartSlideshow}
            disabled={photos.length === 0}
            data-testid="button-start-slideshow"
          >
            <Play className="w-4 h-4 mr-2" />
            Avvia Slideshow
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-medium mb-4">Carica Foto</h2>
            <UploadZone onFilesSelected={onUpload} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">
                Galleria Foto ({photos.length})
              </h2>
            </div>
            <PhotoGrid photos={photos} onDelete={onDelete} />
          </section>
        </div>
      </main>
    </div>
  );
}
