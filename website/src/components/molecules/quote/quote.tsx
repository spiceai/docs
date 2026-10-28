import React, { ReactNode } from 'react';

type QuoteProps = {
  children: ReactNode;
  name: string;
  title: string;
  company: string;
  imageUrl: string;
};

export default function Quote({children, name, title, company, imageUrl}: QuoteProps) {
  return (
    <blockquote className='mb-1'>
      <p className="italic font-semibold" dir="ltr">{children}</p>
      <div className='avatar'>
        <div className="avatar__photo">
          <img src={imageUrl} alt={`${name}'s profile`} className="w-6 h-6 rounded" />
        </div>
        <div className="avatar__intro">
          <div className='avatar__name'>{name}</div>
          <small>{title} at {company}</small>
        </div>
      </div>
    </blockquote>
  );
}