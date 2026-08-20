import { TranslateProvider } from "@/context/translate-context";
import { TranslatePage } from "@/components/translate-page";

export default function HomePage() {
  return (
    <TranslateProvider>
      <TranslatePage />
    </TranslateProvider>
  );
}
