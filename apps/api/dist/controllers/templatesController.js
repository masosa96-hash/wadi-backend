"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplates = getTemplates;
exports.getTemplateById = getTemplateById;
const logger_1 = require("../config/logger");
/**
 * Predefined templates for quick use
 */
const TEMPLATES = [
    {
        id: 'ideas-rapidas',
        name: 'Ideas rápidas',
        description: 'Generá ideas creativas sobre cualquier tema',
        prompt: 'Necesito ideas creativas sobre: ',
        icon: '💡',
        category: 'general',
    },
    {
        id: 'texto-instagram',
        name: 'Texto para Instagram',
        description: 'Creá un post atractivo para Instagram',
        prompt: 'Ayudame a escribir un post de Instagram sobre: ',
        icon: '📱',
        category: 'social',
    },
    {
        id: 'resumen',
        name: 'Resumen',
        description: 'Resumí textos largos o complejos',
        prompt: 'Por favor resumime el siguiente texto: ',
        icon: '📝',
        category: 'productivity',
    },
    {
        id: 'plan-proyecto',
        name: 'Plan de proyecto',
        description: 'Creá un plan estructurado para tu proyecto',
        prompt: 'Ayudame a crear un plan para este proyecto: ',
        icon: '📋',
        category: 'productivity',
    },
    {
        id: 'mejorar-texto',
        name: 'Mejorar texto',
        description: 'Mejorá y refiná cualquier texto',
        prompt: 'Ayudame a mejorar este texto: ',
        icon: '✨',
        category: 'general',
    },
    {
        id: 'checklist',
        name: 'Checklist',
        description: 'Creá una lista de tareas ordenada',
        prompt: 'Creame un checklist paso a paso para: ',
        icon: '✅',
        category: 'productivity',
    },
];
/**
 * Get all templates
 */
async function getTemplates(req, res) {
    try {
        const { category } = req.query;
        let templates = TEMPLATES;
        // Filter by category if provided
        if (category && typeof category === 'string') {
            templates = templates.filter((t) => t.category === category);
        }
        res.json(templates);
    }
    catch (error) {
        logger_1.logger.error('Error fetching templates:', error);
        res.status(500).json({ error: error.message });
    }
}
/**
 * Get a single template by ID
 */
async function getTemplateById(req, res) {
    try {
        const { id } = req.params;
        const template = TEMPLATES.find((t) => t.id === id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(template);
    }
    catch (error) {
        logger_1.logger.error('Error fetching template:', error);
        res.status(500).json({ error: error.message });
    }
}
