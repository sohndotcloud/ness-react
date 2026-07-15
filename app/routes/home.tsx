import type { Route } from "./+types/home";
import { Main } from "~/page/main";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ness" },
    { name: "description", content: "This is where things happen" },
  ];
}

export default function Home() {
  return <Main />;
}
