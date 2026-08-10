import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/events/cateringPackages";
import Package from "./package";
import Pagination from "./pagination";
import "./style.css";
import PackageSkeleton from "./package/skeleton";

const ITEMS_PER_PAGE = 4;

const Catering = () => {
  const { collections: packages, isLoading = false } = useSelector(
      ({ cateringPackages }) => cateringPackages,
    ),
    [currentPage, setCurrentPage] = useState(1),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);

  const totalPages = Math.ceil(packages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const visiblePackages = useMemo(
    () => packages.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [startIndex, packages],
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <section className="catering-page">
      <div className="catering-page__inner">
        <Pagination
          placement="top"
          totalPages={totalPages}
          currentPage={currentPage}
          goToPage={goToPage}
        />

        <div className="catering-packages">
          {!isLoading
            ? visiblePackages.map((item, idx) => {
                return <Package item={item} key={idx} />;
              })
            : Array.from({ length: 3 }).map((_, idx) => (
                <PackageSkeleton key={idx} />
              ))}
        </div>

        <Pagination
          placement="bottom"
          totalPages={totalPages}
          currentPage={currentPage}
          goToPage={goToPage}
        />
      </div>
    </section>
  );
};

export default Catering;
