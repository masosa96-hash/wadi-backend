"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackMessageUsage = trackMessageUsage;
exports.trackFileUsage = trackFileUsage;
exports.trackWorkspaceCreation = trackWorkspaceCreation;
exports.trackVoiceUsage = trackVoiceUsage;
exports.estimateTokens = estimateTokens;
const supabase_1 = require("../config/supabase");
/**
 * Track a message being sent by user
 */
async function trackMessageUsage(userId, tokensUsed = 0, model = "gpt-3.5-turbo") {
    try {
        const metadata = {
            tokens: tokensUsed,
            model: model,
        };
        await supabase_1.supabase.rpc("track_usage_event", {
            p_user_id: userId,
            p_event_type: "message_sent",
            p_quantity: 1,
            p_unit: "messages",
            p_resource_id: null,
            p_metadata: metadata,
        });
        console.log(`[UsageTracking] Message tracked for user ${userId}: ${tokensUsed} tokens`);
    }
    catch (error) {
        console.error("[UsageTracking] Error tracking message usage:", error);
        // Don't throw - usage tracking should not break the request
    }
}
/**
 * Track a file being uploaded
 */
async function trackFileUsage(userId, fileId, fileSizeMB) {
    try {
        await supabase_1.supabase.rpc("track_usage_event", {
            p_user_id: userId,
            p_event_type: "file_uploaded",
            p_quantity: fileSizeMB,
            p_unit: "mb",
            p_resource_id: fileId,
            p_metadata: {},
        });
        console.log(`[UsageTracking] File upload tracked for user ${userId}: ${fileSizeMB} MB`);
    }
    catch (error) {
        console.error("[UsageTracking] Error tracking file usage:", error);
    }
}
/**
 * Track a workspace being created
 */
async function trackWorkspaceCreation(userId, workspaceId) {
    try {
        await supabase_1.supabase.rpc("track_usage_event", {
            p_user_id: userId,
            p_event_type: "workspace_created",
            p_quantity: 1,
            p_unit: "workspaces",
            p_resource_id: workspaceId,
            p_metadata: {},
        });
        console.log(`[UsageTracking] Workspace creation tracked for user ${userId}`);
    }
    catch (error) {
        console.error("[UsageTracking] Error tracking workspace creation:", error);
    }
}
/**
 * Track voice input usage
 */
async function trackVoiceUsage(userId) {
    try {
        await supabase_1.supabase.rpc("track_usage_event", {
            p_user_id: userId,
            p_event_type: "voice_input_used",
            p_quantity: 1,
            p_unit: "requests",
            p_resource_id: null,
            p_metadata: {},
        });
        console.log(`[UsageTracking] Voice usage tracked for user ${userId}`);
    }
    catch (error) {
        console.error("[UsageTracking] Error tracking voice usage:", error);
    }
}
/**
 * Estimate tokens from text (rough approximation)
 * OpenAI uses ~1 token per 4 characters for English
 * For Spanish, we'll use ~1 token per 3.5 characters
 */
function estimateTokens(text) {
    return Math.ceil(text.length / 3.5);
}
