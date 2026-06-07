import { Slider as SliderBase } from "@base-ui/react/slider";
import { cn } from "#/lib/utils";
import styles from "./slider.module.css";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderBase.Root.Props) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  return (
    <SliderBase.Root
      className={cn(styles.root, className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderBase.Control className={styles.control}>
        <SliderBase.Track data-slot="slider-track" className={styles.track}>
          <SliderBase.Indicator
            data-slot="slider-range"
            className={styles.indicator}
          />
        </SliderBase.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderBase.Thumb
            data-slot="slider-thumb"
            key={index}
            className={styles.thumb}
          />
        ))}
      </SliderBase.Control>
    </SliderBase.Root>
  );
}

export { Slider };
