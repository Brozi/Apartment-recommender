import { mapFormOptions } from "#/feature/forms/map-form-options";
import { withForm } from ".";
import { FieldError, FieldLegend, FieldSet } from "../ui/field";
import styles from "./range-field.module.css";

export const AreaRangeField = withForm({
  ...mapFormOptions,
  render: function Render({ form }) {
    return (
      <FieldSet>
        <FieldLegend>Area (m²)</FieldLegend>
        <div className={styles.rangeFields}>
          <form.AppField
            name="step1.area.areaFrom"
            validators={{ onChangeListenTo: ["step1.area.areaTo"] }}
            children={(field) => (
              <field.NumberField unit="m²" placeholder="From" />
            )}
          />

          <form.AppField
            name="step1.area.areaTo"
            children={(field) => (
              <field.NumberField unit="m²" placeholder="To" />
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => {
            const fromErrors =
              state.fieldMeta["step1.area.areaFrom"]?.errors || [];
            const toErrors = state.fieldMeta["step1.area.areaTo"]?.errors || [];

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
