import styles from "./form.module.css";
import { withForm } from "#/components/form";
import { mapFormOptions } from "./map-form-options";
import { Button } from "#/components/ui/button";
import { Slider } from "#/components/ui/slider";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Checkbox } from "#/components/ui/checkbox";
import { resultOptions } from "#/lib/formConstants";

function formatValueToLabel(input: string): string {
  return input
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const MAX_IMPORTANCE = 100;

function readSliderValue(value: number | readonly number[]): number {
  return Array.isArray(value) ? (value[0] ?? 0) : Number(value);
}

export const Step2RecommendationForm = withForm({
  ...mapFormOptions,
  props: {
    step: 1,
    setStep: (_step: number) => {},
  },
  render: function Render({ form, step, setStep }) {
    return (
      <form.FormGroup
        name="step2"
        onGroupSubmit={({ value: _value }) => {
          form.handleSubmit();
        }}
      >
        {(formGroup) => (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              formGroup.handleSubmit();
            }}
          >
            <section className={styles.formContent} data-map-form-scroll="true">
              <form.Field
                name="step2.skipRecommendation"
                children={(field) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      checked={field.state.value}
                      name={field.name}
                      onCheckedChange={() =>
                        field.handleChange(!field.state.value)
                      }
                    />
                    <FieldLabel
                      style={{ paddingBottom: "1px" }}
                      htmlFor={field.name}
                      fontType="paragraph"
                    >
                      Skip recommendation part
                    </FieldLabel>
                  </Field>
                )}
              />
              <form.Subscribe
                selector={(state) => ({
                  skipRecommendation: state.values.step2.skipRecommendation,
                  buildingPartImportance:
                    state.values.step2.buildingPartImportance,
                  poisImportance: state.values.step2.poisImportance,
                })}
                children={({
                  skipRecommendation,
                  buildingPartImportance,
                  poisImportance,
                }) =>
                  !skipRecommendation ? (
                    <>
                      <section>
                        <div className={styles.buildingPartHeader}>
                          <h2 className="font-h2" style={{ lineHeight: 1.35 }}>
                            Rate the importance of selected filters
                          </h2>
                          <p
                            className="font-paragraph"
                            style={{ lineHeight: 1.6 }}
                          >
                            This will help us establish apartments/houses best
                            suited to your needs and preferences.
                          </p>
                        </div>
                        <div className={styles.recommendationList}>
                          {buildingPartImportance.map(({ part }, index) => (
                            <form.AppField
                              key={`${part}-${index}`}
                              name={`step2.buildingPartImportance[${index}].importance`}
                              children={(field) => (
                                <Field>
                                  <FieldLabel htmlFor={part}>
                                    {formatValueToLabel(part)}
                                  </FieldLabel>
                                  <FieldGroup
                                    className={styles.recommendationControls}
                                  >
                                    <field.NumberField
                                      variant="bare"
                                      id={part}
                                      maxValue={MAX_IMPORTANCE}
                                      unit="%"
                                    />
                                    <Slider
                                      min={0}
                                      max={MAX_IMPORTANCE}
                                      step={1}
                                      value={[field.state.value]}
                                      onValueChange={(value) =>
                                        field.handleChange(
                                          readSliderValue(value),
                                        )
                                      }
                                    />
                                  </FieldGroup>
                                </Field>
                              )}
                            />
                          ))}
                        </div>
                      </section>

                      <section className={styles.poisPart}>
                        <h2 className="font-h2" style={{ lineHeight: 1.35 }}>
                          Points of interest
                        </h2>
                        <div className={styles.recommendationList}>
                          {poisImportance.map(({ poi }, index) => (
                            <form.AppField
                              key={`${poi}-${index}`}
                              name={`step2.poisImportance[${index}].importance`}
                              children={(field) => (
                                <Field>
                                  <FieldLabel htmlFor={poi}>
                                    {formatValueToLabel(poi)}
                                  </FieldLabel>
                                  <FieldGroup
                                    className={styles.recommendationControls}
                                  >
                                    <field.NumberField
                                      id={poi}
                                      maxValue={MAX_IMPORTANCE}
                                      unit="%"
                                      variant="bare"
                                    />
                                    <Slider
                                      min={0}
                                      max={MAX_IMPORTANCE}
                                      step={1}
                                      value={[field.state.value]}
                                      onValueChange={(value) =>
                                        field.handleChange(
                                          readSliderValue(value),
                                        )
                                      }
                                    />
                                  </FieldGroup>
                                </Field>
                              )}
                            />
                          ))}
                        </div>
                      </section>

                      <section className={styles.resultsPart}>
                        <form.AppField
                          name="step2.results"
                          children={(field) => (
                            <field.ChoiceChipsField
                              options={resultOptions}
                              label="Results"
                              type="single"
                            />
                          )}
                        />
                      </section>
                    </>
                  ) : null
                }
              />
            </section>

            <section className={styles.formActions}>
              <div className={styles.divider} />
              <Button
                className={styles.buttonLeft}
                variant="secondary"
                size="large"
                onClick={() => setStep(step - 1)}
              >
                Go back
              </Button>
              <Button
                className={styles.buttonRight}
                variant="primary"
                size="large"
                type="submit"
              >
                Apply Filters
              </Button>
            </section>
          </form>
        )}
      </form.FormGroup>
    );
  },
});
