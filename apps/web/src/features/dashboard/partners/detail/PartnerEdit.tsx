import { usePartnerByIdQuery } from "../lib/partners-query";
import { PartnerForm } from "../PartnerForm";

interface PartnerEditProps {
  partnerId: number;
}

export default function PartnerEdit({ partnerId }: PartnerEditProps) {
  const { data, isPending, isError, error } = usePartnerByIdQuery(partnerId);

  if (isPending) return <div className="p-8">Loading partner...</div>;
  if (isError || !data?.data)
    return (
      <div className="p-8 text-destructive">
        Failed to load partner{error ? `: ${error.message}` : ""}
      </div>
    );

  return <PartnerForm mode="edit" partner={data.data} />;
}
