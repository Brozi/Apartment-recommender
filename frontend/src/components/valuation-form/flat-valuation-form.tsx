import { flatValuationFormOptions } from "#/feature/forms/valuation-form-options";
import {
  valuationCondition,
  valuationDistrictsCracow,
  valuationHeating,
  valuationMarketTypes,
  valuationOfferedBy,
  valuationRooms,
} from "#/lib/formConstants";
import { useNavigate } from "@tanstack/react-router";
import { useAppForm } from "../form";
import { Button } from "../ui/button";

import styles from "./valuation-form.module.css";
import { useState } from "react";
import { fetchCoordinates } from "#/api/useCoordinates";
import {
  encodeValuationToURL,
  type ValuationInput,
} from "#/lib/valuation-url-utils";

export default function FlatValuationForm() {
  const navigate = useNavigate({ from: "/valuation" });
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  const form = useAppForm({
    ...flatValuationFormOptions,
    onSubmit: async ({ value }) => {
      setGeocodingError(null);
      try {
        const coords = await fetchCoordinates(
          value.street,
          value.streetNumber,
          value.district,
        );
        if (!coords) {
          setGeocodingError(
            "Could not find the address. Please check street name and number.",
          );
          return;
        }
        const input: ValuationInput = {
          district: value.district,
          rooms: value.rooms,
          area: Number(value.area),
          buildYear: Number(value.buildYear),
          condition: value.condition,
          hasParking: value.hasParking,
          floor: Number(value.floor),
          floorsInBuilding: Number(value.floorsInBuilding),
          hasElevator: value.hasElevator,
          hasBalcony: value.hasBalcony,
          market_type: value.market_type,
          offered_by: value.offered_by,
          heating: value.heating,
          lat: parseFloat(coords.lat),
          lon: parseFloat(coords.lon),
        };
        void navigate({
          to: "/valuation",
          search: { v: encodeValuationToURL(input) },
        });
      } catch {
        setGeocodingError(
          "Failed to look up the address. Please check your connection and try again.",
        );
      }
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
                options={valuationDistrictsCracow}
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
              <field.SelectField
                className={styles.roomsField}
                options={valuationRooms}
                label="Rooms"
                placeholder="Select rooms"
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
                decimals={2}
                placeholder="E.g. 75.50"
                style={{ width: "100%" }}
              />
            )}
          />
          <form.AppField
            name="floor"
            children={(field) => (
              <field.TextField
                label="Floor"
                id="floor"
                variant="full"
                onlyNumbers={true}
                placeholder="E.g. 3"
                style={{ width: "100%" }}
              />
            )}
          />
          <form.AppField
            name="floorsInBuilding"
            children={(field) => (
              <field.TextField
                label="Floors in Building"
                id="floorsInBuilding"
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
            name="market_type"
            children={(field) => (
              <field.SelectField
                className={styles.marketTypeField}
                options={valuationMarketTypes}
                label="Market type"
                placeholder="Select market type"
              />
            )}
          />
          <form.AppField
            name="offered_by"
            children={(field) => (
              <field.SelectField
                className={styles.offeredByField}
                options={valuationOfferedBy}
                label="Offered by"
                placeholder="Select seller type"
              />
            )}
          />
          <form.AppField
            name="heating"
            children={(field) => (
              <field.SelectField
                className={styles.heatingField}
                options={valuationHeating}
                label="Heating type"
                placeholder="Select heating type"
              />
            )}
          />
          <form.AppField
            name="condition"
            children={(field) => (
              <field.SelectField
                className={styles.conditionField}
                options={valuationCondition}
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
              name="hasElevator"
              children={(field) => (
                <field.CheckboxField label="Elevator" id="elevator" />
              )}
            />
            <form.AppField
              name="hasParking"
              children={(field) => (
                <field.CheckboxField label="Parking space" id="parking" />
              )}
            />
            <form.AppField
              name="hasBalcony"
              children={(field) => (
                <field.CheckboxField label="Balcony/Loggia" id="balcony" />
              )}
            />
          </section>
        </section>
      </section>
      <div className={styles.divider} />
      {geocodingError && (
        <div className={styles.errorBox}>
          <p
            className="font-text"
            style={{ color: "var(--clr-error-text)", lineHeight: 1.6 }}
          >
            {geocodingError}
          </p>
        </div>
      )}
      <Button
        className={styles.button}
        variant="primary"
        size="large"
        type="submit"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? "Looking up address..." : "Valuate the flat"}
      </Button>
    </form>
  );
}
