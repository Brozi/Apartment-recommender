type SubpageHeaderProps = {
  className: string;
  children: React.ReactNode;
};

export default function SubpageHeader({
  className,
  children,
}: SubpageHeaderProps) {
  return <header className={className}>{children}</header>;
}
