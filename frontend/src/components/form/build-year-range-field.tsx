import { mapFormOptions } from "#/feature/forms/map-form-options";
import { withForm } from ".";
import { FieldError, FieldLegend, FieldSet } from "../ui/field";
import styles from "./range-field.module.css";

export const BuildYearRangeField = withForm({
  ...mapFormOptions,
  render: function Render({ form }) {
    return (
      <FieldSet>
        <FieldLegend>Build Year</FieldLegend>
        <div className={styles.rangeFields}>
          <form.AppField
            name="step1.buildYear.buildYearFrom"
            validators={{ onChangeListenTo: ["step1.buildYear.buildYearTo"] }}
            children={(field) => (
              <field.TextField
                variant="bare"
                unit=""
                placeholder="From"
                onlyNumbers={true}
              />
            )}
          />

          <form.AppField
            name="step1.buildYear.buildYearTo"
            children={(field) => (
              <field.TextField
                variant="bare"
                unit=""
                placeholder="To"
                onlyNumbers={true}
              />
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => {
            const fromErrors =
              state.fieldMeta["step1.buildYear.buildYearFrom"]?.errors || [];
            const toErrors =
              state.fieldMeta["step1.buildYear.buildYearTo"]?.errors || [];

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
