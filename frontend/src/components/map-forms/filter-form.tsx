import { filterFormOptions } from "#/feature/filter-form/filter-form-options";
import { useAppForm } from "../form";
import { Button } from "../ui/button";
import { TotalPriceRangeField } from "../form/total-price-range-field";
import { PricePerUnitRangeField } from "../form/price-per-unit-range-field";
import { AreaRangeField } from "../form/area-range-field";
import { BuildYearRangeField } from "../form/build-year-range-field";
import { PoisField } from "../form/pois-field";
import styles from "#/components/map-forms/form.module.css";

const buildingTypes = [
  { label: "Any", value: "any" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
];

const districtsCracow = [
  { label: "All", value: "all" },
  { label: "Stare Miasto", value: "stare_miasto" },
  { label: "Grzegórzki", value: "grzegorzki" },
  { label: "Prądnik Czerwony", value: "pradnik_czerwony" },
  { label: "Prądnik Biały", value: "pradnik_bialy" },
  { label: "Krowodrza", value: "krowodrza" },
  { label: "Zwierzyniec", value: "zwierzyniec" },
  { label: "Bronowice", value: "bronowice" },
  { label: "Łobzów", value: "lobzow" },
  { label: "Dębniki", value: "debniki" },
  { label: "Podgórze", value: "podgorze" },
  { label: "Bieżanów-Prokocim", value: "biezanow_prokocim" },
  { label: "Swoszowice", value: "swoszowice" },
  { label: "Wzgórza Krzesławickie", value: "wzgorza_krzeslawickie" },
  { label: "Nowa Huta", value: "nowa_huta" },
  { label: "Czyżyny", value: "czyzyny" },
  { label: "Mistrzejowice", value: "mistrzejowice" },
  { label: "Bieńczyce", value: "bienczyce" },
  { label: "Łagiewniki-Borek Fałęcki", value: "lagiewniki_borek_falecki" },
  { label: "Podgórze Duchackie", value: "podgorze_duchackie" },
];

const rooms = [
  { label: "Any", value: "any" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5+", value: "5+" },
];

const marketTypes = [
  { label: "Any", value: "any" },
  { label: "Primary", value: "primary" },
  { label: "Secondary", value: "secondary" },
];

const condition = [
  { label: "Any", value: "any" },
  { label: "Ready to Use", value: "ready_to_use" },
  { label: "To Renovation", value: "to_renovation" },
  { label: "To Completion", value: "to_completion" },
];

export default function FilterForm() {
  const form = useAppForm({
    ...filterFormOptions,
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
          name="buildingType"
          children={(field) => (
            <field.ChoiceChipsField
              options={buildingTypes}
              label="Building Type"
              type="single"
            />
          )}
        />

        <form.AppField
          name="districts"
          children={(field) => (
            <field.ComboboxField options={districtsCracow} label="Districts" />
          )}
        />

        <TotalPriceRangeField form={form} />

        <PricePerUnitRangeField form={form} />

        <AreaRangeField form={form} />

        <BuildYearRangeField form={form} />

        <form.AppField
          name="rooms"
          children={(field) => (
            <field.ChoiceChipsField
              options={rooms}
              label="Rooms"
              type="multi"
            />
          )}
        />

        <form.AppField
          name="marketType"
          children={(field) => (
            <field.ChoiceChipsField
              options={marketTypes}
              label="Market Type"
              type="single"
            />
          )}
        />

        <form.AppField
          name="condition"
          children={(field) => (
            <field.SelectField options={condition} label="Condition" />
          )}
        />

        <PoisField form={form} />
      </section>

      <Button
        style={{ marginTop: "1rem" }}
        variant="primary"
        size="large"
        type="submit"
        form="filter-form"
      >
        Apply Filters
      </Button>
    </form>
  );
}
