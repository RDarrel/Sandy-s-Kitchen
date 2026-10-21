import { Formatter } from "@/services/utilities";
import { Mail, Phone, ReceiptText, UserRound } from "lucide-react";
import { createElement } from "react";
import { Section } from "./components";
import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonSectionHeader,
} from "./skeletons";

const CustomerInformation = ({ booking }) => {
  const contact = booking?.contact || {};

  return (
    <Section title="Contact information" icon={UserRound}>
      <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        <ContactItem
          icon={UserRound}
          label="Contact person"
          value={contact?.name}
        />

        <ContactItem icon={Phone} label="Phone" value={contact?.phone} />

        <ContactItem icon={Mail} label="Email" value={contact?.email} />

        <ContactItem
          icon={ReceiptText}
          label="Preferred contact"
          value={Formatter.preferredContact(contact?.preferredContact)}
        />
      </div>
    </Section>
  );
};

export default CustomerInformation;

const ContactItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex min-w-0 items-start gap-2">
      {createElement(Icon, {
        className: "mt-0.5 size-3.5 shrink-0 text-muted-foreground",
      })}

      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>

        <p className="mt-0.5 break-words text-xs font-medium">{value || "-"}</p>
      </div>
    </div>
  );
};

export const ContactSkeleton = () => {
  return (
    <SkeletonCard>
      <SkeletonSectionHeader />
      <div className="grid gap-x-6 gap-y-2.5 p-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex items-start gap-2">
            <SkeletonBlock className="mt-0.5 size-3.5 shrink-0" />

            <div>
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="mt-1.5 h-3.5 w-28" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
};
