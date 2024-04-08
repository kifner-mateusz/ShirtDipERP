import {
  IconArchive,
  IconArchiveFilled,
  IconBell,
  IconBellFilled,
  IconBoxSeam,
  IconCalendar,
  IconCalendarFilled,
  IconChecklist,
  IconCrown,
  IconMail,
  IconMailFilled,
  IconSettings,
  IconShirt,
  IconShirtFilled,
  IconShoppingCart,
  IconShoppingCartFilled,
  IconUser,
  IconUserFilled,
} from "@tabler/icons-react";

import type TablerIconType from "@/types/TablerIconType";

export interface NavigationData {
  label: string;
  Icon: TablerIconType;
  href: string;
  entryName: string;
  gradient?: { from: string; to: string; deg: number };
  debug?: boolean;
}

const navigationData: { [key: string]: NavigationData } = {
  calendar: {
    label: "Kalendarz",
    Icon: IconCalendar,
    href: "/erp/calendar",
    entryName: "calendar",
    gradient: { from: "#099268", to: "#66A80F", deg: 105 },
  },
  order: {
    label: "Zamówienia",
    Icon: IconCrown,
    href: "/erp/order",
    entryName: "order",
    gradient: { from: "#3B5BDB", to: "#0C8599", deg: 105 },
  },
  warehouse: {
    label: "Magazyn",
    Icon: IconBoxSeam,
    href: "/erp/warehouse",
    entryName: "warehouse",
    gradient: { from: "#9C36B5", to: "#E03131", deg: 105 },
  },
  email: {
    label: "Maile",
    Icon: IconMail,
    href: "/erp/email",
    entryName: "email",
    gradient: { from: "#E8590C", to: "#F08C00", deg: 105 },
  },
  expense: {
    label: "Wydatki",
    Icon: IconShoppingCart,
    href: "/erp/expense",
    entryName: "expense",
    gradient: { from: "#E03131", to: "#E8590C", deg: 105 },
  },
  task: {
    label: "Zadania",
    Icon: IconChecklist,
    href: "/erp/task",
    entryName: "task",
    gradient: { from: "#099268", to: "#66A80F", deg: 105 },
  },
  "order-archive": {
    label: "Archiwum",
    Icon: IconArchive,
    href: "/erp/order-archive",
    entryName: "orders-archive",
    debug: true,
  },
  product: {
    label: "Produkty",
    Icon: IconShirt,
    href: "/erp/product",
    entryName: "product",
    gradient: { from: "#9C36B5", to: "#E03131", deg: 105 },
  },
  customer: {
    label: "Klienci",
    Icon: IconUser,
    href: "/erp/customer",
    entryName: "customer",
    gradient: { from: "#E8590C", to: "#F08C00", deg: 105 },
  },
  admin: {
    label: "Admin",
    Icon: IconBell,
    href: "/erp",
    entryName: "admin",
    debug: true,
  },
  user: {
    label: "Pracownicy",
    Icon: IconBell,
    href: "/erp/user",
    entryName: "user",
    debug: true,
  },
  settings: {
    label: "Ustawienia",
    Icon: IconSettings,
    href: "/erp/settings",
    entryName: "settings",
    debug: true,
  },
};

export default navigationData;
