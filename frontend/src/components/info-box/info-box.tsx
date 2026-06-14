import InfoBoxLine from "#/components/info-box/info-box-line";
import InfoBoxLineWrapper from "#/components/info-box/info-box-line-wrapper";
import Box from "./box";

type InfoBoxProps = {
  title: string;
  firstLineTitle: string;
  firstLineValue: number;
  secondLineTitle: string;
  secondLineValue: number;
  unit: string | "";
};

export default function InfoBox({
  title,
  firstLineTitle,
  firstLineValue,
  secondLineTitle,
  secondLineValue,
  unit,
}: InfoBoxProps) {
  return (
    <Box title={title}>
      <InfoBoxLineWrapper>
        <InfoBoxLine
          title={firstLineTitle}
          value={firstLineValue}
          unit={unit}
        />
        <InfoBoxLine
          title={secondLineTitle}
          value={secondLineValue}
          unit={unit}
        />
      </InfoBoxLineWrapper>
    </Box>
  );
}
