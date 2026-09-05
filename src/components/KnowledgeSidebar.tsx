import { BookOpen, ChevronRight, Command, Flame, Settings2, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

type KnowledgeSidebarProps = {
  path: string;
  editable: boolean;
  nodeCount: number;
  entryCount: number;
  highlightCount: number;
};

export function KnowledgeSidebar({ path, editable, nodeCount, entryCount, highlightCount }: KnowledgeSidebarProps) {
  const isHighlights = path.includes("/highlights");
  const knowledgeHref = editable ? "/admin" : "/knowledge";
  const highlightsHref = editable ? "/admin/highlights" : "/highlights";

  return (
    <Sidebar>
      <SidebarHeader>
        <a href="/knowledge" className="brand-lockup" aria-label="Open public knowledge journey">
          <span className="brand-mark">
            <Command size={15} strokeWidth={2.2} />
          </span>
          <span>
            <span className="brand-name">SON VIET</span>
            <span className="brand-caption">engineering journal</span>
          </span>
        </a>
      </SidebarHeader>

      <SidebarContent>
        <div className="sidebar-section-label">Workspace</div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href={knowledgeHref} active={!isHighlights}>
              <BookOpen size={17} />
              <span>Knowledge</span>
              <ChevronRight className="sidebar-item-chevron" size={14} />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href={highlightsHref} active={isHighlights}>
              <Flame size={17} />
              <span>Highlights</span>
              <span className="sidebar-menu-count">{String(highlightCount).padStart(2, "0")}</span>
              <ChevronRight className="sidebar-item-chevron" size={14} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="sidebar-divider" />

        <div className="sidebar-section-label">Journey index</div>
        <div className="sidebar-index-card">
          <div className="index-card-topline">
            <span className="index-pulse" />
            <span>Live index</span>
            <Sparkles size={13} />
          </div>
          <div className="index-stats">
            <div>
              <strong>{String(nodeCount).padStart(2, "0")}</strong>
              <span>milestones</span>
            </div>
            <div>
              <strong>{String(entryCount).padStart(2, "0")}</strong>
              <span>notes</span>
            </div>
          </div>
        </div>

        <div className="sidebar-section-label sidebar-section-label--spaced">Mode</div>
        <div className="sidebar-mode-note">
          <span className="mode-dot" />
          {editable ? "Local editor" : "Public read-only"}
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="sidebar-footer-card">
          <div className="footer-avatar">SV</div>
          <div className="footer-copy">
            <span>Son Viet</span>
            <small>building in public</small>
          </div>
          <Settings2 size={15} className="footer-settings" />
        </div>
        <Badge className="sidebar-version">LOCAL / V0.1</Badge>
      </SidebarFooter>
    </Sidebar>
  );
}
