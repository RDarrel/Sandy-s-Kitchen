import Cloudinary from "@/services/utilities/cloudinary";
import Availability from "./availability";
const Gallery = ({ venue, handleAction = () => {} }) => {
  const thumbnail = venue.images[0] || "";

  const getImage = (image) => {
    return Cloudinary.getVenueImg(
      image?.version,
      venue?._id,
      `image-${image?.id}`,
    );
  };
  return (
    <div className="admin-venue-card__gallery">
      <div className="relative min-h-0 overflow-hidden">
        <img
          src={getImage(thumbnail, 1)}
          alt={venue.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div
        className={`admin-venue-card__thumbs grid grid-cols-${venue?.images?.length - 1} gap-1`}
      >
        {venue.images.slice(1, 4).map((image, index) => (
          <img
            src={getImage(image, index + 2)}
            alt={`${venue.name} preview ${index + 2}`}
            key={`venue-gallery-${index}`}
          />
        ))}
      </div>
      <Availability handleAction={handleAction} item={venue} />
    </div>
  );
};

export default Gallery;
