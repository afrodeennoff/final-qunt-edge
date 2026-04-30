import LocaleLayoutContent from "./layout-content";

export default function RootLayout(props: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  return (
    <LocaleLayoutContent params={props.params}>
      {props.children}
    </LocaleLayoutContent>
  );
}
