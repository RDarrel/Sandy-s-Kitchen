import { Camera, Heart } from "lucide-react";
import moment1 from "../../../../assets/moments/m1.jpg";
import moment10 from "../../../../assets/moments/m10.jpg";
import moment11 from "../../../../assets/moments/m11.jpg";
import moment12 from "../../../../assets/moments/m12.jpg";
import moment13 from "../../../../assets/moments/m13.jpg";
import moment2 from "../../../../assets/moments/m2.jpg";
import moment3 from "../../../../assets/moments/m3.jpg";
import moment4 from "../../../../assets/moments/m4.jpg";
import moment5 from "../../../../assets/moments/m5.jpg";
import moment6 from "../../../../assets/moments/m6.jpg";
import moment7 from "../../../../assets/moments/m7.jpg";
import moment8 from "../../../../assets/moments/m8.jpg";
import moment9 from "../../../../assets/moments/m9.jpg";
import "./style.css";

const Moments = () => {
  const moments = [
    {
      src: moment3,
      alt: "Guests sharing a meal inside Sandy's Kitchenette",
      caption: "Family tables",
      size: "wide",
      featured: true,
    },
    {
      src: moment1,
      alt: "Birthday celebration with guests and cake at Sandy's Kitchenette",
      caption: "Birthday smiles",
      size: "portrait",
      featured: true,
    },
    {
      src: moment7,
      alt: "Eighteenth birthday venue setup at Sandy's Kitchenette",
      caption: "Celebration setup",
      size: "wide",
      featured: true,
    },
    {
      src: moment12,
      alt: "Private event guests gathered around decorated tables",
      caption: "Gatherings",
      size: "wide",
    },
    {
      src: moment5,
      alt: "Couple sitting by the Sandy's Kitchenette sign",
      caption: "Photo corner",
      size: "portrait",
    },
    {
      src: moment13,
      alt: "Decorated celebration venue with floral wall",
      caption: "Venue styling",
      size: "wide",
    },
    {
      src: moment2,
      alt: "Friends posing in front of the Sandy's Kitchenette sign",
      caption: "Friends night",
      size: "wide",
    },
    {
      src: moment10,
      alt: "Dining service during a celebration at Sandy's Kitchenette",
      caption: "Warm service",
      size: "wide",
    },
    {
      src: moment11,
      alt: "Portrait view of a debut celebration setup",
      caption: "Milestones",
      size: "portrait",
    },
    {
      src: moment4,
      alt: "Guest moment at Sandy's Kitchenette",
      caption: "Happy visits",
      size: "wide",
    },
    {
      src: moment6,
      alt: "Guest photo at Sandy's Kitchenette",
      caption: "Snapshots",
      size: "portrait",
    },
    {
      src: moment8,
      alt: "Dining moment with guests at Sandy's Kitchenette",
      caption: "Good company",
      size: "wide",
    },
    {
      src: moment9,
      alt: "Guest portrait moment at Sandy's Kitchenette",
      caption: "Memories",
      size: "portrait",
    },
  ];

  const firstRow = moments.slice(0, 7);
  const secondRow = moments.slice(7);

  const renderMomentCard = ({ src, alt, caption, featured, size }, index) => (
    <figure
      className={`moments__card moments__card--${size}${
        featured ? " moments__card--featured" : ""
      }`}
      key={`${caption}-${index}`}
    >
      <img src={src} alt={alt} />
      <figcaption>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );

  return (
    <section className="moments" id="moments">
      <div className="moments__inner">
        <div className="moments__header">
          <div className="moments__heading">
            <p className="moments__eyebrow">
              <Camera />
              Memorable Moments
            </p>
            <h2 className="moments__title">
              Real smiles, full tables, and celebrations worth remembering.
            </h2>
          </div>

          <div className="moments__summary">
            <p>
              From casual meals to decorated milestones, Sandy's Kitchenette
              becomes a warm backdrop for the people you gather with.
            </p>
            <span className="moments__note">
              <Heart />
              Shared by guests, families, and friends
            </span>
          </div>
        </div>
      </div>

      <div
        className="moments__reels"
        aria-label="Sandy's Kitchenette moments gallery"
      >
        <div className="moments__reel">
          <div className="moments__track">
            {[...firstRow, ...firstRow].map(renderMomentCard)}
          </div>
        </div>

        <div className="moments__reel moments__reel--reverse">
          <div className="moments__track">
            {[...secondRow, ...secondRow].map(renderMomentCard)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Moments;
