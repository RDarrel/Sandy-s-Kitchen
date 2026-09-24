import React, { useEffect, useMemo, useState } from "react";
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
import { useSelector } from "react-redux";
import { ADMIN_SYSTEM } from "@/pages/platforms/admininistrator/access";
import access from "@/pages/platforms/access";

export function AppSidebar({ ...props }) {
  const { auth } = useSelector(({ auth }) => auth),
    [links, setLinks] = useState([]);

  useEffect(() => {
    setLinks(access[auth?.role] || []);
  }, [auth]);

  const isAdmin = useMemo(() => {
    return auth.role === 1;
  }, [auth.role]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain links={links} label={isAdmin ? "Management" : "Platforms"} />
        {isAdmin && <NavMain links={ADMIN_SYSTEM} label="Administration" />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
