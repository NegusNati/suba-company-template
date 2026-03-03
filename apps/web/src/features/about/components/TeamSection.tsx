import { motion } from "motion/react";

import teamImage from "@/assets/about-us/team.webp";
import { AppImage } from "@/components/common/AppImage";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

interface TeamMember {
  name: string;
  role: string;
  description: string[];
  socialLinks: {
    twitter?: string;
    linkedin?: string;
  };
  labelPosition: "left" | "right";
}

const teamMembers: TeamMember[] = [
  {
    name: "Team Member 1",
    role: "Co Founder and Lead Developer",
    description: [
      "As Co-Founder and Lead Developer, they lead the engineering vision behind the products we build—turning complex business requirements into reliable, scalable systems. With hands-on experience across enterprise-level platforms used at national scale as well as startup MVPs, they focus on building solutions that are secure, maintainable, and ready to grow.",
      "They work closely with designers, stakeholders, and clients to translate ideas into clean architectures, practical roadmaps, and high-performance applications. From system design and API development to database planning and cloud deployment, they ensure every project is built with the right balance of speed, quality, and long-term stability.",
    ],
    socialLinks: {
      twitter: "#",
      linkedin: "#",
    },
    labelPosition: "left",
  },
  {
    name: "Team Member 2",
    role: "Co Founder and Lead Developer",
    description: [
      "As Co-Founder and Lead Developer, they lead the engineering vision behind the products we build—turning complex business requirements into reliable, scalable systems. With hands-on experience across enterprise-level platforms used at national scale as well as startup MVPs, they focus on building solutions that are secure, maintainable, and ready to grow.",
      "They work closely with designers, stakeholders, and clients to translate ideas into clean architectures, practical roadmaps, and high-performance applications. From system design and API development to database planning and cloud deployment, they ensure every project is built with the right balance of speed, quality, and long-term stability.",
    ],
    socialLinks: {
      twitter: "#",
      linkedin: "#",
    },
    labelPosition: "right",
  },
];

// X (Twitter) icon
const XIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
      fill="currentColor"
    />
  </svg>
);

// LinkedIn icon
const LinkedInIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      fill="currentColor"
    />
  </svg>
);

// Arrow icon for card header
const ArrowIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary"
  >
    <path
      d="M5 12h14M12 5l7 7-7 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TeamSection = () => {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="px-6 md:px-12 lg:px-20 py-16 md:py-24 content-auto"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div variants={item} className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-3 leading-tight tracking-tight">
            Our Team
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
            Skilled Developers and Designers with experience in building
            enterprise level systems that work at national level to startup
            project.
          </p>
        </motion.div>

        {/* Team Photo with Labels */}
        <motion.div variants={item} className="relative mb-12 md:mb-16">
          <div className="relative rounded-xl overflow-hidden">
            <AppImage
              src={teamImage}
              alt="Our Team"
              className="w-full h-auto object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
            />

            {/* Curved arrow labels overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Team Member 1 Label - Left side */}
              <div className="absolute left-[15%] md:left-[20%] bottom-[20%] md:bottom-[25%]">
                <div className="relative">
                  <span className="text-white text-sm md:text-base font-medium drop-shadow-lg">
                    Team Member 1
                  </span>
                  {/* Curved arrow pointing up-right */}
                  <svg
                    className="absolute -right-8 -top-6 w-8 h-8 text-white"
                    viewBox="0 0 40 40"
                    fill="none"
                  >
                    <path
                      d="M8 32 C10 20, 20 12, 32 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M28 4 L34 8 L30 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Team Member 2 Label - Right side */}
              <div className="absolute right-[10%] md:right-[15%] top-[15%] md:top-[20%]">
                <div className="relative">
                  {/* Curved arrow pointing down-left */}
                  <svg
                    className="absolute -left-10 -bottom-6 w-10 h-10 text-white"
                    viewBox="0 0 40 40"
                    fill="none"
                  >
                    <path
                      d="M32 8 C30 20, 20 28, 8 32"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 28 L8 34 L14 30"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-white text-sm md:text-base font-medium drop-shadow-lg">
                    Team Member 2
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Member Cards */}
        <motion.div
          variants={container}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={item}
              className="flex flex-col gap-4"
            >
              {/* Card Header with Arrow and Name */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <ArrowIcon />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-medium text-foreground leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mt-0.5">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4 pl-0 md:pl-9">
                {member.description.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex gap-3 pl-0 md:pl-9 mt-2">
                {member.socialLinks.twitter && (
                  <a
                    href={member.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
                    aria-label={`${member.name}'s X (Twitter) profile`}
                  >
                    <XIcon />
                  </a>
                )}
                {member.socialLinks.linkedin && (
                  <a
                    href={member.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
                    aria-label={`${member.name}'s LinkedIn profile`}
                  >
                    <LinkedInIcon />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};
