import React, { useState } from "react";
import { ArrowRightCircleIcon, ArrowUpCircleIcon } from '@heroicons/react/24/outline'
import clsx from "clsx";
import AdminDialog from "../AdminDialog";
import ExternalLink from "../ExternalLink";
import { PUBLIC_URLS } from "../../../common-src/StringUtils";
import type { ExplainTextProps } from "../types";

interface ExplainDialogProps {
  title: string;
  description: string;
  learnMoreUrl?: string;
  customClass?: string;
}

export default function ExplainText({ 
  title,
  description,
  learnMoreUrl,
  customClass 
}: ExplainDialogProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = isOpen ? ArrowUpCircleIcon : ArrowRightCircleIcon;
  
  return (
    <div className="flex">
      <a
        href="#"
        className={clsx(customClass || 'lh-page-subtitle')}
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          setIsOpen(true);
        }}
      >
        <div className="flex items-center">
          <div>{title}</div>
          <div className="ml-2"><Icon className="w-4" /></div>
        </div>
      </a>
      <AdminDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={title}
      >
        <div className="py-2">
          <div className="text-helper-color grid grid-cols-1 gap-4 text-sm">
            <div className="leading-relaxed">{description}</div>
            {learnMoreUrl && (
              <div className="text-xs mt-2 text-muted-color">
                Learn more at <a 
                  className="text-helper-color" 
                  href={learnMoreUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {new URL(learnMoreUrl).hostname}
                </a>
              </div>
            )}
          </div>
        </div>
      </AdminDialog>
    </div>
  );
}