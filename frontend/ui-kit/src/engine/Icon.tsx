/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import agentLogo from "@/ui/assets/ai-logo-1.png";

export { Icon, type IconName } from "../ui/internal";

export function AgentMark({ className = "" }: { className?: string }) {
  return <img className={`ds-agent-mark ${className}`.trim()} src={agentLogo} alt="" />;
}
