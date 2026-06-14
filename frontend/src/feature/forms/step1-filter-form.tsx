import styles from "./form.module.css";
import { withForm } from "#/components/form";
import {
  buildStep2FromStep1,
  mapFormOptions,
  type FilterLimits,
} from "./map-form-options";
import { TotalPriceRangeField } from "#/components/form/total-price-range-field";
import { PricePerUnitRangeField } from "#/components/form/price-per-unit-range-field";
import { AreaRangeField } from "#/components/form/area-range-field";
import { BuildYearRangeField } from "#/components/form/build-year-range-field";
import { PoisField } from "#/components/form/pois-field";
import { Button } from "#/components/ui/button";
import {
  buildingTypes,
  condition,
  districtsCracow,
  marketTypes,
  rooms,
} from "#/lib/formConstants";

export const Step1FilterForm = withForm({
  ...mapFormOptions,
  props: {
    step: 0,
    setStep: (_step: number) => {},
    limits: {} as FilterLimits,
  },
  render: function Render({ form, step, setStep }) {
    return (
      <form.FormGroup
        name="step1"
        onGroupSubmit={({ value }) => {
          const nextStep2Values = buildStep2FromStep1(value);

          form.setFieldValue(
            "step2.buildingPartImportance",
            nextStep2Values.buildingPartImportance,
          );
          form.setFieldValue(
            "step2.poisImportance",
            nextStep2Values.poisImportance,
          );

          setStep(step + 1);
        }}
      >
        {(formGroup) => (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              formGroup.handleSubmit();
            }}
          >
            <section className={styles.formContent} data-map-form-scroll="true">
              <section className={styles.buildingPart}>
                <form.AppField
                  name="step1.buildingType"
                  children={(field) => (
                    <field.ChoiceChipsField
                      options={buildingTypes}
                      label="Building Type"
                      type="single"
                    />
                  )}
                />

                <form.AppField
                  name="step1.districts"
                  children={(field) => (
                    <field.ComboboxField
                      options={districtsCracow}
                      label="Districts"
                    />
                  )}
                />

                <TotalPriceRangeField form={form} />

                <PricePerUnitRangeField form={form} />

                <AreaRangeField form={form} />

                <BuildYearRangeField form={form} />

                <form.AppField
                  name="step1.rooms"
                  children={(field) => (
                    <field.ChoiceChipsField
                      options={rooms}
                      label="Rooms"
                      type="multi"
                    />
                  )}
                />

                <form.AppField
                  name="step1.marketType"
                  children={(field) => (
                    <field.ChoiceChipsField
                      options={marketTypes}
                      label="Market Type"
                      type="single"
                    />
                  )}
                />

                <form.AppField
                  name="step1.condition"
                  children={(field) => (
                    <field.SelectField options={condition} label="Condition" />
                  )}
                />
              </section>
              <PoisField form={form} />
            </section>

            <section className={styles.formActions}>
              <div className={styles.divider} />
              <Button
                className={styles.buttonLeft}
                variant="secondary"
                size="large"
                type="button"
                onClick={() => form.reset()}
              >
                Clear filters
              </Button>
              <Button
                className={styles.buttonRight}
                variant="primary"
                size="large"
                type="submit"
              >
                Next step
              </Button>
            </section>
          </form>
        )}
      </form.FormGroup>
    );
  },
});
