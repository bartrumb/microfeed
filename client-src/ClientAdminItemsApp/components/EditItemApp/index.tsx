import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import AdminNavApp from '../../../components/AdminNavApp';
import AdminInput from "../../../components/AdminInput";
import Requests from "../../../common/requests";
import {randomShortUUID, ADMIN_URLS, PUBLIC_URLS} from '../../../../common-src/StringUtils';
import AdminImageUploaderApp from "../../../components/AdminImageUploaderApp";
import AdminDatetimePicker from '../../../components/AdminDatetimePicker';
import {datetimeLocalStringToMs, datetimeLocalToMs} from "../../../../common-src/TimeUtils";
import {getPublicBaseUrl} from "../../../common/ClientUrlUtils";
import AdminRadio from "../../../components/AdminRadio";
import {showToast} from "../../../common/ToastUtils";
import {unescapeHtml} from "../../../../common-src/StringUtils";
import MediaManager from "./components/MediaManager";
import {
  NAV_ITEMS,
  NAV_ITEMS_DICT,
  STATUSES,
  ITEM_STATUSES_DICT,
} from "../../../../common-src/constants";
import {AdminSideQuickLinks, SideQuickLink} from "../../../components/AdminSideQuickLinks";
import AdminRichEditor from "../../../components/AdminRichEditor";
import ExplainText from "../../../components/ExplainText";
import {
  ITEM_CONTROLS,
  CONTROLS_TEXTS_DICT
} from "./FormExplainTexts";
import {preventCloseWhenChanged} from "../../../common/BrowserUtils";
import {getMediaFileFromUrl} from "../../../../common-src/MediaFileUtils";
import {
  EditItemAppProps,
  EditItemAppState,
  Item,
  MediaFile,
  DEFAULT_FEED,
  DEFAULT_ITEM,
  StateUpdate
,
  ItemUpdate
} from './types';

const SUBMIT_STATUS__START = 1;

function initItem(itemId: string): Item {
  return {
    ...DEFAULT_ITEM as Item,
    pubDateMs: datetimeLocalToMs(new Date()),
    guid: itemId,
  };
}

export default class EditItemApp extends React.Component<EditItemAppProps, EditItemAppState> {
  constructor(props: EditItemAppProps) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onUpdateFeed = this.onUpdateFeed.bind(this);
    this.onUpdateItemMeta = this.onUpdateItemMeta.bind(this);
    this.onUpdateItemToFeed = this.onUpdateItemToFeed.bind(this);

    const $feedContent = document.getElementById('feed-content');
    const $dataParams = document.getElementById('lh-data-params');
    const onboardingResult = JSON.parse(unescapeHtml(document.getElementById('onboarding-result')?.innerHTML || '{}'));

    const itemId = $dataParams ? $dataParams.getAttribute('data-item-id') : null;
    const action = itemId ? 'edit' : 'create';
    const feed = JSON.parse(unescapeHtml($feedContent?.innerHTML || '{}'));
    
    // Ensure feed has required structure
    const initialFeed = {
      ...DEFAULT_FEED,
      ...feed,
      items: feed.items || {},
    };

    const item = feed.item || initItem(itemId || '');

