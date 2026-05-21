type SubpageHeaderTitleProps = {
  label: string;
};

export default function SubpageHeaderTitle({ label }: SubpageHeaderTitleProps) {
  return <h2 className="font-subpage-title">{label}</h2>;
}
