import { usePartnerByIdQuery } from "../lib/partners-query";
import { PartnerForm } from "../PartnerForm";

interface PartnerViewProps {
  partnerId: number;
}

export default function PartnerView({ partnerId }: PartnerViewProps) {
  const { data, isPending, isError, error } = usePartnerByIdQuery(partnerId);

  if (isPending) return <div className="p-8">Loading partner...</div>;
  if (isError || !data?.data)
    return (
      <div className="p-8 text-destructive">
        Failed to load partner{error ? `: ${error.message}` : ""}
      </div>
    );

  return <PartnerForm mode="view" partner={data.data} />;
}
