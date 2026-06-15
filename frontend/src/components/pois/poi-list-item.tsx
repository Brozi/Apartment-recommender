import type { MapPoi } from "#/lib/types";
import { defaultDescriptionByCategory, iconByPoiCategory } from "#/lib/utils";
import LinkArrowIcon from "../icons/link-arrow-icon";
import { Button } from "../ui/button";
import PoiIconContainer from "./poi-icon-container";

import styles from "./poi-list-item.module.css";

type PoiListItemProps = {
  poi: MapPoi;
};

export default function PoiListItem({ poi }: PoiListItemProps) {
  const IconComponent = iconByPoiCategory(poi.categoryGroup);

  const poiDescription =
    poi.name && poi.name !== ""
      ? poi.name
      : (defaultDescriptionByCategory(poi.categoryGroup) ??
        "No description available");

  const handleLink = () => {
    window.open(
      `https://www.google.com/maps?q=${poi.lat},${poi.lng}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <li className={styles.listItem}>
      <PoiIconContainer style={{ width: "3rem" }}>
        <IconComponent className={styles.icon} />
      </PoiIconContainer>
      <p style={{ lineHeight: "1.5" }} className="font-base">
        {poiDescription}
      </p>
      <Button
        variant="outline"
        size="iconDefault"
        onClick={handleLink}
        aria-label="Open in Google Maps"
      >
        <LinkArrowIcon color="var(--clr-primary-100)" />
      </Button>
    </li>
  );
}
