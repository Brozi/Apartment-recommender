import { mapFormOptions } from "#/feature/forms/map-form-options";
import { withForm } from ".";
import { Button } from "../ui/button";
import { FieldLegend } from "../ui/field";
import AddIcon from "../icons/add-icon";
import DeleteIcon from "../icons/delete-icon";
import styles from "./pois-field.module.css";
import { pointsOfInterest, pointsOfInterestRange } from "#/lib/formConstants";

export const PoisField = withForm({
  ...mapFormOptions,
  render: function Render({ form }) {
    return (
      <form.Field
        name="step1.pois"
        mode="array"
        children={(field) => {
          return (
            <section className={styles.poisField}>
              <div className={styles.poisHeader}>
                <h2 className="font-h2">Points of Interest</h2>
                <Button
                  variant="primary"
                  size="iconDefault"
                  type="button"
                  onClick={() =>
                    field.pushValue({
                      poi: "parcel_service",
                      range: "500_m",
                    })
                  }
                >
                  <AddIcon />
                </Button>
              </div>
              {field.state.value[0] && (
                <div className={styles.poisLegends}>
                  <FieldLegend className={styles.poiLegend1}>
                    Object
                  </FieldLegend>
                  <FieldLegend className={styles.poiLegend2}>
                    In range
                  </FieldLegend>
                </div>
              )}
              <div className={styles.poisList}>
                {field.state.value.map((_, index) => (
                  <div key={index} className={styles.poiItem}>
                    <form.AppField
                      name={`step1.pois[${index}].poi`}
                      children={(field) => (
                        <field.SelectField options={pointsOfInterest} />
                      )}
                    />
                    <form.AppField
                      name={`step1.pois[${index}].range`}
                      children={(field) => (
                        <field.SelectField options={pointsOfInterestRange} />
                      )}
                    />
                    <Button
                      variant="destructive"
                      size="iconDefault"
                      onClick={() => field.removeValue(index)}
                    >
                      <DeleteIcon />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          );
        }}
      />
    );
  },
});
