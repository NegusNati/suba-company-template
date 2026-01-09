import { motion } from "framer-motion";
import React, { useMemo } from "react";

import {
  LogoCloud,
  type LogoCloudPartner,
} from "@/components/common/logo-cloud";
import { useClientPartnersQuery, getPartnerLogoUrl } from "@/lib/partners";

export const PartnersSection: React.FC = () => {
  const { data, isLoading } = useClientPartnersQuery();

  const partners: LogoCloudPartner[] = useMemo(() => {
    if (!data?.data) return [];

    return data.data
      .filter((partner) => partner.logoUrl)
      .map((partner) => ({
        label: partner.title,
        logo: getPartnerLogoUrl(partner.logoUrl) as string,
      }));
  }, [data?.data]);

  // Don't render section if no partners or still loading with no cached data
  if (isLoading && partners.length === 0) {
    return null;
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      className="relative z-20 mt-6 max-w-9xl pb-14 md:-mt-8 md:pb-16"
    >
      <LogoCloud
        headline="Powering the best teams"
        partners={partners}
        className="bg-transparent pb-4 md:pb-6"
        gap={22}
      />
    </motion.section>
  );
};
