import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

function withAutoDir(Tag) {
  return function AutoDirComponent(props) {
    const { style, ...rest } = props;
    return (
      <Tag
        dir="auto"
        style={{ textAlign: 'start', ...style }}
        {...rest}
      />
    );
  };
}

export default {
  ...MDXComponents,
  p: withAutoDir('p'),
  li: withAutoDir('li'),
  h1: withAutoDir(MDXComponents.h1),
  h2: withAutoDir(MDXComponents.h2),
  h3: withAutoDir(MDXComponents.h3),
  h4: withAutoDir(MDXComponents.h4),
  h5: withAutoDir(MDXComponents.h5),
  h6: withAutoDir(MDXComponents.h6),
  blockquote: withAutoDir('blockquote'),
  td: withAutoDir('td'),
  th: withAutoDir('th'),
};
