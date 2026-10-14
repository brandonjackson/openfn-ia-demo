import Heading from "../Heading";

/** "Projects (1)": a page-level table title with its row count (`table_title`). */
export default function CountTitle({ title, count }: { title: string; count?: number }) {
  return (
    <Heading size="xl">
      {title}
      {count !== undefined && <span className="text-base font-normal"> ({count})</span>}
    </Heading>
  );
}
