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
        content: "Learn how to effectively manage and organize work orders in Mobiwork to streamline your field service operations.",
        subsubsections: [
          {
            id: "creating-work-orders",
            title: "Creating Work Orders",
            content: "Step-by-step guide on how to create new work orders. Learn about required fields, optional information, and best practices for creating detailed work orders that provide clear instructions for your field technicians."
          },
          {
            id: "assigning-technicians",
            title: "Assigning Technicians",
            content: "Discover how to assign the right technicians to work orders based on skills, availability, and location. Learn about the automatic assignment features and how to manually override assignments when needed."
          },
          {
            id: "tracking-progress",
            title: "Tracking Progress",
            content: "Monitor work order progress in real-time. Learn about status updates, completion tracking, and how to use the dashboard to get a bird's eye view of all active work orders."
          },
          {
            id: "managing-priorities",
            title: "Managing Priorities",
            content: "Understand how to set and adjust work order priorities to ensure critical tasks are handled first. Learn about the priority levels and how they affect scheduling and resource allocation."
          },
          {
            id: "generating-reports",
            title: "Generating Reports",
            content: "Learn how to generate comprehensive reports about work order performance, completion rates, and technician productivity. Understand how to use these insights to improve your service operations."
          }
        ]
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
