import { defaultDescriptionByCategory, iconByPoiCategory } from "#/lib/utils";
import { useMapContext } from "#/hooks/use-map-context";
import { Button } from "../ui/button";

import LinkArrowIcon from "#/components/icons/link-arrow-icon";
import CloseIcon from "#/components/icons/close-icon";
import styles from "./poi-preview.module.css";
import PoiIconContainer from "./poi-icon-container";

export default function PoiPreview() {
  const { selectedSinglePoi, clearSelection } = useMapContext();

  if (!selectedSinglePoi) return null;

  console.log(selectedSinglePoi);

  const poiDescription =
    selectedSinglePoi.name && selectedSinglePoi.name !== ""
      ? selectedSinglePoi.name
      : (defaultDescriptionByCategory(selectedSinglePoi.categoryGroup) ??
        "No description available");

  const IconComponent = iconByPoiCategory(selectedSinglePoi.categoryGroup);

  const handleLink = () => {
    window.open(
      `https://www.google.com/maps?q=${selectedSinglePoi.lat},${selectedSinglePoi.lng}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <PoiIconContainer style={{ width: "4.75rem" }}>
            <IconComponent className={styles.icon} />
          </PoiIconContainer>

          <div className={styles.spacer} />

          <section className={styles.buttonGroup}>
            <Button
              variant="primary"
              size="iconDefault"
              onClick={handleLink}
              aria-label="Open in Google Maps"
            >
              <LinkArrowIcon />
            </Button>
            <Button
              variant="outline"
              size="iconDefault"
              onClick={clearSelection}
              aria-label="Close"
            >
              <CloseIcon />
            </Button>
          </section>
        </div>
        <p
          style={{ lineHeight: "1.5", maxWidth: "13.5rem" }}
          className="font-base"
        >
          {poiDescription}
        </p>
      </div>
    </div>
  );
}
