import { redirect } from "next/navigation";

// Raiz apenas redireciona: o middleware cuida de logado vs. não logado.
export default function Home() {
  redirect("/painel");
}
