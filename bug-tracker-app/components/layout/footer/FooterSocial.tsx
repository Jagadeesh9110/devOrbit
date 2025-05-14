import React from "react";
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";

const socials = [
  {
    name: "GitHub",
    href: "https://github.com/your-org/bugtracker",
    icon: <FaGithub />,
    color: "hover:text-primary-600",
  },
  {
    name: "Twitter",
    href: "https://twitter.com/yourhandle",
    icon: <FaTwitter />,
    color: "hover:text-accent-500",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/yourcompany",
    icon: <FaLinkedin />,
    color: "hover:text-success-500",
  },
  {
    name: "Email",
    href: "mailto:support@bugtracker.com",
    icon: <FaEnvelope />,
    color: "hover:text-primary-700",
  },
];

const FooterSocial: React.FC = () => (
  <div className="flex justify-center gap-5 mt-2">
    {socials.map((social) => (
      <a
        key={social.name}
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={social.name}
        className={`text-slate-400 text-xl transition-colors duration-300 ${social.color}`}
      >
        {social.icon}
      </a>
    ))}
  </div>
);

export default FooterSocial;
