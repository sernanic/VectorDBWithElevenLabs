import i18next from 'i18next';
import '@/i18n/config';

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

const getTranslatedKey = (key: string) => {
  return i18next.t(key);
};

const createTranslatedDocs = (): DocSection[] => {
  return [
    {
      id: "invoices",
      title: getTranslatedKey('sections.invoices.title'),
      subsections: [
        {
          id: "invoices-overview",
          title: getTranslatedKey('sections.invoices.subsections.invoices-overview.title'),
          content: getTranslatedKey('sections.invoices.subsections.invoices-overview.content'),
          subsubsections: [
            {
              id: "what-are-invoices",
              title: getTranslatedKey('sections.invoices.subsections.invoices-overview.subsubsections.what-are-invoices.title'),
              content: getTranslatedKey('sections.invoices.subsections.invoices-overview.subsubsections.what-are-invoices.content'),
            },
            {
              id: "invoice-lifecycle",
              title: getTranslatedKey('sections.invoices.subsections.invoices-overview.subsubsections.invoice-lifecycle.title'),
              content: getTranslatedKey('sections.invoices.subsections.invoices-overview.subsubsections.invoice-lifecycle.content'),
            }
          ]
        },
        {
          id: "creating-invoices",
          title: getTranslatedKey('sections.invoices.subsections.creating-invoices.title'),
          content: getTranslatedKey('sections.invoices.subsections.creating-invoices.content'),
          subsubsections: [
            {
              id: "invoice-creation-process",
              title: getTranslatedKey('sections.invoices.subsections.creating-invoices.subsubsections.invoice-creation-process.title'),
              content: getTranslatedKey('sections.invoices.subsections.creating-invoices.subsubsections.invoice-creation-process.content'),
            }
          ]
        }
      ]
    },
    {
      id: "work-orders",
      title: getTranslatedKey('sections.work-orders.title'),
      subsections: [
        {
          id: "work-orders-overview",
          title: getTranslatedKey('sections.work-orders.subsections.work-orders-overview.title'),
          content: getTranslatedKey('sections.work-orders.subsections.work-orders-overview.content'),
        },
        {
          id: "managing-work-orders",
          title: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.title'),
          content: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.content'),
          subsubsections: [
            {
              id: "creating-work-orders",
              title: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.subsubsections.creating-work-orders.title'),
              content: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.subsubsections.creating-work-orders.content'),
            },
            {
              id: "assigning-technicians",
              title: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.subsubsections.assigning-technicians.title'),
              content: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.subsubsections.assigning-technicians.content'),
            },
            {
              id: "tracking-progress",
              title: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.subsubsections.tracking-progress.title'),
              content: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.subsubsections.tracking-progress.content'),
            },
            {
              id: "managing-priorities",
              title: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.subsubsections.managing-priorities.title'),
              content: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.subsubsections.managing-priorities.content'),
            },
            {
              id: "generating-reports",
              title: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.subsubsections.generating-reports.title'),
              content: getTranslatedKey('sections.work-orders.subsections.managing-work-orders.subsubsections.generating-reports.content'),
            }
          ]
        }
      ]
    },
    {
      id: "quotes",
      title: getTranslatedKey('sections.quotes.title'),
      subsections: [
        {
          id: "quotes-overview",
          title: getTranslatedKey('sections.quotes.subsections.quotes-overview.title'),
          content: getTranslatedKey('sections.quotes.subsections.quotes-overview.content'),
        },
        {
          id: "creating-quotes",
          title: getTranslatedKey('sections.quotes.subsections.creating-quotes.title'),
          content: getTranslatedKey('sections.quotes.subsections.creating-quotes.content'),
        }
      ]
    },
    {
      id: "scheduling",
      title: getTranslatedKey('sections.scheduling.title'),
      subsections: [
        {
          id: "scheduling-overview",
          title: getTranslatedKey('sections.scheduling.subsections.scheduling-overview.title'),
          content: getTranslatedKey('sections.scheduling.subsections.scheduling-overview.content'),
        },
        {
          id: "recurring-services",
          title: getTranslatedKey('sections.scheduling.subsections.recurring-services.title'),
          content: getTranslatedKey('sections.scheduling.subsections.recurring-services.content'),
        }
      ]
    }
  ];
};

// Export a function to get the current documentation
export const getDocumentationSections = (): DocSection[] => {
  return createTranslatedDocs();
};

// Export the initial documentation
export const documentationSections = createTranslatedDocs();
