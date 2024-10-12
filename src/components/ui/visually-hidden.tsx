import React from 'react';

export const VisuallyHidden: React.FC<
  React.HTMLAttributes<HTMLSpanElement>
> = ({ children, ...props }) => {
  return (
    <span
      {...props}
      style={{
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        width: '1px',
        whiteSpace: 'nowrap',
        wordWrap: 'normal',
      }}
    >
      {children}
    </span>
  );
};
