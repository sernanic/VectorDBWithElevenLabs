import React from 'react';
import * as Markdoc from '@markdoc/markdoc';

export const renderMarkdown = (content: string) => {
  const ast = Markdoc.parse(content);
  const transformed = Markdoc.transform(ast);
  return Markdoc.renderers.react(transformed, React);
};
