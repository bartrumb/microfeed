import React from 'react';
import AdminNavApp from '../../../components/AdminNavApp';
import ErrorBoundary from '../../../components/ErrorBoundary';
import {
  unescapeHtml,
  ADMIN_URLS,
  secondsToHHMMSS,
  PUBLIC_URLS,
} from "../../../../common-src/StringUtils";
import {
  ENCLOSURE_CATEGORIES,
  ENCLOSURE_CATEGORIES_DICT,
  STATUSES,
  ITEM_STATUSES_DICT,
  NAV_ITEMS,
  NAV_ITEMS_DICT,
  ITEMS_SORT_ORDERS
} from "../../../../common-src/Constants";
import {msToDatetimeLocalString} from '../../../../common-src/TimeUtils';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from "clsx";
import ExternalLink from "../../../components/ExternalLink";
import AdminRadio from "../../../components/AdminRadio";
import {
  AllItemsAppProps,
  AllItemsAppState,
  ItemListTableProps,
  TableItem,
  Feed,
  Item,
  DEFAULT_FEED,
  DEFAULT_ONBOARDING_RESULT,
  isValidMediaFileType,
  formatDuration,
  getMediaFileUrl
} from './types';

const columnHelper = createColumnHelper<TableItem>();
const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => (
      <div className={clsx('text-center font-semibold', info.getValue() === STATUSES.PUBLISHED ? 'text-brand-light' : '')}>
        {ITEM_STATUSES_DICT[info.getValue()]?.name || 'Unknown'}
      </div>
    ),
  }),
  columnHelper.accessor('pubDateMs', {
    header: 'Published date',
    cell: info => {
      const value = info.getValue();
      return <div className="text-center">{value ? msToDatetimeLocalString(value) : ''}</div>;
    },
  }),
  columnHelper.accessor('mediaFile', {
    header: 'Media file',
    cell: info => info.getValue(),
  }),
];

function ItemListTable({data, feed}: ItemListTableProps): JSX.Element {
  let nextUrl: string | undefined;
  let prevUrl: string | undefined;

  if (feed.items_next_cursor) {
    nextUrl = `?next_cursor=${feed.items_next_cursor}&sort=${feed.items_sort_order}`;
  }
  if (feed.items_prev_cursor) {
    prevUrl = `?prev_cursor=${feed.items_prev_cursor}&sort=${feed.items_sort_order}`;
  }

  const newestFirst = feed.items_sort_order === ITEMS_SORT_ORDERS.NEWEST_FIRST;
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="mb-4">
        <AdminRadio
          groupName="sort-order"
          buttons={[
            {
              name: 'Newest first',
              value: ITEMS_SORT_ORDERS.NEWEST_FIRST,
              checked: newestFirst,
            },
            {
              name: 'Oldest first',
              value: ITEMS_SORT_ORDERS.OLDEST_FIRST,
              checked: !newestFirst,
            },
          ]}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            location.href = `?sort=${e.target.value}`;
          }}
        />
      </div>
      <table className="border-collapse text-helper-color text-sm w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className={clsx('uppercase border border-slate-300 bg-brand-dark text-white py-2 px-4')}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={`item-${row.id}`}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className={clsx("border border-slate-300 py-2 px-4 break-all",
                  cell.column.id === 'title' ? 'max-w-md' : '')}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-8 flex justify-center">
        {prevUrl && (
          <div className="mx-2">
            <a href={prevUrl}><span className="lh-icon-arrow-left" /> Prev</a>
          </div>
        )}
        {nextUrl && (
          <div className="mx-2">
            <a href={nextUrl}>Next <span className="lh-icon-arrow-right" /></a>
          </div>
        )}
      </div>
    </div>
  );
}

export default class AllItemsApp extends React.Component<AllItemsAppProps, AllItemsAppState> {
  constructor(props: AllItemsAppProps) {
    super(props);

    let feed: Feed = DEFAULT_FEED;
    let onboardingResult = DEFAULT_ONBOARDING_RESULT;

    try {
      const feedContent = document.getElementById('feed-content')?.innerHTML;
      const onboardingContent = document.getElementById('onboarding-result')?.innerHTML;
      
      if (feedContent) {
        feed = JSON.parse(unescapeHtml(feedContent));
      }
      if (onboardingContent) {
        onboardingResult = JSON.parse(unescapeHtml(onboardingContent));
      }
    } catch (error) {
      console.error('Error parsing feed content or onboarding result:', error);
    }

    // Ensure required objects exist
    feed.settings = feed.settings || {};
    feed.settings.webGlobalSettings = feed.settings.webGlobalSettings || {};
    const items = feed.items || [];

    this.state = {
      feed,
      onboardingResult,
      items,
    };
  }

  render(): JSX.Element {
    const {items, feed, onboardingResult} = this.state;
    const settings = feed.settings || {};
    const webGlobalSettings = settings.webGlobalSettings || {};
    const publicBucketUrl = webGlobalSettings.publicBucketUrl || '/';

    const data: TableItem[] = items.map((item: Item) => ({
      status: item.status || STATUSES.PUBLISHED,
      pubDateMs: item.pubDateMs,
      title: (
        <div>
          <div className="line-clamp-2 text-lg">
            <a className="block" href={ADMIN_URLS.editItem(item.id)}>{item.title || 'untitled'}</a>
          </div>
          <div className="mt-2 flex items-center">
            <div className="text-muted-color text-sm flex-1">
              id: {item.id}
            </div>
            <ExternalLink linkClass="text-xs text-helper-color" url={PUBLIC_URLS.webItem(item.id, item.title)} text="Public page" />
            <div className="ml-4 flex-none">
              <a
                className="block text-xs text-helper-color"
                href={ADMIN_URLS.editItem(item.id)}
              >Edit this item <span className="lh-icon-arrow-right"/></a>
            </div>
          </div>
        </div>
      ),
      mediaFile: (
        <div className="flex flex-col items-center">
          {item.mediaFile && isValidMediaFileType(item.mediaFile) ? (
            <div>
              <ExternalLink
                url={getMediaFileUrl(item.mediaFile, publicBucketUrl)}
                text={ENCLOSURE_CATEGORIES_DICT[item.mediaFile.category]?.name || 'Unknown'}
              />
              {[ENCLOSURE_CATEGORIES.AUDIO, ENCLOSURE_CATEGORIES.VIDEO].includes(item.mediaFile.category) && (
                <div className="text-xs mt-1">
                  {secondsToHHMMSS(formatDuration(item.mediaFile.durationSecond))}
                </div>
              )}
            </div>
          ) : (
            <div>-</div>
          )}
        </div>
      ),
    }));

    return (
      <ErrorBoundary fallback="There was an error loading the items list. Please try refreshing the page.">
        <AdminNavApp
          currentPage={NAV_ITEMS.ALL_ITEMS}
          onboardingResult={onboardingResult}
        >
          <form className="lh-page-card grid grid-cols-1 gap-4">
            <div className="lh-page-title">
              {NAV_ITEMS_DICT[NAV_ITEMS.ALL_ITEMS].name}
            </div>
            <div>
              {data.length > 0 ? (
                <ItemListTable data={data} feed={feed} />
              ) : (
                <div>
                  <div className="mb-8">
                    No items yet.
                  </div>
                  <a href={ADMIN_URLS.newItem()}>Add a new item now <span className="lh-icon-arrow-right" /></a>
                </div>
              )}
            </div>
          </form>
        </AdminNavApp>
      </ErrorBoundary>
    );
  }
}