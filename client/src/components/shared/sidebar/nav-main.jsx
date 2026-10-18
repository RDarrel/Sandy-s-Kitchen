import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, matchPath, useLocation } from "react-router-dom";

const buildPlatformPath = (...segments) =>
  `/platforms${segments.join("")}`.replace(/\/+/g, "/");

const isPathActive = (pathname, targetPath) =>
  Boolean(
    matchPath(
      {
        path: targetPath,
        end: false,
      },
      pathname,
    ),
  );

// Check whether a parent has any active descendant.
const hasActiveChild = (item, pathname, parentPath = "") => {
  const fullPath = `${parentPath}${item.path ?? ""}`;

  if (!item.children?.length) {
    return isPathActive(pathname, buildPlatformPath(fullPath));
  }

  return item.children.some((child) =>
    hasActiveChild(child, pathname, fullPath),
  );
};

const NestedMenuItem = ({ item, pathname, parentPath = "", depth = 0 }) => {
  const { name, icon: Icon, children, path = "" } = item;

  const fullPath = `${parentPath}${path}`;
  const hasChildren = Array.isArray(children) && children.length > 0;

  const isActive = hasActiveChild(item, pathname, parentPath);

  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  // Leaf navigation item
  if (!hasChildren) {
    const to = buildPlatformPath(fullPath);

    if (depth === 0) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            tooltip={name}
            isActive={isPathActive(pathname, to)}
          >
            <Link to={to}>
              {Icon && <Icon />}
              <span>{name}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={isPathActive(pathname, to)}>
          <Link to={to}>
            {Icon && <Icon className="size-4 shrink-0" />}
            <span>{name}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  const content = (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <CollapsibleTrigger asChild>
        {depth === 0 ? (
          <SidebarMenuButton tooltip={name}>
            {Icon && <Icon />}
            <span>{name}</span>
            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        ) : (
          <SidebarMenuSubButton className="w-full cursor-pointer">
            {Icon && <Icon className="size-4 shrink-0" />}
            <span>{name}</span>
            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuSubButton>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <SidebarMenuSub>
          {children.map((child) => (
            <NestedMenuItem
              key={`${fullPath}/${child.path}/${child.name}`}
              item={child}
              pathname={pathname}
              parentPath={fullPath}
              depth={depth + 1}
            />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );

  return depth === 0 ? (
    <SidebarMenuItem>{content}</SidebarMenuItem>
  ) : (
    <SidebarMenuSubItem>{content}</SidebarMenuSubItem>
  );
};

export function NavMain({ links, label = "Platforms" }) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>

      <SidebarMenu>
        {links?.map((link) => (
          <NestedMenuItem key={link.name} item={link} pathname={pathname} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
