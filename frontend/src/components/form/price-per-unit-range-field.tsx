import { filterFormOptions } from "#/feature/filter-form/filter-form-options";
import { withForm } from ".";
import { FieldError, FieldLegend, FieldSet } from "../ui/field";
import styles from "./range-field.module.css";

export const PricePerUnitRangeField = withForm({
  ...filterFormOptions,
  render: function Render({ form }) {
    return (
      <FieldSet>
        <FieldLegend>Price per m²</FieldLegend>
        <div className={styles.rangeFields}>
          <form.AppField
            name="pricePerM2.pricePerM2From"
            validators={{ onChangeListenTo: ["pricePerM2.pricePerM2To"] }}
            children={(field) => (
              <field.NumberField unit="zł" placeholder="From" />
            )}
          />

          <form.AppField
            name="pricePerM2.pricePerM2To"
            children={(field) => (
              <field.NumberField unit="zł" placeholder="To" />
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => {
            const fromErrors =
              state.fieldMeta["pricePerM2.pricePerM2From"]?.errors || [];
            const toErrors =
              state.fieldMeta["pricePerM2.pricePerM2To"]?.errors || [];

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
