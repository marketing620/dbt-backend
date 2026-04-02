import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const trackVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const { path, referrer, utm_source, utm_medium, utm_campaign, sessionId } = req.body;

        const newDoc = {
            path: path || '/',
            referrer: referrer || '',
            utm_source: utm_source || 'Direct',
            utm_medium: utm_medium || '',
            utm_campaign: utm_campaign || '',
            sessionId: sessionId || '',
            createdAt: new Date(),
        };

        await db.collection('analytics').add(newDoc);
        res.status(200).json({ message: 'Visit tracked' });
    } catch (error) {
        console.error('Error tracking visit:', error);
        res.status(500).json({ error: 'Failed to track visit' });
    }
};

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        // Here we ideally aggregate the last 30 days of data.
        // For simplicity, we just pull everything or a limited set.
        const snapshot = await db.collection('analytics').orderBy('createdAt', 'desc').limit(5000).get();
        
        let visitorsToday = 0;
        const seenSessions = new Set<string>();
        const sourceCounts: Record<string, number> = {};
        const dailyCounts: Record<string, number> = {};

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const sid = data.sessionId;
            
            // Deduplicate by sessionId
            if (sid && seenSessions.has(sid)) {
                return; // Skip if already counted this session
            }
            if (sid) seenSessions.add(sid);

            // Time aggregations
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                const date = data.createdAt.toDate();
                if (date >= today) {
                    visitorsToday++;
                }

                // YYYY-MM-DD format
                const dateString = date.toISOString().split('T')[0];
                if (!dailyCounts[dateString]) {
                    dailyCounts[dateString] = 0;
                }
                dailyCounts[dateString]++;
            }

            // Aggregate sources
            const source = data.utm_source || 'Direct';
            if (!sourceCounts[source]) {
                sourceCounts[source] = 0;
            }
            sourceCounts[source]++;
        });

        const totalVisitors = seenSessions.size;

        // Format for Recharts (Sources)
        const colors = ["#8884d8", "#83a6ed", "#8dd1e1", "#a4de6c", "#d0ed57", "#ffc658", "#ff7300"];
        const sourcesData = Object.keys(sourceCounts).map((key, index) => ({
            name: key,
            value: sourceCounts[key],
            color: colors[index % colors.length]
        })).sort((a, b) => b.value - a.value); // Sort by volume

        // Format for Recharts (Over Time)
        // Sort keys chronologically
        const visitorsOverTime = Object.keys(dailyCounts).sort().map(key => ({
            date: key,
            value: dailyCounts[key]
        }));

        // Fetch total leads from contactMessages
        const leadsSnapshot = await db.collection('contactMessages').get();
        const totalLeads = leadsSnapshot.size;

        const conversionRate = totalVisitors > 0 ? ((totalLeads / totalVisitors) * 100).toFixed(1) : 0;

        res.status(200).json({
            visitorsToday,
            totalVisitors,
            totalLeads,
            conversionRate,
            sourcesData,
            visitorsOverTime
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
