import React, { useState } from 'react';
import {
    Box, Paper, Typography, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, IconButton, Button, TextField, InputAdornment, Avatar, Menu, MenuItem,
} from '@mui/material';
import {
    Search as SearchIcon, MoreVert as MoreIcon, Add as AddIcon, Download as DownloadIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import userService from '../../services/userService';
const Users = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const { data: users, isLoading } = useQuery(
        ['admin-users', page, rowsPerPage, searchTerm], () => userService.getUsers({
            page, size: rowsPerPage, search: searchTerm,
        }), { keepPreviousData: true }
    );
    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };
    return (
        <>
            <Helmet>
                <title>User Management - Admin</title>
            </Helmet>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">User Management</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" startIcon={<DownloadIcon />}>
                            Export Users
                        </Button>
                        <Button variant="contained" startIcon={<AddIcon />}>
                            Add User
                        </Button>
                    </Box>
                </Box>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Search users..." value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Paper>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Customer Type</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users?.content?.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={user.avatar}>
                                                {user.firstName?.[0]}{user.lastName?.[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2">
                                                    {user.firstName} {user.lastName}
                                                </Typography>
                                                {user.companyName && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {user.companyName}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.customerType}
                                            size="small" color={user.customerType === 'BUSINESS' ? 'primary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>{user.roles?.[0]?.name}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.active ? 'Active' : 'Inactive'}
                                            size="small" color={user.active ? 'success' : 'error'}
                                        />
                                    </TableCell>
                                    <TableCell>{format(new Date(user.createdAt), 'dd MMM yyyy')}</TableCell>
                                    <TableCell align="center">
                                        <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                                            <MoreIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div" count={users?.totalElements || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </TableContainer>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Edit User</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Change Role</MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        {selectedUser?.active ? 'Deactivate' : 'Activate'}
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                        Delete User
                    </MenuItem>
                </Menu>
            </Box>
        </>
    );
};
export default Users;