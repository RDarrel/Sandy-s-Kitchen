import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Package from "./package";
import Pagination from "./pagination";
import PackageSkeleton from "./package/skeleton";
import Search from "../search";
import EmptyVenue from "../venue/empty";
import "./style.css";

const ITEMS_PER_PAGE = 4;

const CateringList = ({ isWebsite = true, onSelect = () => {} }) => {
  const { collections: packages, isLoading } = useSelector(
      ({ cateringPackages }) => cateringPackages,
    ),
    [currentPage, setCurrentPage] = useState(1),
    navigate = useNavigate();

  const totalPages = Math.ceil(packages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const visiblePackages = useMemo(
    () => packages.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [startIndex, packages],
  );
  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const handleInquire = useCallback((item, actionType) => {
    if (!isWebsite) return onSelect(item, actionType);
    sessionStorage.setItem(
      "cateringDraft",
      JSON.stringify({
        selected: item,
        isAutomaticRedirect: true,
      }),
    );
    sessionStorage.removeItem("venueDraft");
    navigate("/authentication/sign-in");
  }, []);
  const isEmpty = visiblePackages?.length === 0;
  return (
    <section className="catering-page grid grid-cols-1 md:grid-cols-[auto_1fr] max-w-6xl mx-auto gap-5 items-start  ">
      <Search isVenue={false} />
      <div className="catering-page__innerr">
        <Pagination
          placement="top"
          totalPages={totalPages}
          currentPage={currentPage}
          goToPage={goToPage}
          isEmpty={isEmpty}
        />

        <div className="catering-packages">
          {!isLoading ? (
            visiblePackages?.length > 0 ? (
              visiblePackages.map((item, idx) => {
                return (
                  <Package
                    key={idx}
                    item={item}
                    handleInquire={handleInquire}
                    isWebsite={isWebsite}
                  />
                );
              })
            ) : (
              <EmptyVenue isVenue={false} />
            )
          ) : (
            Array.from({ length: 3 }).map((_, idx) => (
              <PackageSkeleton key={idx} />
            ))
          )}
        </div>

        <Pagination
          placement="bottom"
          totalPages={totalPages}
          currentPage={currentPage}
          goToPage={goToPage}
          isEmpty={isEmpty}
        />
      </div>
    </section>
  );
};

export default CateringList;
