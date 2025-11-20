import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

/**
 * Get all favorites for the current user
 */
export async function getFavorites(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        messages:message_id (
          id,
          content,
          role,
          created_at,
          conversations:conversation_id (
            id,
            title
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    logger.error('Error fetching favorites:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Add a message to favorites
 */
export async function addFavorite(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { message_id, conversation_id } = req.body;

    if (!message_id) {
      return res.status(400).json({ error: 'message_id is required' });
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('message_id', message_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Message already favorited' });
    }

    // Add to favorites
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        message_id,
        conversation_id,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: any) {
    logger.error('Error adding favorite:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Remove a message from favorites
 */
export async function removeFavorite(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { message_id } = req.params;

    if (!message_id) {
      return res.status(400).json({ error: 'message_id is required' });
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('message_id', message_id);

    if (error) throw error;

    res.status(204).send();
  } catch (error: any) {
    logger.error('Error removing favorite:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Check if a message is favorited
 */
export async function checkFavorite(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { message_id } = req.params;

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('message_id', message_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ favorited: !!data });
  } catch (error: any) {
    logger.error('Error checking favorite:', error);
    res.status(500).json({ error: error.message });
  }
}
