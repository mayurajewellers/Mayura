import {
  Activity,
  FileText,
  Gem,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  Video,
} from 'lucide-react'
import { ROUTES } from './routes'

export const ADMIN_NAVIGATION = [
  {
    title: 'Core Analytics',
    items: [
      {
        label: 'Dashboard Overview',
        path: ROUTES.admin,
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: 'Catalogue Management',
    items: [
      {
        label: 'Products',
        path: ROUTES.adminProducts,
        icon: Package,
      },
      {
        label: 'Collections',
        path: ROUTES.adminCollections,
        icon: Layers,
      },
      {
        label: 'Stock Inventory',
        path: ROUTES.adminInventory,
        icon: Activity,
      },
    ],
  },
  {
    title: 'Content CMS',
    items: [
      {
        label: 'Content Overview',
        path: ROUTES.adminContent,
        icon: Globe,
        exact: true,
      },
      {
        label: 'Homepage CMS',
        path: ROUTES.adminContentHomepage,
        icon: Sparkles,
      },
      {
        label: 'Hero Banners',
        path: ROUTES.adminContentBanners,
        icon: Gem,
      },
      {
        label: 'Testimonials',
        path: ROUTES.adminContentTestimonials,
        icon: Star,
      },
      {
        label: 'Media Gallery',
        path: ROUTES.adminContentGallery,
        icon: ImageIcon,
      },
      {
        label: 'FAQs',
        path: ROUTES.adminContentFaqs,
        icon: HelpCircle,
      },
      {
        label: 'Blog Journal',
        path: ROUTES.adminContentBlog,
        icon: FileText,
      },
      {
        label: 'Store Policies',
        path: ROUTES.adminContentPolicies,
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: 'Commerce Operations',
    items: [
      {
        label: 'Customer Orders',
        path: ROUTES.adminOrders,
        icon: ShoppingBag,
      },
    ],
  },
  {
    title: 'Customer Operations',
    items: [
      {
        label: 'Customer Enquiries',
        path: ROUTES.adminEnquiries,
        icon: Mail,
      },
      {
        label: 'Video Consultations',
        path: ROUTES.adminConsultations,
        icon: Video,
      },
      {
        label: 'Newsletter Insiders',
        path: ROUTES.adminNewsletter,
        icon: Users,
      },
    ],
  },
  {
    title: 'Media & Asset Vault',
    items: [
      {
        label: 'Media Library',
        path: ROUTES.adminMedia,
        icon: ImageIcon,
      },
    ],
  },
  {
    title: 'System Settings',
    items: [
      {
        label: 'Store Configuration',
        path: ROUTES.adminSettings,
        icon: Settings,
      },
    ],
  },
]
