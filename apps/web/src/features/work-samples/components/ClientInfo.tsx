import React from "react";

interface ClientInfoProps {
  clientName: string | null | undefined;
}

export const ClientInfo: React.FC<ClientInfoProps> = ({ clientName }) => {
  if (!clientName) return null;

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-10">
      <span className="text-base text-gray-600">Client</span>
      <span className="text-base font-medium text-foreground">
        {clientName}
      </span>
    </div>
  );
};
