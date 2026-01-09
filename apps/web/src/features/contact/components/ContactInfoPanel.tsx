import { Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { motion, type Variants } from "motion/react";
import React from "react";

// Company Logo SVG Component
const CompanyLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C8.5 2 6 4.5 6 7.5C6 9.5 7 11 8.5 12C6.5 13 5 15.5 5 18C5 18.5 5.5 19 6 19H7C7.5 19 8 18.5 8 18C8 16 9.5 14 12 14C14.5 14 16 16 16 18C16 18.5 16.5 19 17 19H18C18.5 19 19 18.5 19 18C19 15.5 17.5 13 15.5 12C17 11 18 9.5 18 7.5C18 4.5 15.5 2 12 2ZM12 4C14.5 4 16 5.5 16 7.5C16 9.5 14.5 11 12 11C9.5 11 8 9.5 8 7.5C8 5.5 9.5 4 12 4Z"
      fill="currentColor"
    />
    <circle cx="10" cy="7" r="1" fill="currentColor" opacity="0.6" />
    <path
      d="M14 6.5C14.5 6 15.5 6.5 16 7C15.5 7 14.5 7 14 6.5Z"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
);

// X (Twitter) Icon
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      fill="currentColor"
    />
  </svg>
);

interface ContactInfoItem {
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface SocialLink {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface ContactInfoPanelProps {
  contactLabel?: string;
  contactSubtitle?: string;
  contactInfo?: ContactInfoItem[];
  socialLinks?: SocialLink[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const DEFAULT_CONTACT_INFO: ContactInfoItem[] = [
  {
    icon: <Phone size={16} className="text-muted-foreground flex-shrink-0" />,
    content: (
      <>
        <p>+ 251 90 000 0000</p>
        <p>+ 251 90 000 0000</p>
      </>
    ),
  },
  {
    icon: <MapPin size={16} className="text-muted-foreground flex-shrink-0" />,
    content: (
      <p>
        Bole Atlas, Addis Ababa.
        <br />
        Center Point Apartment 8th floor
      </p>
    ),
  },
  {
    icon: <Mail size={16} className="text-muted-foreground flex-shrink-0" />,
    content: <p>contact@example.com</p>,
  },
];

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    icon: <XIcon className="w-4 h-4" />,
    label: "X (Formerly Twitter)",
    href: "#",
  },
  {
    icon: <Linkedin size={16} />,
    label: "LinkedIn",
    href: "#",
  },
  {
    icon: <Instagram size={16} />,
    label: "Instagram",
    href: "#",
  },
];

export const ContactInfoPanel: React.FC<ContactInfoPanelProps> = ({
  contactLabel = "Contact Us",
  contactSubtitle = "Let's talk about your project!",
  contactInfo = DEFAULT_CONTACT_INFO,
  socialLinks = DEFAULT_SOCIAL_LINKS,
}) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-8"
  >
    {/* Company Logo */}
    <motion.div
      variants={itemVariants}
      className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-sm"
    >
      <CompanyLogo className="w-6 h-6 text-primary-foreground" />
    </motion.div>

    {/* Header */}
    <motion.div variants={itemVariants} className="space-y-1">
      <h3 className="text-base font-medium text-foreground">{contactLabel}</h3>
      <p className="text-sm text-muted-foreground">{contactSubtitle}</p>
    </motion.div>

    {/* Contact Information */}
    <motion.div variants={itemVariants} className="space-y-4">
      <p className="text-sm font-semibold text-foreground">
        Contact Information
      </p>
      <div className="space-y-4">
        {contactInfo.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex items-start gap-3"
          >
            <span className="mt-0.5">{item.icon}</span>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {item.content}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Social Medias */}
    <motion.div variants={itemVariants} className="space-y-4">
      <p className="text-sm font-semibold text-foreground">Social Medias</p>
      <div className="space-y-3">
        {socialLinks.map((link) => (
          <motion.a
            key={link.label}
            href={link.href}
            variants={itemVariants}
            whileHover={{ x: 2 }}
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
          >
            <span className="text-muted-foreground group-hover:text-primary transition-colors">
              {link.icon}
            </span>
            <span>{link.label}</span>
          </motion.a>
        ))}
      </div>
    </motion.div>
  </motion.div>
);
