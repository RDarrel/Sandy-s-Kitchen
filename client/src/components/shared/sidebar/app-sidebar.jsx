import React, { useEffect, useState } from "react";

import { NavMain } from "@/components/shared/sidebar/nav-main";
import { NavUser } from "@/components/shared/sidebar/nav-user";
import { TeamSwitcher } from "@/components/shared/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import access from "@/pages/platforms/access";
import { useSelector } from "react-redux";

export function AppSidebar({ ...props }) {
  const { role } = useSelector(({ auth }) => auth),
    [links, setLinks] = useState([]);

  useEffect(() => {
    setLinks(access[role || "PRINCIPAL"] || []);
  }, [role]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain links={links} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
