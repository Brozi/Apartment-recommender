type BtnGroupProps = {
  className?: string;
  children: React.ReactNode;
};

export default function BtnGroup({ className, children }: BtnGroupProps) {
  return <div className={className}>{children}</div>;
}
