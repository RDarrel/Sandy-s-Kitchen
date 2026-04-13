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
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const LinkWithChild = (link) => {
  const { name, icon: Icon, children, path } = link;

  return (
    <Collapsible key={name} asChild className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={name}>
            {Icon && <Icon />}
            <span>{name}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {children?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.name}>
                <SidebarMenuSubButton asChild>
                  <Link to={`/platforms${path}${subItem.path}`}>
                    <span>{subItem.name}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const LinkWithoutChild = (link) => {
  const { name, icon: Icon, path } = link;
  return (
    <SidebarMenuItem key={name}>
      <SidebarMenuButton tooltip={name} asChild>
        <Link to={`/platforms${path}`}>
          {Icon && <Icon />}
          <span>{name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function NavMain({ links }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {links?.map((link) =>
          link?.children ? (
            <LinkWithChild key={link.name} {...link} />
          ) : (
            <LinkWithoutChild key={link.name} {...link} />
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
