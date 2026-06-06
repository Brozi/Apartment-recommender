import { filterFormOptions } from "#/feature/filter-form/filter-form-options";
import { withForm } from ".";
import { FieldError, FieldLegend, FieldSet } from "../ui/field";
import styles from "./range-field.module.css";

export const AreaRangeField = withForm({
  ...filterFormOptions,
  render: function Render({ form }) {
    return (
      <FieldSet>
        <FieldLegend>Area (m²)</FieldLegend>
        <div className={styles.rangeFields}>
          <form.AppField
            name="area.areaFrom"
            validators={{ onChangeListenTo: ["area.areaTo"] }}
            children={(field) => (
              <field.NumberField unit="m²" placeholder="From" />
            )}
          />

          <form.AppField
            name="area.areaTo"
            children={(field) => (
              <field.NumberField unit="m²" placeholder="To" />
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => {
            const fromErrors = state.fieldMeta["area.areaFrom"]?.errors || [];
            const toErrors = state.fieldMeta["area.areaTo"]?.errors || [];

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
