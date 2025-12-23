import React, { useState } from 'react';
import {
    Box, Paper, Typography,
    Grid, Button, FormControl, InputLabel, Select, MenuItem, DatePicker,
} from '@mui/material';
import {
    Download as DownloadIcon, Print as PrintIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
const Reports = () => {
    const [reportType, setReportType] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    return (
        <>
            <Helmet>
                <title>Financial Reports - Finance</title>
            </Helmet>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Financial Reports
                </Typography>
                <Paper sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Report Type</InputLabel>
                                <Select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    label="Report Type" >
                                    <MenuItem value="sales">Sales Report</MenuItem>
                                    <MenuItem value="tax">Tax Report</MenuItem>
                                    <MenuItem value="profit-loss">Profit & Loss</MenuItem>
                                    <MenuItem value="customer">Customer Report</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button variant="outlined" startIcon={<PrintIcon />}>
                                    Print Report
                                </Button>
                                <Button variant="contained" startIcon={<DownloadIcon />}>
                                    Download Report
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </>
    );
};
export default Reports;