import * as z from "zod";

import styles from "#/components/map-forms/form.module.css";
import { FieldError, FieldGroup, FieldLegend, FieldSet } from "../ui/field";
import Button from "../ui/button";
import { Input } from "../ui/input";
import FormButton from "../ui/form-button";
import { useAppForm } from "../form";

const districtsCracow = [
  { label: "All", value: "all" },
  { label: "Stare Miasto", value: "stare_miasto" },
  { label: "Grzegórzki", value: "grzegorzki" },
  { label: "Prądnik Czerwony", value: "pradnik_czerwony" },
];

const rooms = [
  { label: "Any", value: "any" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5+", value: "5+" },
];

const condition = [
  { label: "Any", value: "any" },
  { label: "Ready to use", value: "ready_to_use" },
  { label: "To renovate", value: "to_renovate" },
  { label: "To completion", value: "to_completion" },
];

const filterFormSchema = z
  .object({
    districts: z.array(z.string()).min(1, "Select at least one district"),
    priceFrom: z
      .number()
      .min(0)
      .max(10000000, "Price must be between 0 and 10000000"),
    priceTo: z
      .number()
      .min(0)
      .max(10000000, "Price must be between 0 and 10000000"),
    rooms: z.string().min(1, "Select at least one option"),
    condition: z.string().min(1, "Select at least one option"),
  })
  .refine((data) => data.priceTo >= data.priceFrom, {
    message: "Price to must be greater than or equal to price from",
    path: ["priceTo"],
  });

export default function FilterForm() {
  const form = useAppForm({
    defaultValues: {
      districts: ["all"] as string[],
      priceFrom: 0,
      priceTo: 10000000,
      rooms: "any",
      condition: "any",
    },
    validators: {
      onChange: filterFormSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      id="filter-form"
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <section className={styles.buildingPart}>
        <form.AppField
          name="districts"
          children={(field) => {
            const { errors } = field.state.meta;
            const isInvalid = errors.length > 0;
            return (
              <field.ComboboxField
                isInvalid={isInvalid}
                options={districtsCracow}
                label="Districts"
              />
            );
          }}
        />

        <FieldSet>
          <FieldLegend>Total Price</FieldLegend>
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-8)",
              alignItems: "start",
            }}
          >
            <form.Field
              name="priceFrom"
              validators={{ onChangeListenTo: ["priceTo"] }}
              children={(field) => (
                <Input
                  id="price-from"
                  unit="zł"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/\D/g, "");
                    field.handleChange(Number(cleanValue));
                  }}
                  placeholder="From"
                  data-invalid={field.state.meta.errors.length > 0}
                  style={{ flex: 1, minWidth: 0 }}
                />
              )}
            />

            <form.Field
              name="priceTo"
              children={(field) => (
                <Input
                  id="price-to"
                  unit="zł"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/\D/g, "");
                    field.handleChange(Number(cleanValue));
                  }}
                  placeholder="To"
                  data-invalid={field.state.meta.errors.length > 0}
                  style={{ flex: 1, minWidth: 0 }}
                />
              )}
            />
          </div>
          <form.Subscribe
            selector={(state) => {
              const fromErrors = state.fieldMeta?.priceFrom?.errors || [];
              const toErrors = state.fieldMeta?.priceTo?.errors || [];
              return Array.from(new Set([...fromErrors, ...toErrors]));
            }}
            children={(errors) => {
              if (errors.length === 0) return null;
              return <FieldError errors={errors} />;
            }}
          />
        </FieldSet>

        <form.Field name="rooms">
          {(field) => {
            const { isTouched, errors } = field.state.meta;
            const isInvalid = isTouched && errors.length > 0;
            return (
              <FieldSet>
                <FieldLegend>Rooms</FieldLegend>
                <FieldGroup
                  style={{
                    display: "grid",
                    gap: "var(--spacing-8)",
                    gridTemplateColumns: "repeat(6, 1fr)",
                  }}
                >
                  {rooms.map((room) => {
                    const isSelected = field.state.value === room.value;
                    return (
                      <FormButton
                        isSelected={isSelected}
                        key={room.value}
                        dataInvalid={isInvalid}
                        type="button"
                        onClick={() => {
                          if (!isSelected) {
                            field.handleChange(room.value);
                          } else {
                            field.handleChange("");
                          }
                        }}
                      >
                        {room.label}
                      </FormButton>
                    );
                  })}
                </FieldGroup>
                {isInvalid && <FieldError errors={errors} />}
              </FieldSet>
            );
          }}
        </form.Field>

        <form.AppField
          name="condition"
          children={(field) => {
            const { isTouched, errors } = field.state.meta;
            const isInvalid = isTouched && errors.length > 0;
            return (
              <field.SelectField
                isInvalid={isInvalid}
                options={condition}
                label="Condition"
              />
            );
          }}
        />
      </section>

      <Button
        style={{ marginTop: "1rem" }}
        variant="primary"
        type="submit"
        form="filter-form"
        label="Apply Filters"
      />
    </form>
  );
}
