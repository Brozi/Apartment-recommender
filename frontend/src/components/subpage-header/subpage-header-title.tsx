type SubpageHeaderTitleProps = {
  label: string;
};

export default function SubpageHeaderTitle({ label }: SubpageHeaderTitleProps) {
  return <h1 className="font-h1">{label}</h1>;
}
