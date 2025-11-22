import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
}

export default function SEO({
    title,
    description = "WADI - Tu centro de comando inteligente. Gestiona proyectos, chats y automatizaciones con IA.",
    name = "WADI"
}: SEOProps) {
    useEffect(() => {
        // Update title
        const siteTitle = title ? `${title} | ${name}` : name;
        document.title = siteTitle;

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = description;
            document.head.appendChild(meta);
        }

        // Cleanup (optional, but good practice to revert to default if needed)
        return () => {
            // We could revert to a default title here, but usually navigating to a new page 
            // will trigger its own SEO component, so it's fine.
        };
    }, [title, description, name]);

    return null;
}
