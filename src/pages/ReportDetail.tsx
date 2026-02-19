import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    Chip,
    Stack,
    Divider,
    IconButton,
    Button,
    TextField,
    Link,
    Breadcrumbs,
    CircularProgress,
} from '@mui/material';
import {
    BookmarkBorder as BookmarkBorderIcon,
    PlayCircleOutline as MovieIcon,
    InsertDriveFile as FileIcon,
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    InfoOutlined as InfoIcon,
    CheckCircleOutline as CheckCircleIcon,
    FavoriteBorder as FavoriteIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

interface TimelineItem {
    id: number;
    bug_id: number;
    user_id: number;
    content?: string;
    old_status?: string;
    new_status?: string;
    type: 'comment' | 'status_change';
    created_at: string;
}

interface Attachment {
    id: number;
    file_name: string;
    file_size: number;
    file_type: string;
    r2_key: string;
}

interface Report {
    id: number;
    title: string;
    description: string;
    issue_type: string;
    severity: string;
    status: string;
    version: string;
    device: string;
    platform: string;
    steps: string;
    actual_result: string;
    expected_result: string;
    tags: string; // JSON string
    created_at: string;
    updated_at: string;
    product_name: string;
    product_color: string;
    product_image?: string;
    reporter_name: string;
    reporter_role: string;
    reporter_avatar?: string;
}

export default function ReportDetail() {
    const { id } = useParams();
    const [report, setReport] = useState<Report | null>(null);
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reportRes, timelineRes, attachmentsRes] = await Promise.all([
                fetch(`/api/reports/${id}`),
                fetch(`/api/reports/${id}/timeline`),
                fetch(`/api/reports/${id}/attachments`)
            ]);

            if (reportRes.ok) setReport(await reportRes.json());
            if (timelineRes.ok) setTimeline(await timelineRes.json());
            if (attachmentsRes.ok) setAttachments(await attachmentsRes.json());
        } catch (error) {
            console.error('Error fetching report details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Constraints
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File too large (> 10MB)');
            return;
        }

        if (file.type.startsWith('video/')) {
            alert('Video files are not allowed');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`/api/reports/${id}/upload`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                // Refresh attachments
                const attRes = await fetch(`/api/reports/${id}/attachments`);
                if (attRes.ok) setAttachments(await attRes.json());
            } else {
                const err: any = await res.json();
                alert(err.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!report) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Report not found.</Typography>
            </Box>
        );
    }

    const reportSteps = report.steps ? report.steps.split('\n') : [];
    const reportTags = report.tags ? JSON.parse(report.tags) : [];
    const platforms = [report.platform].filter(Boolean);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Breadcrumbs
                separator={<ChevronRightIcon sx={{ fontSize: 18 }} />}
                sx={{ mb: 3 }}
            >
                <Link underline="hover" color="inherit" href="/reports" fontSize="0.9rem">
                    All reports
                </Link>
                <Typography color="text.primary" fontSize="0.9rem" fontWeight="bold">
                    #{id}
                </Typography>
            </Breadcrumbs>

            <Grid container spacing={3}>
                {/* Main Content */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 4, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        {/* Report Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar variant="rounded" src={report.product_image} sx={{ bgcolor: report.product_color || '#0077FF', width: 48, height: 48, borderRadius: 1 }}>
                                    {!report.product_image && report.product_name?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">{report.product_name}</Typography>
                                    <Typography variant="caption" color="text.secondary">Actual in version: {report.version}</Typography>
                                </Box>
                            </Stack>
                            <IconButton>
                                <BookmarkBorderIcon />
                            </IconButton>
                        </Box>

                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
                            {report.title}
                        </Typography>

                        {/* Description Sections */}
                        <Stack spacing={4}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>Reproduction steps</Typography>
                                <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                                    {reportSteps.map((step, idx) => (
                                        <Typography key={idx} component="li" variant="body2" sx={{ mb: 1 }}>{step}</Typography>
                                    ))}
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>Actual result</Typography>
                                <Typography variant="body2">{report.actual_result}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>Expected result</Typography>
                                <Typography variant="body2">{report.expected_result}</Typography>
                            </Box>

                            {/* Attachments */}
                            <Box>
                                <Stack spacing={1}>
                                    {attachments.map((file, idx) => (
                                        <Paper key={idx} elevation={0} sx={{ p: 1.5, bgcolor: '#f5f7f9', display: 'flex', alignItems: 'center', borderRadius: 1.5 }}>
                                            <Box sx={{
                                                width: 40, height: 40, bgcolor: file.file_type?.includes('video') ? '#FFEBEE' : '#E8F5E9',
                                                borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2
                                            }}>
                                                {file.file_type?.includes('video') ? <MovieIcon sx={{ color: '#FF5252' }} /> : <FileIcon sx={{ color: '#4CAF50' }} />}
                                            </Box>
                                            <Box>
                                                <Link href={`/api/files/${file.r2_key}`} target="_blank" variant="body2" fontWeight="bold" sx={{ wordBreak: 'break-all', textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}>
                                                    {file.file_name}
                                                </Link>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {(file.file_size / (1024 * 1024)).toFixed(1)} MB
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>

                        <Divider sx={{ my: 4 }} />

                        {/* Footer Actions */}
                        <Stack direction="row" spacing={3}>
                            <Button startIcon={<CheckCircleIcon />} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                                reproduced 0 times
                            </Button>
                            <Button startIcon={<FavoriteIcon />} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                                Liked by 0 moderators
                            </Button>
                        </Stack>
                    </Paper>

                    {/* Comments Section */}
                    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Button color="primary" sx={{ borderRadius: 1.5 }}>Comments</Button>
                        </Box>

                        <Box sx={{ p: 3 }}>
                            {timeline.map(item => (
                                <Box key={`${item.type}-${item.id}`} sx={{ display: 'flex', mb: 4 }}>
                                    <Avatar sx={{ mr: 2, width: 40, height: 40, bgcolor: item.type === 'comment' ? '#448AFF' : '#B0BEC5' }}>
                                        {item.type === 'comment' ? 'C' : 'S'}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {item.type === 'comment' ? 'User' : 'Product BOT'}
                                        </Typography>
                                        {item.type === 'status_change' ? (
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                <Typography variant="body2" color="text.secondary">New status</Typography>
                                                <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                                <Chip label={item.new_status} size="small" sx={{ bgcolor: '#E3F2FD', color: '#1976D2', fontWeight: 'bold' }} />
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>{item.content}</Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                            {new Date(item.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}

                            {/* Comment Input */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
                                <Avatar sx={{ mr: 2, width: 40, height: 40 }} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Comment"
                                        multiline
                                        rows={1}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f5f7f9', border: 'none', '& fieldset': { border: 'none' } }
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <Stack direction="row">
                                                    <input
                                                        type="file"
                                                        id="attachment-upload"
                                                        hidden
                                                        onChange={handleFileUpload}
                                                    />
                                                    <IconButton size="small" component="label" htmlFor="attachment-upload" disabled={uploading}>
                                                        {uploading ? <CircularProgress size={20} /> : <AttachFileIcon sx={{ fontSize: 20 }} />}
                                                    </IconButton>
                                                </Stack>
                                            )
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                        <Button size="small" sx={{ textTransform: 'none', color: '#1976D2' }}>Public comment</Button>
                                        <IconButton size="small" color="primary"><SendIcon /></IconButton>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Sidebar Info */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'sticky', top: 80 }}>
                        <Stack spacing={3}>
                            {/* Author Card */}
                            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                                <Avatar src={report.reporter_avatar} sx={{ width: 48, height: 48, mr: 2 }}>
                                    {!report.reporter_avatar && report.reporter_name?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">{report.reporter_name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{report.reporter_role || 'Участник VK Testers'}</Typography>
                                </Box>
                            </Paper>

                            {/* General Info Card */}
                            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>General information</Typography>

                                <Stack spacing={3}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Current status</Typography>
                                        <Chip label={report.status} variant="outlined" sx={{ bgcolor: '#E3F2FD', color: '#1976D2', fontWeight: 'bold', borderRadius: 1.5 }} />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Issue type</Typography>
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <Typography variant="body2" fontWeight="bold">{report.issue_type}</Typography>
                                            <InfoIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Severity</Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Box sx={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                bgcolor: report.severity === 'Critical' ? '#d32f2f' : report.severity === 'High' ? '#f57c00' : '#4CAF50'
                                            }} />
                                            <Typography variant="body2" fontWeight="bold">{report.severity}</Typography>
                                            <InfoIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Product version in report</Typography>
                                        <Typography variant="body2" fontWeight="bold">{report.version}</Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Дата создания</Typography>
                                        <Typography variant="body2" fontWeight="bold">{new Date(report.created_at).toLocaleString()}</Typography>
                                        <Typography variant="caption" color="text.secondary">Last changed {new Date(report.updated_at).toLocaleString()}</Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Devices</Typography>
                                        <Typography variant="body2" fontWeight="bold">{report.device}</Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Platforms and OS versions</Typography>
                                        <Stack direction="row" spacing={1}>
                                            {platforms.map(p => <Chip key={p} label={p} size="small" sx={{ bgcolor: '#f0f2f5', borderRadius: 1 }} />)}
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Tags</Typography>
                                        <Stack direction="row" spacing={1}>
                                            {reportTags.map((t: string) => <Chip key={t} label={t} size="small" sx={{ bgcolor: '#f0f2f5', borderRadius: 1 }} />)}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
