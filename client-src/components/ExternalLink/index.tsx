import React from "react";
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import clsx from "clsx";

interface ExternalLinkProps {
  url: string;
  text: string;
  linkClass?: string;
  iconClass?: string;
}

export default function ExternalLink({url, text, linkClass, iconClass}: ExternalLinkProps): JSX.Element {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title={text} className={linkClass || ''}>
      <div className="flex">
        <div className="inline break-all">
          {text}
        </div>
        <div className="ml-1 inline items-center flex">
          <ArrowTopRightOnSquareIcon className={clsx(iconClass || 'w-4', 'inline')}/>
        </div>
      </div>
    </a>
  );
}