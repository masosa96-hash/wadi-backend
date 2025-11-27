import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export async function deleteUserAccount(req: Request, res: Response) {
    try {
        const userId = req.user_id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Delete all user data in order (respecting foreign key constraints)
        // 1. Delete shares
        await supabase
            .from('share_links')
            .delete()
            .eq('user_id', userId);

        // 2. Delete conversations/messages
        await supabase
            .from('conversations')
            .delete()
            .eq('user_id', userId);

        // 3. Delete projects
        await supabase
            .from('projects')
            .delete()
            .eq('user_id', userId);

        // 4. Delete workspace memberships
        await supabase
            .from('workspace_members')
            .delete()
            .eq('user_id', userId);

        // 5. Delete owned workspaces
        await supabase
            .from('workspaces')
            .delete()
            .eq('owner_id', userId);

        // 6. Delete user usage data
        await supabase
            .from('user_usage')
            .delete()
            .eq('user_id', userId);

        // 7. Delete profile
        await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        // 8. Finally, delete the auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('Error deleting auth user:', authError);
            return res.status(500).json({ error: 'Failed to delete account' });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error in deleteUserAccount:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
