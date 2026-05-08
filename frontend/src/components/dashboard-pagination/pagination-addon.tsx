import paginationAddonLeft from "../../assets/pagination-addon-left.svg";
import paginationAddonRight from "../../assets/pagination-addon-right.svg";

type PaginationAddonProps = {
  className: string;
  direction: "left" | "right";
};

export default function PaginationAddon({
  direction,
  className,
}: PaginationAddonProps) {
  const src = direction === "left" ? paginationAddonLeft : paginationAddonRight;

  return (
    <img
      src={src}
      alt={`Pagination addon ${direction}`}
      className={className}
    />
  );
}
