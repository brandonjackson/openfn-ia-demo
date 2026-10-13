import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SuggestedService, ConnectedSystemSummary } from "../../page-data";
import SectionHeading from "../../components/SectionHeading";
import SuggestedServiceCard from "../../components/SuggestedServiceCard";
import TextLink from "../../components/TextLink";

interface Props {
  services: SuggestedService[];
  systems: ConnectedSystemSummary[];
}

export default function SuggestedServicesSection({ services, systems }: Props) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = services.filter((s) => !dismissed.includes(s.id));

  return (
    <section>
      <SectionHeading
        title="Suggested services for your stack"
        description={`Based on your ${systems.length} connected systems.`}
        action={
          <TextLink to="/service-catalog" variant="action">
            View all services
          </TextLink>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map((service) => (
          <SuggestedServiceCard
            key={service.id}
            service={service}
            systems={systems}
            onStart={(s) => navigate("/projects/project-a/create", { state: { prompt: s.description } })}
            onDismiss={(s) => setDismissed((prev) => [...prev, s.id])}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-gray-400">
        Connect more systems to unlock additional service suggestions.
      </p>
    </section>
  );
}
