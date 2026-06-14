import ChevronDownIcon from "#/components/icons/chevron-down-icon";
import SubpageHeader from "#/components/subpage-header/subpage-header";
import SubpageHeaderTitle from "#/components/subpage-header/subpage-header-title";
import { Button } from "#/components/ui/button";
import ValuationForm from "#/components/valuation-form/valuation-form";
import { createFileRoute } from "@tanstack/react-router";

import styles from "#/routes/map-page.module.css";

export const Route = createFileRoute("/valuation")({
  component: ValuationPage,
});

function ValuationPage() {
  return (
    <>
      <SubpageHeader className={styles.subpageHeader}>
        <SubpageHeaderTitle label="Interactive map" />
        <Button
          className={styles.secondaryButton}
          variant="secondary"
          // cornerColor="red"
          size="large"
          onClick={() => {}}
          style={{
            padding: "0 var(--spacing-16)",
            gap: "var(--spacing-24)",
            justifyContent: "space-between",
          }}
        >
          Cracow
          <ChevronDownIcon size={20} />
        </Button>
      </SubpageHeader>

      <ValuationForm />
    </>
  );
}
