import React from "react";
import Layout from "@/components/Layout";
import { documentationSections } from "@/data/docs";

const Index = () => {
  return (
    <Layout>
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold mb-2">Welcome to Mobiwork Docs</h1>
        <p className="text-lg text-gray-600 mb-8">
          Learn how to use Mobiwork to manage your field services efficiently.
        </p>

        <div className="space-y-12">
          {documentationSections.map((section) => (
            <div key={section.id} id={section.id}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {section.title}
              </h2>
              <div className="space-y-8">
                {section.subsections.map((subsection) => (
                  <div key={subsection.id} id={subsection.id}>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      {subsection.title}
                    </h3>
                    <p className="text-gray-600">{subsection.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Index;