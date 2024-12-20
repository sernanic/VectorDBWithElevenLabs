export type DocSubsubsection = {
  id: string;
  title: string;
  content: string;
};

export type DocSubsection = {
  id: string;
  title: string;
  content: string;
  subsubsections?: DocSubsubsection[];
};

export type DocSection = {
  id: string;
  title: string;
  subsections: DocSubsection[];
};

export const documentationSections: DocSection[] = [
  {
    id: "invoices",
    title: "Invoices",
    subsections: [
      {
        id: "invoices-overview",
        title: "Overview",
        content: "Learn about Mobiwork's invoicing system",
        subsubsections: [
          {
            id: "what-are-invoices",
            title: "What are Invoices?",
            content: "Detailed explanation of invoices in Mobiwork"
          },
          {
            id: "invoice-lifecycle",
            title: "Invoice Lifecycle",
            content: "Understanding the lifecycle of an invoice"
          }
        ]
      },
      {
        id: "creating-invoices",
        title: "Creating Invoices",
        content: "Step by step guide to create invoices",
        subsubsections: [
          {
            id: "invoice-creation-process",
            title: "Creation Process",
            content: "Detailed steps to create an invoice"
          },
          {
            id: "invoice-templates",
            title: "Invoice Templates",
            content: "Using and managing invoice templates"
          }
        ]
      }
    ]
  },
  {
    id: "work-orders",
    title: "Work Orders",
    subsections: [
      {
        id: "work-orders-overview",
        title: "Overview",
        content: "Understanding work orders in Mobiwork",
      },
      {
        id: "managing-work-orders",
        title: "Managing Work Orders",
        content: "Learn how to manage work orders effectively",
      },
    ],
  },
  {
    id: "quotes",
    title: "Quotes",
    subsections: [
      {
        id: "quotes-overview",
        title: "Overview",
        content: "Introduction to quotes in Mobiwork",
      },
      {
        id: "creating-quotes",
        title: "Creating Quotes",
        content: "Learn how to create and manage quotes",
      },
    ],
  },
  {
    id: "scheduling",
    title: "Scheduling",
    subsections: [
      {
        id: "scheduling-overview",
        title: "Overview",
        content: "Understanding the scheduling system",
      },
      {
        id: "recurring-services",
        title: "Recurring Services",
        content: "Setting up and managing recurring services",
      },
    ],
  },
];
