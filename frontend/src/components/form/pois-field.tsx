import { filterFormOptions } from "#/feature/filter-form/filter-form-options";
import { withForm } from ".";
import { Button } from "../ui/button";
import { FieldLegend } from "../ui/field";
import AddIcon from "../icons/add-icon";
import DeleteIcon from "../icons/delete-icon";
import styles from "./pois-field.module.css";

const pointsOfInterest = [
  { label: "Parcel locker", value: "parcel_locker" },
  { label: "Convenience", value: "convenience" },
  { label: "Grocery", value: "grocery" },
  { label: "Supermarket", value: "supermarket" },
  { label: "Bus stop", value: "bus_stop" },
  { label: "Tram stop", value: "tram_stop" },
  { label: "Kindergarten", value: "kindergarten" },
  { label: "School", value: "school" },
  { label: "Specialized school", value: "specialized_school" },
  { label: "University", value: "university" },
];

const pointsOfInterestRange = [
  { label: "500m", value: "500_m" },
  { label: "1km", value: "1000_m" },
  { label: "1.5km", value: "1500_m" },
];

export const PoisField = withForm({
  ...filterFormOptions,
  render: function Render({ form }) {
    return (
      <form.Field
        name="pois"
        mode="array"
        children={(field) => (
          <section className={styles.poisField}>
            <div className={styles.poisHeader}>
              <h2 className="font-h2">Points of Interest</h2>
              <Button
                variant="primary"
                size="iconDefault"
                type="button"
                onClick={() =>
                  field.pushValue({ poi: "parcel_locker", range: "500_m" })
                }
              >
                <AddIcon />
              </Button>
            </div>
            {field.state.value[0] && (
              <div className={styles.poisLegends}>
                <FieldLegend className={styles.poiLegend1}>Object</FieldLegend>
                <FieldLegend className={styles.poiLegend2}>
                  In range
                </FieldLegend>
              </div>
            )}
            <div className={styles.poisList}>
              {field.state.value.map((_, index) => (
                <div key={index} className={styles.poiItem}>
                  <form.AppField
                    name={`pois[${index}].poi`}
                    children={(field) => (
                      <field.SelectField options={pointsOfInterest} />
                    )}
                  />
                  <form.AppField
                    name={`pois[${index}].range`}
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
        )}
      />
    );
  },
});
