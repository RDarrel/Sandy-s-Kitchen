import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ListChecks,
  UsersRound,
  Pen,
  Trash,
  MoreVertical,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import "./style.css";
import { useSelector } from "react-redux";
import Cloudinary from "@/services/utilities/cloudinary";
import { Formatter } from "@/services/utilities";

const ITEMS_PER_PAGE = 3;
const MAX_VISIBLE_INCLUSIONS = 6;
const MAX_VISIBLE_INCLUSIONS_WITH_MORE = 5;

const Body = () => {
  const { collections: packages } = useSelector(
    ({ cateringPackages }) => cateringPackages,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(packages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visiblePackages = useMemo(
    () => packages.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [startIndex, packages],
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const renderPagination = (placement) => (
    <nav className={`admin-pagination admin-pagination--${placement}`}>
      <Button
        aria-label="Previous admin packages"
        className="admin-pagination__arrow"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        size="icon"
        variant="outline"
      >
        <ChevronLeft />
      </Button>

      <div className="admin-pagination__pages">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;

          return (
            <Button
              aria-current={currentPage === page ? "page" : undefined}
              className="admin-pagination__page"
              key={page}
              onClick={() => goToPage(page)}
              variant={currentPage === page ? "default" : "outline"}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        aria-label="Next admin packages"
        className="admin-pagination__arrow"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        size="icon"
        variant="outline"
      >
        <ChevronRight />
      </Button>
    </nav>
  );

  return (
    <section className="admin-page">
      <div className="admin-page__inner">
        <div className="admin-packages">
          {visiblePackages.map((item) => {
            const hasHiddenInclusions =
              item.inclusions.length > MAX_VISIBLE_INCLUSIONS;
            const visibleLimit = hasHiddenInclusions
              ? MAX_VISIBLE_INCLUSIONS_WITH_MORE
              : MAX_VISIBLE_INCLUSIONS;
            const visibleInclusions = item.inclusions.slice(0, visibleLimit);
            const hiddenInclusions =
              item.inclusions.length - visibleInclusions.length;
            const { mainCourseCategories } = item;
            const mainMenus = mainCourseCategories.flatMap(({ choices }) =>
              choices.map((choice) => choice),
            );

            return (
              <article className="admin-package" key={item.name}>
                <div className="admin-package__media">
                  <img
                    alt={`${item.name} admin package`}
                    src={Cloudinary.getPackageImg(item.imgId, item?._id)}
                  />
                </div>

                <div className="admin-package__body">
                  <div className="admin-package__content">
                    <div className="admin-package__heading">
                      {item.tag && <span>{item.tag}</span>}
                      <h2>{item.name}</h2>
                      <p>{item.description}</p>
                    </div>

                    <div className="admin-package__price">
                      <div className="flex gap-2 align-items-center justify-end self-right ">
                        <div>
                          <strong>{`${Formatter.amount(item.basePrice)}`}</strong>
                          <small>
                            + {Formatter.amount(item.addPricePerGuest)} / guest
                          </small>
                        </div>
                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size={"icon"}
                                className="h-7 w-4 p-0"
                              >
                                <MoreVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[9rem]">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem>
                                  <Pen />
                                  Update
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Trash />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-package__summary">
                    <span>
                      <UsersRound />
                      {item.minimumGuests} Minimum Guests
                    </span>
                    <span>
                      <ListChecks />
                      {item.inclusions.length} Main Courses
                    </span>
                    <span>
                      <ListChecks />
                      {item.sideMenuCategories.length} Side Menus
                    </span>
                    <span>
                      <ListChecks />
                      {item.inclusions.length} inclusions
                    </span>
                  </div>

                  <ul className="admin-package__inclusions">
                    {mainMenus.map((menu, idx) => (
                      <li key={idx}>
                        <Check />
                        {menu?.name}
                      </li>
                    ))}
                    {hasHiddenInclusions && (
                      <li className="admin-package__more">
                        +{hiddenInclusions} more
                      </li>
                    )}
                  </ul>
                  <Button
                    className="catering-package__button"
                    variant="outline"
                  >
                    View Full Details
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {renderPagination("bottom")}
      </div>
    </section>
  );
};

export default Body;
