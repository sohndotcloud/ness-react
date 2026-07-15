import type { Route } from "./+types/home";
import { Main } from "~/page/main";
import {Library} from "~/page/library";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ness" },
    { name: "description", content: "This is where things happen" },
  ];
}

export default function Home() {
  return <Library />;
}
