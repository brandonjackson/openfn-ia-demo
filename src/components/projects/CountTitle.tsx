/** "Projects (1)": a page-level table title with its row count (`table_title`). */
export default function CountTitle({ title, count }: { title: string; count?: number }) {
  return (
    <h3 className="text-3xl font-bold">
      {title}
      {count !== undefined && (
        <>
          {" "}
          <span className="text-base font-normal">({count})</span>
        </>
      )}
    </h3>
  );
}
