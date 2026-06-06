import { filterFormOptions } from "#/feature/filter-form/filter-form-options";
import { withForm } from ".";
import { FieldError, FieldLegend, FieldSet } from "../ui/field";
import styles from "./range-field.module.css";

export const BuildYearRangeField = withForm({
  ...filterFormOptions,
  render: function Render({ form }) {
    return (
      <FieldSet>
        <FieldLegend>Build Year</FieldLegend>
        <div className={styles.rangeFields}>
          <form.AppField
            name="buildYear.buildYearFrom"
            validators={{ onChangeListenTo: ["buildYear.buildYearTo"] }}
            children={(field) => (
              <field.NumberField unit="" placeholder="From" />
            )}
          />

          <form.AppField
            name="buildYear.buildYearTo"
            children={(field) => <field.NumberField unit="" placeholder="To" />}
          />
        </div>
        <form.Subscribe
          selector={(state) => {
            const fromErrors =
              state.fieldMeta["buildYear.buildYearFrom"]?.errors || [];
            const toErrors =
              state.fieldMeta["buildYear.buildYearTo"]?.errors || [];

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
