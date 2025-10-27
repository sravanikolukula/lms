"use client";

import { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { IconType } from "react-icons";

interface SidebarItemProps {
  icon: LucideIcon | IconType;
  label: string;
  href: string;
};

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
}: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const onClick = () => {
    router.push(href);
  }

  return (
    <button
      onClick={onClick}
      type="button"
      // hover:bg-slate-300/20
      className={cn(
        "flex items-center gap-x-2 text-gray-400 text-sm font-[500] pl-6 transition-all hover:text-gray-100 hover:bg-teal-700/10",
        isActive && "text-text-primary font-[700] bg-teal-400/20 text-white font-semibold hover:bg-teal-700/30 hover:text-text-secondary"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        {/* <Icon
          size={22}
          className={cn(
            "text-slate-500",
            isActive && "text-text-secondary"
          )}
        /> */}
         <Icon
          size={22}
          className={cn(
            "text-gray-500 group-hover:text-gray-300",
            isActive && "text-teal-300"
          )}
        />
        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border-2 border-custom-primary h-full transition-all",
          isActive && "opacity-100"
        )}
      />
    </button>
  )
}