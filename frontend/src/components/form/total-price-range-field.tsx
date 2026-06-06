import { filterFormOptions } from "#/feature/filter-form/filter-form-options";
import { withForm } from ".";
import { FieldError, FieldLegend, FieldSet } from "../ui/field";
import styles from "./range-field.module.css";

export const TotalPriceRangeField = withForm({
  ...filterFormOptions,
  render: function Render({ form }) {
    return (
      <FieldSet>
        <FieldLegend>Total Price</FieldLegend>
        <div className={styles.rangeFields}>
          <form.AppField
            name="totalPrice.totalPriceFrom"
            validators={{ onChangeListenTo: ["totalPrice.totalPriceTo"] }}
            children={(field) => (
              <field.NumberField unit="zł" placeholder="From" />
            )}
          />

          <form.AppField
            name="totalPrice.totalPriceTo"
            children={(field) => (
              <field.NumberField unit="zł" placeholder="To" />
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => {
            const fromErrors =
              state.fieldMeta["totalPrice.totalPriceFrom"]?.errors || [];
            const toErrors =
              state.fieldMeta["totalPrice.totalPriceTo"]?.errors || [];

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
