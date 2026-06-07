import React from 'react';
import katex from 'katex';

interface LatexProps {
  math: string;
  block?: boolean;
}

export function Latex({ math, block = false }: LatexProps) {
  try {
    const html = katex.renderToString(math, {
      displayMode: block,
      throwOnError: false,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (err) {
    return <span className="font-mono text-xs text-red-400">{math}</span>;
  }
}
