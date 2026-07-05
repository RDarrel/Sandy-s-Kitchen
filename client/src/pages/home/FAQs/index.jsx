import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import "./style.css";

const FAQs = () => {
  const faqs = [
    {
      question: "Do you accept catering reservations?",
      answer:
        "Yes. You can inquire about catering for birthdays, weddings, meetings, and private gatherings. It is best to reserve early so the team can confirm your date, menu needs, and setup details.",
    },
    {
      question: "Can I reserve the venue for a private event?",
      answer:
        "Yes. Sandy's Kitchenette can accommodate private celebrations and gatherings. Availability depends on your preferred date, expected guests, and event requirements.",
    },
    {
      question: "Do you offer dine-in meals?",
      answer:
        "Yes. Guests can visit for dine-in meals, casual family dining, and simple celebrations. Menu availability may vary depending on the day and scheduled events.",
    },
    {
      question: "Can you help with event setup and serving?",
      answer:
        "Yes. The team can help coordinate food preparation, buffet setup, and serving support so your gathering feels smoother from preparation to cleanup.",
    },
    {
      question: "How early should I book?",
      answer:
        "Booking as early as possible is recommended, especially for weekends and peak celebration dates. Early booking gives more time to confirm your package, food choices, and venue arrangements.",
    },
  ];

  return (
    <section className="faqs" id="faqs">
      <div className="faqs__inner">
        <div className="faqs__header">
          <p className="faqs__eyebrow">
            <HelpCircle />
            Frequently Asked Questions
          </p>
          <h2 className="faqs__title">Helpful answers before you plan.</h2>
          <p className="faqs__lead">
            A quick guide for dining, catering, reservations, and celebrations
            at Sandy's Kitchenette.
          </p>
        </div>

        <Accordion type="single" collapsible className="faqs__accordion">
          {faqs.map(({ question, answer }, index) => (
            <AccordionItem value={`faq-${index + 1}`} key={question}>
              <AccordionTrigger>{question}</AccordionTrigger>
              <AccordionContent>{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQs;