    this.state = {
      feed: initialFeed,
      onboardingResult,
      item,
      submitStatus: null,
      itemId: itemId || randomShortUUID(),
      action,
      userChangedLink: false,
      changed: false,
    };
  }

  componentDidMount(): void {
    preventCloseWhenChanged(() => this.state.changed);

    const {action, item} = this.state;
    if (action === 'create') {
      const {mediaFile} = item;
      const urlParams = new URLSearchParams(window.location.search);
      const title = urlParams.get('title') || '';

      const mediaFileFromUrl = getMediaFileFromUrl(urlParams);

      if (mediaFileFromUrl && Object.keys(mediaFileFromUrl).length > 0) {
        const attrDict = {
          title,
          mediaFile: {
            ...mediaFile,
            ...mediaFileFromUrl,
          },
        };
        this.onUpdateItemMeta(attrDict);
      }
    }
  }

  onUpdateFeed(props: Partial<EditItemAppState['feed']>, onSuccess: () => void): void {
    this.setState(prevState => ({
      feed: {
        ...prevState.feed,
        ...props,
      },
    }), onSuccess);
  }

  onUpdateItemMeta(attrDict: ItemUpdate, extraDict?: StateUpdate): void {
    this.setState(prevState => ({
      ...prevState,
      ...extraDict,
      changed: true,
      item: {...prevState.item, ...attrDict}
    }));
  }

  onUpdateItemToFeed(onSuccess: () => void): void {
    const {item, itemId, feed} = this.state;
    const itemsBundle = {
      ...feed.items,
      [itemId]: {...item},
    };
    this.onUpdateFeed({items: itemsBundle}, onSuccess);
  }

  onDelete(): void {
    const {item} = this.state;
    this.setState({submitStatus: SUBMIT_STATUS__START});
    Requests.axiosPost(ADMIN_URLS.ajaxFeed(), {item: {...item, status: STATUSES.DELETED}})
      .then(() => {
        showToast('Deleted!', 'success');
        this.setState({submitStatus: null, changed: false}, () => {
          setTimeout(() => {
            location.href = ADMIN_URLS.allItems();
          }, 1000);
        });
      })
      .catch((error) => {
        this.setState({submitStatus: null}, () => {
          if (!error.response) {
            showToast('Network error. Please refresh the page and try again.', 'error');
          } else {
            showToast('Failed. Please try again.', 'error');
          }
        });
      });
  }

  onSubmit(e: React.FormEvent): void {
    e.preventDefault();
    const {item, itemId, action} = this.state;
    this.setState({submitStatus: SUBMIT_STATUS__START});
    Requests.axiosPost(ADMIN_URLS.ajaxFeed(), {item: {id: itemId, ...item}})
      .then(() => {
        this.setState({submitStatus: null, changed: false}, () => {
          if (action === 'edit') {
            showToast('Updated!', 'success');
          } else {
            showToast('Created!', 'success');
            if (itemId) {
              setTimeout(() => {
                location.href = ADMIN_URLS.editItem(itemId);
              }, 1000);
            }
          }
        });
      }).catch((error) => {
        this.setState({submitStatus: null}, () => {
          if (!error.response) {
            showToast('Network error. Please refresh the page and try again.', 'error');
          } else {
            showToast('Failed. Please try again.', 'error');
          }
        });
      });
  }

  render(): JSX.Element {
    const {submitStatus, itemId, item, action, feed, onboardingResult, changed} = this.state;
    const submitting = submitStatus === SUBMIT_STATUS__START;
    const {mediaFile} = item;
    const status = item.status || STATUSES.PUBLISHED;

    const webGlobalSettings = feed.settings.webGlobalSettings || {};
    const publicBucketUrl = webGlobalSettings.publicBucketUrl || '';

    let buttonText = 'Create';
    let submittingButtonText = 'Creating...';
    let currentPage = NAV_ITEMS.NEW_ITEM;
    let upperLevel;
    if (action === 'edit') {
      buttonText = 'Update';
      submittingButtonText = 'Updating...';
      currentPage = NAV_ITEMS.ALL_ITEMS;
      upperLevel = {
        name: NAV_ITEMS_DICT[NAV_ITEMS.ALL_ITEMS].name,
        url: ADMIN_URLS.allItems(),
        childName: `Item (id = ${itemId})`,
      };
    }

    return (
      <AdminNavApp
        currentPage={currentPage}
        upperLevel={upperLevel}
        onboardingResult={onboardingResult}
      >
        <form className="grid grid-cols-12 gap-4">
          <div className="col-span-9 grid grid-cols-1 gap-4">
            <div className="lh-page-card">
              <MediaManager
                labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.MEDIA_FILE]}/>}
                feed={feed}
                initMediaFile={mediaFile || {}}
                onMediaFileUpdated={(newMediaFile: MediaFile) => {
                  this.onUpdateItemMeta({
                    mediaFile: {
                      ...mediaFile,
                      ...newMediaFile,
                    },
                  });
                }}
              />
            </div>
            <div className="lh-page-card">
              <div className="flex">
                <div>
                  <ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.IMAGE]}/>
                  <AdminImageUploaderApp
                    mediaType="item"
                    feed={feed}
                    currentImageUrl={item.image}
                    onImageUploaded={(cdnUrl: string) => this.onUpdateItemMeta({'image': cdnUrl})}
                  />
                </div>
                <div className="ml-8 flex-1">
                  <AdminInput
                    labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.TITLE]}/>}
                    value={item.title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const attrDict: ItemUpdate = {
                        title: e.target.value,
                        link: action !== 'edit' && !this.state.userChangedLink ? 
                          PUBLIC_URLS.webItem(itemId, e.target.value, getPublicBaseUrl()) : undefined
                      }
;
                      this.onUpdateItemMeta(attrDict);
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {React.createElement(AdminDatetimePicker as any, {
                      label: null,
                      labelComponent: <ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.PUB_DATE]}/>,
                      value: item.pubDateMs,
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        this.onUpdateItemMeta({'pubDateMs': datetimeLocalStringToMs(e.target.value)})
                      }
                    })}

                    <AdminInput
                      labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.LINK]}/>}
                      value={item.link || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        this.onUpdateItemMeta({'link': e.target.value}, {userChangedLink: true})}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <AdminRadio
                      labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.STATUS]}/>}
                      groupName="item-status"
                      buttons={[
                        {
                          name: ITEM_STATUSES_DICT[STATUSES.PUBLISHED].name,
                          value: STATUSES.PUBLISHED.toString(),
                          checked: status === STATUSES.PUBLISHED,
                        },
                        {
                          name: ITEM_STATUSES_DICT[STATUSES.UNLISTED].name,
                          value: STATUSES.UNLISTED.toString(),
                          checked: status === STATUSES.UNLISTED,
                        },
                        {
                          name: ITEM_STATUSES_DICT[STATUSES.UNPUBLISHED].name,
                          value: STATUSES.UNPUBLISHED.toString(),
                          checked: status === STATUSES.UNPUBLISHED,
                        }]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        this.onUpdateItemMeta({'status': parseInt(e.target.value, 10)});
                      }}
                    />
                    <div 
                      className="text-muted-color text-xs" 
                      dangerouslySetInnerHTML={{__html: ITEM_STATUSES_DICT[status].description}} 
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t">
                <AdminRichEditor
                  labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.DESCRIPTION]}/>}
                  value={item.description || ''}
                  onChange={(value: string) => this.onUpdateItemMeta({'description': value})}
                  extra={{
                    publicBucketUrl,
                    folderName: `items/${itemId}`,
                  }}
                />
              </div>
            </div>
            <div className="lh-page-card">
              <details>
                <summary className="m-page-summary">Podcast-specific fields</summary>
                <div className="grid grid-cols-1 gap-8">
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <AdminRadio
                      labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.ITUNES_EXPLICIT]}/>}
                      groupName="lh-explicit"
                      buttons={[{
                        'name': 'yes',
                        'value': 'yes',
                        'checked': !!item['itunes:explicit'],
                      }, {
                        'name': 'no',
                        'value': 'no',
                        'checked': !item['itunes:explicit']
                      }]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        this.onUpdateItemMeta({'itunes:explicit': e.target.value === 'yes'})}
                    />
                    <AdminInput
                      labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.GUID]}/>}
                      value={item.guid || itemId}
                      setRef={(ref: HTMLInputElement | null) => {
                        if (!item.guid && ref) {
                          this.onUpdateItemMeta({'guid': ref.value}, {changed: false});
                        }
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        this.onUpdateItemMeta({'guid': e.target.value})}
                    />
                    <AdminInput
                      labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.ITUNES_TITLE]}/>}
                      value={item['itunes:title'] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        this.onUpdateItemMeta({'itunes:title': e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <AdminRadio
                      labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.ITUNES_EPISODE_TYPE]}/>}
                      groupName="feed-itunes-episodetype"
                      buttons={[{
                        'name': 'full',
                        'value': 'full',
                        'checked': item['itunes:episodeType'] === 'full',
                      }, {
                        'name': 'trailer',
                        'value': 'trailer',
                        'checked': item['itunes:episodeType'] === 'trailer',
                      }, {
                        'name': 'bonus',
                        'value': 'bonus',
                        'checked': item['itunes:episodeType'] === 'bonus',
                      }]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        this.onUpdateItemMeta({'itunes:episodeType': e.target.value as 'full' | 'trailer' | 'bonus'})}
                    />
                    <AdminInput
                      type="number"
                      labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.ITUNES_SEASON]}/>}
                      value={item['itunes:season']?.toString() || ''}
                      extraParams={{min: "1"}}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        this.onUpdateItemMeta({'itunes:season': parseInt(e.target.value, 10)})}
                    />
                    <AdminInput
                      type="number"
                      labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.ITUNES_EPISODE]}/>}
                      value={item['itunes:episode']?.toString() || ''}
                      extraParams={{min: "1"}}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        this.onUpdateItemMeta({'itunes:episode': parseInt(e.target.value, 10)})}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <AdminRadio
                      labelComponent={<ExplainText bundle={CONTROLS_TEXTS_DICT[ITEM_CONTROLS.ITUNES_BLOCK]}/>}
                      groupName="feed-itunes-block"
                      buttons={[{
                        'name': 'Yes',
                        'value': 'Yes',
                        'checked': !!item['itunes:block'],
                      }, {
                        'name': 'No',
                        'value': 'No',
                        'checked': !item['itunes:block'],
                      }]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        this.onUpdateItemMeta({'itunes:block': e.target.value === 'Yes'})}
                    />
                  </div>
                </div>
              </details>
            </div>
          </div>
          <div className="col-span-3">
            <div className="sticky top-8">
              <div className="lh-page-card text-center">
                <button
                  type="submit"
                  className="lh-btn lh-btn-brand-dark lh-btn-lg"
                  onClick={this.onSubmit}
                  disabled={submitting || !changed}
                >
                  {submitting ? submittingButtonText : buttonText}
                </button>
              </div>
              {action === 'edit' && (
                <div>
                  <AdminSideQuickLinks
                    AdditionalLinksDiv={
                      <div className="flex flex-wrap">
                        <SideQuickLink url={PUBLIC_URLS.webItem(itemId, item.title)} text="web item"/>
                        <SideQuickLink url={PUBLIC_URLS.jsonItem(itemId)} text="json item"/>
                      </div>
                    }
                  />
                  <div className="lh-page-card mt-4 flex justify-center">
                    <a
                      href="#"
                      className="text-red-500 text-sm"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        const ok = confirm('Are you going to permanently delete this item?');
                        if (ok) {
                          this.onDelete();
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <TrashIcon className="w-4" />
                        <div className="ml-1">Delete this item</div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </AdminNavApp>
    );
  }
}