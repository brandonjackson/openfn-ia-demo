import { Link as RouterLink, type LinkProps } from "react-router-dom";

/**
 * An unstyled in-app link: the one place a component reaches the router to
 * move between pages. Everything that links (rows, cards, crumbs, menu items)
 * renders this, so a page mounted somewhere else, such as a LiveView island,
 * changes how links navigate by changing this file and nothing else.
 *
 * It takes the same props as React Router's `Link`. Style it with
 * `className`; for a link that looks like a link, use `TextLink`.
 */
export default function Link(props: LinkProps) {
  return <RouterLink {...props} />;
}
