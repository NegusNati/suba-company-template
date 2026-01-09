import LionSvg from "@/assets/contact/lion.svg";
import { PageHero } from "@/components/common/PageHero";

export const ContactHero: React.FC = () => {
  return <PageHero title="Contact Us" image={LionSvg} imageAlt="lion" />;
};
