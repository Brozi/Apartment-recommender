import { houseValuationFormOptions } from "#/feature/forms/valuation-form-options";
import { condition, districtsCracow } from "#/lib/formConstants";
import { useAppForm } from "../form";
import { Button } from "../ui/button";

import styles from "./valuation-form.module.css";

export default function HouseValuationForm() {
  const form = useAppForm({
    ...houseValuationFormOptions,
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField
        name="buildingType"
        children={(field) => (
          <field.TextField
            variant="full"
            label="Building type"
            onlyNumbers={false}
            id="buildingType"
            invisible={true}
          />
        )}
      />
      <section className={styles.formFields}>
        <section className={styles.locationFields}>
          <form.AppField
            name="district"
            children={(field) => (
              <field.SelectField
                options={districtsCracow}
                label="District"
                placeholder="Select district"
              />
            )}
          />

          <section className={styles.streetGroup}>
            <form.AppField
              name="street"
              children={(field) => (
                <field.TextField
                  label="Street"
                  id="street"
                  variant="full"
                  onlyNumbers={false}
                  placeholder="E.g. Józefa Dietla St."
                  style={{ width: "100%" }}
                />
              )}
            />
            <form.AppField
              name="streetNumber"
              children={(field) => (
                <field.TextField
                  label="Street number"
                  id="streetNumber"
                  variant="full"
                  onlyNumbers={false}
                  placeholder="E.g. 55A"
                  style={{ width: "100%" }}
                />
              )}
            />
          </section>
        </section>

        <section className={styles.detailsFields}>
          <form.AppField
            name="rooms"
            children={(field) => (
              <field.TextField
                label="Rooms"
                id="rooms"
                variant="full"
                onlyNumbers={true}
                placeholder="E.g. 3"
                style={{ width: "100%" }}
              />
            )}
          />
          <form.AppField
            name="area"
            children={(field) => (
              <field.TextField
                label="Area (m²)"
                id="area"
                variant="full"
                onlyNumbers={true}
                placeholder="E.g. 75"
                style={{ width: "100%" }}
              />
            )}
          />
          <form.AppField
            name="plotArea"
            children={(field) => (
              <field.TextField
                label="Plot Area (m²)"
                id="plotArea"
                variant="full"
                onlyNumbers={true}
                placeholder="E.g. 3000"
                style={{ width: "100%" }}
              />
            )}
          />
          <form.AppField
            name="numberOfFloors"
            children={(field) => (
              <field.TextField
                label="Number of Floors"
                id="numberOfFloors"
                variant="full"
                onlyNumbers={true}
                placeholder="E.g. 5"
                style={{ width: "100%" }}
              />
            )}
          />
          <form.AppField
            name="buildYear"
            children={(field) => (
              <field.TextField
                className={styles.buildYearField}
                label="Build Year"
                id="buildYear"
                variant="full"
                onlyNumbers={true}
                placeholder="E.g. 1990"
                style={{ width: "100%" }}
              />
            )}
          />
          <form.AppField
            name="condition"
            children={(field) => (
              <field.SelectField
                className={styles.conditionField}
                options={condition}
                label="Condition"
                placeholder="Select condition"
              />
            )}
          />
        </section>

        <section className={styles.checkboxSection}>
          <h2 className="font-h2">Property additional features</h2>
          <section className={styles.checkboxGroup}>
            <form.AppField
              name="hasGarage"
              children={(field) => (
                <field.CheckboxField label="Garage" id="garage" />
              )}
            />
            <form.AppField
              name="hasParking"
              children={(field) => (
                <field.CheckboxField label="Parking space" id="parking" />
              )}
            />
            <form.AppField
              name="hasGarden"
              children={(field) => (
                <field.CheckboxField label="Garden" id="garden" />
              )}
            />
          </section>
        </section>
      </section>
      <div className={styles.divider} />
      <Button
        className={styles.button}
        variant="primary"
        size="large"
        type="submit"
      >
        Valuate the house
      </Button>
    </form>
  );
}
