import VenueGallery from "../../body/venue/gallery";

const Gallery = ({ venue }) => {
  return (
    <VenueGallery venue={venue} showAvailability={false} className="rounded-sm" />
  );
};

export default Gallery;
