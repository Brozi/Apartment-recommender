import ChevronDownIcon from "#/components/icons/chevron-down-icon";
import SubpageHeader from "#/components/subpage-header/subpage-header";
import SubpageHeaderTitle from "#/components/subpage-header/subpage-header-title";
import { Button } from "#/components/ui/button";
import ValuationForm from "#/components/valuation-form/valuation-form";
import { createFileRoute } from "@tanstack/react-router";
import Box from "#/components/info-box/box";
import InfoBoxLineWrapper from "#/components/info-box/info-box-line-wrapper";
import TopCornerImage from "#/assets/valuation-results-top-corner.svg";
import BottomCornerImage from "#/assets/valuation-results-bottom-corner.svg";
import styles from "#/routes/valuation-page.module.css";

export const Route = createFileRoute("/valuation")({
  component: ValuationPage,
});

function ValuationPage() {
  return (
    <>
      <SubpageHeader className={styles.subpageHeader}>
        <SubpageHeaderTitle label="Valuation" />
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

      <section className={styles.contentSection}>
        <ValuationForm className={styles.valuationForm} />

        <section className={styles.howItWorksSection}>
          <h2 className="font-h2">How it works?</h2>
          <Box
            className={styles.firstBox}
            title="1. Pop in your property details"
          >
            <InfoBoxLineWrapper>
              <p className="font-paragraph">
                Simply select the city and input your address with some basic
                details about your property.
              </p>
            </InfoBoxLineWrapper>
          </Box>
          <Box
            className={styles.secondBox}
            title="2. Let our model do the magic"
          >
            <InfoBoxLineWrapper>
              <p className="font-paragraph">
                Based on provided data our multiple regression model will
                estimate property value.
              </p>
            </InfoBoxLineWrapper>
          </Box>
        </section>

        <section className={styles.resultsSection}>
          <h2 className="font-h2">Your valuation results</h2>
          <div className={styles.resultsContainer}>
            <p className="font-paragraph">Submit the form to see results</p>
            <img
              src={TopCornerImage}
              alt="top corner"
              className={styles.topCornerImage}
            />
            <img
              src={BottomCornerImage}
              alt="bottom corner"
              className={styles.bottomCornerImage}
            />
          </div>
        </section>
      </section>
    </>
  );
}
