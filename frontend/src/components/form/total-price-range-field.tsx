import { mapFormOptions } from "#/feature/forms/map-form-options";
import { withForm } from ".";
import { FieldError, FieldLegend, FieldSet } from "../ui/field";
import styles from "./range-field.module.css";

export const TotalPriceRangeField = withForm({
  ...mapFormOptions,
  render: function Render({ form }) {
    return (
      <FieldSet>
        <FieldLegend>Total Price</FieldLegend>
        <div className={styles.rangeFields}>
          <form.AppField
            name="step1.totalPrice.totalPriceFrom"
            validators={{ onChangeListenTo: ["step1.totalPrice.totalPriceTo"] }}
            children={(field) => (
              <field.NumberField unit="zł" placeholder="From" />
            )}
          />

          <form.AppField
            name="step1.totalPrice.totalPriceTo"
            children={(field) => (
              <field.NumberField unit="zł" placeholder="To" />
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => {
            const fromErrors =
              state.fieldMeta["step1.totalPrice.totalPriceFrom"]?.errors || [];
            const toErrors =
              state.fieldMeta["step1.totalPrice.totalPriceTo"]?.errors || [];

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
