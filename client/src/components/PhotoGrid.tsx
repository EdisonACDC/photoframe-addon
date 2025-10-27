import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Photo {
  id: string;
  url: string;
  filename: string;
}

interface PhotoGridProps {
  photos: Photo[];
  onDelete: (id: string) => void;
  onPhotoClick?: (index: number) => void;
}

export default function PhotoGrid({ photos, onDelete, onPhotoClick }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nessuna foto caricata</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="relative aspect-square rounded-lg overflow-hidden bg-muted group hover-elevate"
          data-testid={`photo-thumbnail-${photo.id}`}
        >
          <img
            src={photo.url}
            alt={photo.filename}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => onPhotoClick?.(index)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(photo.id);
            }}
            data-testid={`button-delete-${photo.id}`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
