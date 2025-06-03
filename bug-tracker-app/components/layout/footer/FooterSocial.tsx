import React from "react";
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";

const socials = [
  {
    name: "GitHub",
    href: "https://github.com/your-org/bugtracker",
    icon: <FaGithub />,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/yourhandle",
    icon: <FaTwitter />,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/yourcompany",
    icon: <FaLinkedin />,
  },
  {
    name: "Email",
    href: "mailto:support@bugtracker.com",
    icon: <FaEnvelope />,
  },
];

const FooterSocial: React.FC = () => (
  <div className="flex justify-center gap-6 mt-8">
    {socials.map((social) => (
      <a
        key={social.name}
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={social.name}
        className="text-gray-400 hover:text-white text-xl transition-colors duration-300"
      >
        {social.icon}
      </a>
    ))}
  </div>
);

export default FooterSocial;
