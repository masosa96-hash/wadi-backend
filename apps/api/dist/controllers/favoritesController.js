"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = getFavorites;
exports.addFavorite = addFavorite;
exports.removeFavorite = removeFavorite;
exports.checkFavorite = checkFavorite;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../config/logger");
/**
 * Get all favorites for the current user
 */
async function getFavorites(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { data, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        res.json(data || []);
    }
    catch (error) {
        logger_1.logger.error('Error fetching favorites:', error);
        res.status(500).json({ error: error.message });
    }
}
/**
 * Add a message to favorites
 */
async function addFavorite(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { message_id, conversation_id } = req.body;
        if (!message_id) {
            return res.status(400).json({ error: 'message_id is required' });
        }
        // Check if already favorited
        const { data: existing } = await supabase_1.supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('message_id', message_id)
            .single();
        if (existing) {
            return res.status(400).json({ error: 'Message already favorited' });
        }
        // Add to favorites
        const { data, error } = await supabase_1.supabase
            .from('favorites')
            .insert({
            user_id: userId,
            message_id,
            conversation_id,
        })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        logger_1.logger.error('Error adding favorite:', error);
        res.status(500).json({ error: error.message });
    }
}
/**
 * Remove a message from favorites
 */
async function removeFavorite(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { message_id } = req.params;
        if (!message_id) {
            return res.status(400).json({ error: 'message_id is required' });
        }
        const { error } = await supabase_1.supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('message_id', message_id);
        if (error)
            throw error;
        res.status(204).send();
    }
    catch (error) {
        logger_1.logger.error('Error removing favorite:', error);
        res.status(500).json({ error: error.message });
    }
}
/**
 * Check if a message is favorited
 */
async function checkFavorite(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { message_id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('message_id', message_id)
            .single();
        if (error && error.code !== 'PGRST116')
            throw error;
        res.json({ favorited: !!data });
    }
    catch (error) {
        logger_1.logger.error('Error checking favorite:', error);
        res.status(500).json({ error: error.message });
    }
}
