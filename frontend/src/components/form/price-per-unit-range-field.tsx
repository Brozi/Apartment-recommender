import { mapFormOptions } from "#/feature/forms/map-form-options";
import { withForm } from ".";
import { FieldError, FieldLegend, FieldSet } from "../ui/field";
import styles from "./range-field.module.css";

export const PricePerUnitRangeField = withForm({
  ...mapFormOptions,
  render: function Render({ form }) {
    return (
      <FieldSet>
        <FieldLegend>Price per m²</FieldLegend>
        <div className={styles.rangeFields}>
          <form.AppField
            name="step1.pricePerM2.pricePerM2From"
            validators={{ onChangeListenTo: ["step1.pricePerM2.pricePerM2To"] }}
            children={(field) => (
              <field.TextField
                variant="bare"
                unit="zł"
                placeholder="From"
                onlyNumbers={true}
              />
            )}
          />

          <form.AppField
            name="step1.pricePerM2.pricePerM2To"
            children={(field) => (
              <field.TextField
                variant="bare"
                unit="zł"
                placeholder="To"
                onlyNumbers={true}
              />
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => {
            const fromErrors =
              state.fieldMeta["step1.pricePerM2.pricePerM2From"]?.errors || [];
            const toErrors =
              state.fieldMeta["step1.pricePerM2.pricePerM2To"]?.errors || [];

            return Array.from(new Set([...fromErrors, ...toErrors]));
          }}
          children={(errors) => {
            if (errors.length === 0) return null;
            return <FieldError errors={errors} />;
          }}
        />
      </FieldSet>
    );
  },
});
