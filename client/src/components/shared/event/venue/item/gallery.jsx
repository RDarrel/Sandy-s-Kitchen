import Cloudinary from "@/services/utilities/cloudinary";
import { useRef, useState } from "react";
import ImageDialog from "../image-dialog";

const Gallery = ({ venue = {}, className = "" }) => {
  const images = Array.isArray(venue.images) ? venue.images : [];
  const thumbnail = images[0];
  const [previewIndex, setPreviewIndex] = useState(null);
  const triggerRef = useRef(null);

  const openPreview = (event, index) => {
    triggerRef.current = event.currentTarget;
    setPreviewIndex(index);
  };

  const getImage = (image) => {
    return Cloudinary.getVenueImg(
      image?.version,
      venue?._id,
      `image-${image?.id}`,
    );
  };
  return (
    <div className={`venue-card__gallery ${className}`}>
      <button
        type="button"
        onClick={(event) => openPreview(event, 0)}
        disabled={!images.length}
        aria-label={`View ${venue.name} photos`}
        className="relative min-h-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        {thumbnail ? (
          <img
            src={getImage(thumbnail)}
            alt={venue.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No photos available
          </span>
        )}
      </button>

      <div className="venue-card__thumbs">
        {images.slice(1, 4).map((image, index) => (
          <button
            type="button"
            key={image.id || index}
            onClick={(event) => openPreview(event, index + 1)}
            aria-label={`View ${venue.name} photo ${index + 2}`}
            className="min-h-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          >
            <img
              src={getImage(image)}
              alt={`${venue.name} preview ${index + 2}`}
            />
          </button>
        ))}
      </div>
      {previewIndex !== null && (
        <ImageDialog
          venue={venue}
          images={images}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
          triggerRef={triggerRef}
        />
      )}
    </div>
  );
};

export default Gallery;
