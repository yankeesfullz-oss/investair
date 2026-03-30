import Hero from "@/components/Public/hero";
import TutorialLauncher from "@/components/Public/TutorialLauncher";

export const metadata = {
  title: "Nationwide Apartments for Rent & Investment Properties",
  description: "Browse nationwide apartments for rent and real estate investments. Investair Rentals connects renters and investors under one roof.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <TutorialLauncher />
    </>
  );
}
