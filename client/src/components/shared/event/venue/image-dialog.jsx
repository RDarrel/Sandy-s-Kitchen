import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Cloudinary from "@/services/utilities/cloudinary";

const ImageDialog = ({ venue, images, initialIndex, onClose, triggerRef }) => {
  const [mainApi, setMainApi] = useState(null);
  const [thumbApi, setThumbApi] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const onSelect = useCallback(() => {
    if (!mainApi) return;
    const index = mainApi.selectedScrollSnap();
    setSelectedIndex(index);
    thumbApi?.scrollTo(index);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
    return () => {
      mainApi.off("select", onSelect);
      mainApi.off("reInit", onSelect);
    };
  }, [mainApi, onSelect]);

  const getImage = (image) =>
    Cloudinary.getVenueImg(image.version, venue._id, `image-${image.id}`);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName="p-3 backdrop-blur-sm sm:p-6"
        className="max-w-5xl gap-0 overflow-hidden rounded-2xl border-white/15 bg-zinc-950 p-0 text-white shadow-2xl sm:rounded-2xl [&>button]:rounded-full [&>button]:bg-black/50 [&>button]:p-2 [&>button]:text-white"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <DialogDescription className="sr-only">
          Browse {venue.name} photos. Use the arrow keys or thumbnails to change photos.
        </DialogDescription>
        <Carousel
          setApi={setMainApi}
          opts={{ startIndex: initialIndex, loop: images.length > 1 }}
          className="relative w-full"
          aria-label={`${venue.name} photo gallery`}
        >
          <CarouselContent className="ml-0">
            {images.map((image, index) => (
              <CarouselItem key={image.id || index} className="pl-0">
                <div className="flex h-[min(75dvh,720px)] items-center justify-center pb-28 pt-20 sm:pb-32">
                  <img
                    src={getImage(image)}
                    alt={`${venue.name} photo ${index + 1}`}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-black/80 to-transparent px-5 pb-10 pt-5 sm:px-7">
            <DialogTitle className="break-words pr-12 text-lg font-semibold sm:text-2xl">
              {venue.name}
            </DialogTitle>
            <p className="mt-2 text-xs tabular-nums text-white/70" aria-live="polite">
              {selectedIndex + 1} / {images.length} photos
            </p>
          </div>

          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-3 h-10 w-10 border-white/20 bg-black/45 text-white backdrop-blur-md hover:bg-white/20 hover:text-white sm:left-5" />
              <CarouselNext className="right-3 h-10 w-10 border-white/20 bg-black/45 text-white backdrop-blur-md hover:bg-white/20 hover:text-white sm:right-5" />
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/60 to-transparent px-5 pb-5 pt-8 sm:px-8 sm:pb-6">
            <Carousel
              setApi={setThumbApi}
              opts={{ containScroll: "keepSnaps", dragFree: true }}
              className="mx-auto max-w-lg"
              style={{ width: `min(100%, ${images.length * 80 - 8}px)` }}
              aria-label="Photo thumbnails"
            >
              <CarouselContent className="ml-0 gap-2">
                {images.map((image, index) => (
                  <CarouselItem key={image.id || index} className="basis-[72px] pl-0">
                    <button
                      type="button"
                      onClick={() => mainApi?.scrollTo(index)}
                      aria-label={`View ${venue.name} photo ${index + 1}`}
                      aria-pressed={index === selectedIndex}
                      className={cn(
                        "relative block aspect-square w-full overflow-hidden rounded-lg border-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white",
                        index === selectedIndex
                          ? "border-white opacity-100 shadow-lg"
                          : "border-white/25 opacity-50 hover:border-white/60 hover:opacity-90",
                      )}
                    >
                      <img src={getImage(image)} alt="" className="h-full w-full object-cover" />
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDialog;
