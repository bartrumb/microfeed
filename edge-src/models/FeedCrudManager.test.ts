import { FeedCrudManager } from "./FeedCrudManager";
import { Env } from '../../common-src/types/CloudflareTypes';
import { D1Database } from '@cloudflare/workers-types';

describe('FeedCrudManager', () => {
  let manager: FeedCrudManager;
  const mockEnv = {
    FEED_DB: {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({}),
      first: jest.fn().mockResolvedValue(null)
    } as unknown as D1Database
  } as Env;

  beforeEach(() => {
    manager = new FeedCrudManager({ env: mockEnv });
  });

  describe('setItemAsDraft', () => {
    it('should create a new draft item if it does not exist', async () => {
      const itemId = 'test-id';
      await manager.init();
      await manager.setItemAsDraft(itemId);

      const content = manager.getFeedContent();
      const draftItem = content.items?.find(item => item.id === itemId);

      expect(draftItem).toBeDefined();
      expect(draftItem?.status).toBe(0);
      expect(draftItem?.title).toBe('');
      expect(draftItem?.content).toBe('');
      expect(draftItem?.created_at).toBeDefined();
      expect(draftItem?.updated_at).toBeDefined();
    });

    it('should convert existing item to draft', async () => {
      const itemId = 'test-id';
      const existingItem = {
        id: itemId,
        status: 1,
        title: 'Test Title',
        content: 'Test Content',
        description: 'Test Description',
        created_at: '2024-01-01T00:00:00Z'
      };

      await manager.init();
      await manager.createItem(existingItem);
      await manager.setItemAsDraft(itemId);

      const content = manager.getFeedContent();
      const draftItem = content.items?.find(item => item.id === itemId);

      expect(draftItem).toBeDefined();
      expect(draftItem?.status).toBe(0);
      expect(draftItem?.title).toBe('');
      expect(draftItem?.content).toBe('');
      expect(draftItem?.created_at).toBe(existingItem.created_at);
      expect(draftItem?.updated_at).toBeDefined();
    });
  });

  describe('item status management', () => {
    const itemId = 'test-id';
    const initialItem = {
      id: itemId,
      status: 0,
      title: 'Test Title',
      content: 'Test Content'
    };

    beforeEach(async () => {
      await manager.init();
      await manager.createItem(initialItem);
    });

    it('should set item as published', async () => {
      await manager.setItemAsPublished(itemId);
      const item = manager.getFeedContent().items?.find(i => i.id === itemId);
      
      expect(item?.status).toBe(1);
      expect(item?.pub_date).toBeDefined();
      expect(item?.pubDateMs).toBeDefined();
    });

    it('should set item as unpublished', async () => {
      await manager.setItemAsUnpublished(itemId);
      const item = manager.getFeedContent().items?.find(i => i.id === itemId);
      
      expect(item?.status).toBe(0);
      expect(item?.pub_date).toBeUndefined();
      expect(item?.pubDateMs).toBeUndefined();
    });

    it('should set item as unlisted', async () => {
      await manager.setItemAsUnlisted(itemId);
      const item = manager.getFeedContent().items?.find(i => i.id === itemId);
      
      expect(item?.status).toBe(2);
    });
  });
});