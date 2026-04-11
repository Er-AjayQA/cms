import HomePage from "@/app/page";

export default async function TenantLoginPage({ params }) {
  const { slug } = await params;

  return <HomePage tenantSlug={slug} />;
}
