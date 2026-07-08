import type { IconName } from "@/components/icon";

export const contactEmail = "ynadigital.et@gmail.com";

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export interface ServiceItem {
  title: string;
  description: string;
  price: string;
  icon: IconName;
  features: readonly string[];
}

export const services: readonly ServiceItem[] = [
  {
    title: "Business Websites",
    description: "Professional websites that establish your brand online and convert visitors into customers.",
    price: "From $499",
    icon: "zap",
    features: ["Custom design", "Mobile responsive", "Contact forms", "Fast loading"],
  },
  {
    title: "E-commerce Stores",
    description: "Full-featured online stores with secure payments and inventory management.",
    price: "From $999",
    icon: "shopping-cart",
    features: ["Product catalog", "Secure checkout", "Order management", "Analytics"],
  },
  {
    title: "Portfolio Websites",
    description: "Showcase your work beautifully with stunning portfolio designs.",
    price: "From $299",
    icon: "briefcase",
    features: ["Gallery layouts", "Project showcases", "Client testimonials", "SEO ready"],
  },
  {
    title: "Website Redesign",
    description: "Transform your outdated website into a modern, high-converting digital presence.",
    price: "From $399",
    icon: "sparkles",
    features: ["Modern UI/UX", "Improved performance", "Better conversions", "Mobile first"],
  },
  {
    title: "Website Maintenance",
    description: "Keep your website secure, updated, and running smoothly with ongoing support.",
    price: "From $99/month",
    icon: "shield",
    features: ["Regular updates", "Security monitoring", "Backup management", "Content updates"],
  },
  {
    title: "SEO Optimization",
    description: "Improve your search rankings and drive more organic traffic to your website.",
    price: "From $199/month",
    icon: "trending-up",
    features: ["Keyword research", "On-page SEO", "Performance audit", "Monthly reports"],
  },
];

export interface ValueItem {
  title: string;
  description: string;
  icon: IconName;
}

export const values: readonly ValueItem[] = [
  {
    title: "Fast Delivery",
    description: "We deliver quality websites on time, every time.",
    icon: "zap",
  },
  {
    title: "Modern Designs",
    description: "Cutting-edge designs that make your brand stand out.",
    icon: "palette",
  },
  {
    title: "SEO Optimised",
    description: "Built with search engines in mind from day one.",
    icon: "search",
  },
  {
    title: "Mobile Responsive",
    description: "Perfect experience on every device and screen size.",
    icon: "smartphone",
  },
];

export interface TelebirrAccount {
  id: string;
  name: string;
  phone: string;
}

export const telebirrAccounts: readonly TelebirrAccount[] = [
  {
    id: "yohannes",
    name: process.env.TELEBIRR_NAME || "Yohannes Nigatu",
    phone: process.env.TELEBIRR_PHONE || "+251 908 029 753",
  },
  {
    id: "nathan",
    name: "Nathan Haddis",
    phone: "+251994669500",
  },
  {
    id: "abenezer",
    name: "Abenezer Ameha",
    phone: "+251959120225",
  },
];

export const pricingPackages = [
  {
    key: "starter",
    name: "Starter",
    usd: 299,
    etb: "15,000 ETB",
    popular: false,
    features: ["1-5 pages", "Mobile responsive", "Basic SEO", "Contact form", "1 revision", "7 days delivery"],
  },
  {
    key: "professional",
    name: "Professional",
    usd: 799,
    etb: "40,000 ETB",
    popular: true,
    features: ["Up to 10 pages", "Full SEO", "Blog setup", "3 revisions", "14 days delivery", "Priority support"],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    usd: 1499,
    etb: "75,000 ETB",
    popular: false,
    features: ["Unlimited pages", "Advanced SEO", "E-commerce", "Custom features", "Unlimited revisions", "21 days delivery", "Dedicated support"],
  },
] as const;

export const websiteTypes = [
  "Business Website",
  "E-commerce Store",
  "Portfolio Website",
  "Website Redesign",
  "Website Maintenance",
  "SEO Optimization",
  "Other",
] as const;

export const budgetRanges = ["Below $500", "$500-$1000", "$1000-$2500", "$2500-$5000", "$5000+", "Not Sure Yet"] as const;

export const budgetRangesByCurrency = {
  ETB: [
    "Below 15,000 ETB",
    "15,000 - 30,000 ETB",
    "30,000 - 60,000 ETB",
    "60,000 - 120,000 ETB",
    "120,000+ ETB",
    "Not Sure Yet",
  ],
  USD: [
    "Below $300",
    "$300 - $600",
    "$600 - $1,200",
    "$1,200 - $2,500",
    "$2,500+",
    "Not Sure Yet",
  ],
} as const;

export const defaultBudgetRangesEtbText = budgetRangesByCurrency.ETB.join("\n");
export const defaultBudgetRangesUsdText = budgetRangesByCurrency.USD.join("\n");

// Parses newline- or comma-separated budget ranges saved by the admin into a
// clean array, falling back to the provided defaults when nothing is set.
export function parseBudgetRanges(raw: string | null | undefined, fallback: readonly string[]): string[] {
  if (!raw) {
    return [...fallback];
  }
  const parsed = raw
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : [...fallback];
}

export const faqs = [
  {
    question: "How long does a website project take?",
    answer: "Most starter websites take around 7 days, professional websites take around 14 days, and larger custom projects are planned around your exact scope.",
  },
  {
    question: "Can you redesign my existing website?",
    answer: "Yes. We can modernize your current site, improve performance, make it mobile-first, and optimize it for better conversions.",
  },
  {
    question: "Do you support local Ethiopian payments?",
    answer: "Yes. You can pay locally via Telebirr and confirm your transaction through the pricing page confirmation form.",
  },
] as const;
