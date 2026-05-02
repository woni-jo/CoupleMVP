import { HomeFlow } from "@/components/HomeFlow";
import { MobileShell } from "@/components/MobileShell";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const shouldStartFromSelection = getParam(params.start) === "1";

  return (
    <MobileShell>
      <HomeFlow initialStarted={shouldStartFromSelection} />
    </MobileShell>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
