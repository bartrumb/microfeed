import React from 'react';
import {OUR_BRAND} from "../../../../../../common-src/Constants";
import {
  WhatsNewAppProps,
  WhatsNewAppState,
  WhatsNewResponse
} from './types';

const FETCH_STATUS__START = 1;

export default class WhatsNewApp extends React.Component<WhatsNewAppProps, WhatsNewAppState> {
  constructor(props: WhatsNewAppProps) {
    super(props);

    this.state = {
      items: [],
      fetchStatus: FETCH_STATUS__START,
    };
  }

  componentDidMount(): void {
    const endpoint = OUR_BRAND.whatsnewEndpoint;

    this.setState({fetchStatus: FETCH_STATUS__START});
    fetch(endpoint)
      .then((response) => response.json())
      .then((data: WhatsNewResponse) => {
        this.setState({
          items: data.items.slice(0, 5),
          fetchStatus: null,
        });
      })
      .catch(() => {
        this.setState({fetchStatus: null});
      });
  }

  render(): JSX.Element {
    const {items, fetchStatus} = this.state;
    const fetching = fetchStatus === FETCH_STATUS__START;

    return (
      <div className="lh-page-card">
        <div className="lh-page-title">
          What's new from <a href={`https://${OUR_BRAND.domain}`}>{OUR_BRAND.domain}</a>?
        </div>
        <div>
          {fetching ? (
            <div className="text-muted-color text-sm">
              Loading...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) => (
                <div key={`item-${item.id}`}>
                  <div>
                    <a href={item._microfeed.web_url} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </div>
                  <div className="text-xs text-muted-color mt-1">
                    {item._microfeed.date_published_short}
                  </div>
                </div>
              ))}
              {items.length > 0 ? (
                <div className="text-right">
                  <a href={OUR_BRAND.whatsnewWebsite} target="_blank" rel="noopener noreferrer">
                    Read more <span className="lh-icon-arrow-right" />
                  </a>
                </div>
              ) : (
                <div className="-text-xs text-muted-color mt-1">
                  No news.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}