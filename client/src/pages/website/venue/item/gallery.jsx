import Cloudinary from "@/services/utilities/cloudinary";
const Gallery = ({ venue }) => {
  const thumbnail = venue.images[0] || "";

  const getImage = (image) => {
    return Cloudinary.getVenueImg(
      image?.version,
      venue?._id,
      `image-${image?.id}`,
    );
  };
  return (
    <div className="venue-card__gallery">
      <div className="relative min-h-0 overflow-hidden">
        <img
          src={getImage(thumbnail, 1)}
          alt={venue.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div
        className={`venue-card__thumbs grid grid-cols-${venue?.images?.length - 1} gap-1`}
      >
        {venue.images.slice(1, 4).map((image, index) => (
          <img
            src={getImage(image, index + 2)}
            alt={`${venue.name} preview ${index + 2}`}
            key={`venue-gallery-${index}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
