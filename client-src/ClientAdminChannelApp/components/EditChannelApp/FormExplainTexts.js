export const CHANNEL_CONTROLS = {
  IMAGE: 'image',
  TITLE: 'title',
  PUBLISHER: 'publisher',
  WEBSITE: 'website',
  CATEGORIES: 'categories',
  LANGUAGE: 'language',
  DESCRIPTION: 'description',
  ITUNES_EXPLICIT: 'itunes_explicit',
  COPYRIGHT: 'copyright',
  ITUNES_TITLE: 'itunes_title',
  ITUNES_TYPE: 'itunes_type',
  ITUNES_EMAIL: 'itunes_email',
  ITUNES_NEW_RSS_URL: 'itunes_new_rss_url',
  ITUNES_BLOCK: 'itunes_block',
  ITUNES_COMPLETE: 'itunes_complete'
};

export const CONTROLS_TEXTS_DICT = {
  [CHANNEL_CONTROLS.IMAGE]: {
    linkName: 'Channel Image',
    modalTitle: 'Channel Image',
    text: "The image that represents your channel. This will be displayed in feed readers and podcast apps.",
    rss: '<image><url>https://example.com/image.jpg</url></image>',
    json: '{ "image": "https://example.com/image.jpg" }'
  },
  [CHANNEL_CONTROLS.TITLE]: {
    linkName: 'Title',
    modalTitle: 'Channel Title',
    text: "The title of your channel. This will be displayed prominently in feed readers and podcast apps.",
    rss: '<title>Your Channel Title</title>',
    json: '{ "title": "Your Channel Title" }'
  },
  [CHANNEL_CONTROLS.PUBLISHER]: {
    linkName: 'Publisher',
    modalTitle: 'Publisher',
    text: "The name of the publisher or organization behind this channel.",
    rss: '<managingEditor>publisher@example.com (Publisher Name)</managingEditor>',
    json: '{ "publisher": "Publisher Name" }'
  },
  [CHANNEL_CONTROLS.WEBSITE]: {
    linkName: 'Website',
    modalTitle: 'Website URL',
    text: "The URL of your channel's website. This should be a valid URL that users can visit.",
    rss: '<link>https://example.com</link>',
    json: '{ "link": "https://example.com" }'
  },
  [CHANNEL_CONTROLS.CATEGORIES]: {
    linkName: 'Categories',
    modalTitle: 'Categories',
    text: "Select up to 3 categories that best describe your channel's content. These help users discover your content.",
    rss: '<itunes:category text="Technology"/>',
    json: '{ "categories": ["Technology", "News", "Education"] }'
  },
  [CHANNEL_CONTROLS.LANGUAGE]: {
    linkName: 'Language',
    modalTitle: 'Language',
    text: "The primary language of your channel's content.",
    rss: '<language>en-us</language>',
    json: '{ "language": "en-us" }'
  },
  [CHANNEL_CONTROLS.DESCRIPTION]: {
    linkName: 'Description',
    modalTitle: 'Description',
    text: "A detailed description of your channel. This helps potential subscribers understand what your channel is about.",
    rss: '<description>Your channel description here</description>',
    json: '{ "description": "Your channel description here" }'
  },
  [CHANNEL_CONTROLS.ITUNES_EXPLICIT]: {
    linkName: 'Explicit Content',
    modalTitle: 'Explicit Content',
    text: "Indicate whether your channel contains explicit content. This helps listeners make informed decisions.",
    rss: '<itunes:explicit>yes</itunes:explicit>',
    json: '{ "itunes:explicit": true }'
  },
  [CHANNEL_CONTROLS.COPYRIGHT]: {
    linkName: 'Copyright',
    modalTitle: 'Copyright',
    text: "The copyright notice for your channel's content.",
    rss: '<copyright>©2025 Your Name</copyright>',
    json: '{ "copyright": "©2025 Your Name" }'
  },
  [CHANNEL_CONTROLS.ITUNES_TITLE]: {
    linkName: 'iTunes Title',
    modalTitle: 'iTunes Title',
    text: "An alternative title specifically for iTunes/Apple Podcasts. If not set, the regular title will be used.",
    rss: '<itunes:title>Your iTunes Title</itunes:title>',
    json: '{ "itunes:title": "Your iTunes Title" }'
  },
  [CHANNEL_CONTROLS.ITUNES_TYPE]: {
    linkName: 'iTunes Type',
    modalTitle: 'iTunes Type',
    text: "Choose 'episodic' for standalone episodes or 'serial' for episodes meant to be consumed in order.",
    rss: '<itunes:type>episodic</itunes:type>',
    json: '{ "itunes:type": "episodic" }'
  },
  [CHANNEL_CONTROLS.ITUNES_EMAIL]: {
    linkName: 'iTunes Email',
    modalTitle: 'iTunes Email',
    text: "The contact email for iTunes/Apple Podcasts-related communications.",
    rss: '<itunes:email>podcast@example.com</itunes:email>',
    json: '{ "itunes:email": "podcast@example.com" }'
  },
  [CHANNEL_CONTROLS.ITUNES_NEW_RSS_URL]: {
    linkName: 'New RSS URL',
    modalTitle: 'New RSS URL',
    text: "If you're moving your podcast to a new feed URL, specify it here to help podcast apps update.",
    rss: '<itunes:new-feed-url>https://newsite.com/feed.xml</itunes:new-feed-url>',
    json: '{ "itunes:new-feed-url": "https://newsite.com/feed.xml" }'
  },
  [CHANNEL_CONTROLS.ITUNES_BLOCK]: {
    linkName: 'Block from iTunes',
    modalTitle: 'Block from iTunes',
    text: "If enabled, prevents the channel from appearing in iTunes/Apple Podcasts search results.",
    rss: '<itunes:block>yes</itunes:block>',
    json: '{ "itunes:block": true }'
  },
  [CHANNEL_CONTROLS.ITUNES_COMPLETE]: {
    linkName: 'Mark as Complete',
    modalTitle: 'Mark as Complete',
    text: "If enabled, indicates that no new episodes will be added to this channel.",
    rss: '<itunes:complete>yes</itunes:complete>',
    json: '{ "itunes:complete": true }'
  }
};