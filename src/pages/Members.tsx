import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    Grid,
    Stack,
    Link,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
} from '@mui/material';
import {
    InfoOutlined as InfoIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

// Enhanced Member Interface
interface Member {
    id: number;
    name: string;
    avatar?: string;
    scores: number;
    rank: number;
    status_change?: '=' | 'up' | 'down';
}

interface CategoryRanking {
    title: string;
    description: string;
    topMembers: Member[];
}

export default function Members() {
    const [topRanking, setTopRanking] = useState<Member[]>([]);
    const [categories, setCategories] = useState<CategoryRanking[]>([]);

    useEffect(() => {
        // Mock Top 5 for the ranking section
        const mockTop5: Member[] = [
            { id: 1, name: 'Denis Avramenko', scores: 234577, rank: 1 },
            { id: 2, name: 'Darya Danilovich', scores: 102325, rank: 2 },
            { id: 3, name: 'Vladislav Bogachyov', scores: 98696, rank: 3 },
            { id: 4, name: 'Alexander Chernovol', scores: 90212, rank: 4 },
            { id: 5, name: 'Ekaterina Polyakova', scores: 58857, rank: 5 },
        ];

        // Mock Categories Top 3
        const mockCategories: CategoryRanking[] = [
            {
                title: 'Best of all-time',
                description: 'После стольких лет? Всегда!',
                topMembers: [
                    { id: 10, name: 'Alexey Sidoruk', scores: 463188, rank: 1, status_change: '=' },
                    { id: 11, name: 'Vitaly Andreyanov', scores: 396564, rank: 2, status_change: '=' },
                    { id: 1, name: 'Denis Avramenko', scores: 335473, rank: 3, status_change: '=' },
                ]
            },
            {
                title: 'Best beginner',
                description: 'What a leap! And in less than 90 days since your first report.',
                topMembers: [
                    { id: 12, name: 'Elizaveta Sheykina', scores: 12662, rank: 1, status_change: '=' },
                    { id: 13, name: 'Andrey Abramenko', scores: 5006, rank: 2, status_change: '=' },
                    { id: 14, name: 'Anna Pavlenko', scores: 1821, rank: 3, status_change: '=' },
                ]
            },
            {
                title: 'Best month',
                description: 'The best!* According to statistics from the past 30 days.',
                topMembers: [
                    { id: 1, name: 'Denis Avramenko', scores: 22018, rank: 1, status_change: '=' },
                    { id: 3, name: 'Vladislav Bogachyov', scores: 19092, rank: 2, status_change: '=' },
                ]
            },
            {
                title: 'Best season',
                description: 'See them in the new season of "Battle for #1 on the Bug Tracker".',
                topMembers: [
                    { id: 1, name: 'Denis Avramenko', scores: 65525, rank: 1, status_change: '=' },
                    { id: 3, name: 'Vladislav Bogachyov', scores: 45499, rank: 2, status_change: '=' },
                ]
            }
        ];

        setTopRanking(mockTop5);
        setCategories(mockCategories);
    }, []);

    const RankingCard = ({ member }: { member: Member }) => (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                minWidth: 160,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                position: 'relative',
                bgcolor: 'background.paper',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
            }}
        >
            <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                    sx={{
                        width: 100,
                        height: 100,
                        border: '4px solid #f0f2f5',
                        bgcolor: '#f5f7f9'
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: member.rank === 1 ? '#FFD700' : member.rank === 2 ? '#C0C0C0' : member.rank === 3 ? '#CD7F32' : '#aeb5bc',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: '2px solid white'
                    }}
                >
                    {member.rank}
                </Box>
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5, lineHeight: 1.2 }}>
                {member.name.split(' ')[0]}<br />{member.name.split(' ')[1]}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
                {member.scores.toLocaleString()} scores
            </Typography>
        </Paper>
    );

    const CategoryCard = ({ cat }: { cat: CategoryRanking }) => (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">{cat.title}</Typography>
                    <InfoIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </Stack>
                <Link component="button" variant="body2" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#2d81e0' }}>
                    Show all <ChevronRightIcon sx={{ fontSize: 18 }} />
                </Link>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {cat.description}
            </Typography>
            <List disablePadding>
                {cat.topMembers.map((m, idx) => (
                    <ListItem key={m.id} disablePadding sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ width: 12, textAlign: 'center' }}>
                                {idx + 1}
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ width: 12, textAlign: 'center' }}>
                                =
                            </Typography>
                            <ListItemAvatar sx={{ minWidth: 40 }}>
                                <Avatar sx={{ width: 32, height: 32 }} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={m.name}
                                primaryTypographyProps={{ variant: 'body2', color: '#2d81e0', fontWeight: 500 }}
                            />
                            <Typography variant="body2" fontWeight="bold">
                                {m.scores.toLocaleString()}
                            </Typography>
                        </Stack>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
            {/* Ranking Top Section */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h6" fontWeight="bold">Ranking</Typography>
                    <Link component="button" variant="body2" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#2d81e0' }}>
                        Show all <ChevronRightIcon sx={{ fontSize: 18 }} />
                    </Link>
                </Box>
                <Stack direction="row" spacing={2.5} sx={{ overflowX: 'auto', pb: 1, px: 0.5 }}>
                    {topRanking.map(member => (
                        <RankingCard key={member.id} member={member} />
                    ))}
                </Stack>
            </Paper>

            {/* Category Grids */}
            <Grid container spacing={4}>
                {categories.map((cat, idx) => (
                    <Grid item key={idx} xs={12} md={6}>
                        <CategoryCard cat={cat} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
