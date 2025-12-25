import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import productService from '../../services/productService';
import { formatCurrency } from '../../utils/formatters';

const validationSchema = Yup.object({
  name: Yup.string().required('Product name is required'),
  sku: Yup.string().required('SKU is required'),
  partNumber: Yup.string(),
  categoryId: Yup.number().required('Category is required'),
  basePrice: Yup.number().min(0, 'Price must be positive').required('Base price is required'),
  businessPrice: Yup.number().min(0, 'Price must be positive'),
  stockQuantity: Yup.number().integer().min(0).required('Stock quantity is required'),
  minStockLevel: Yup.number().integer().min(0).required('Minimum stock level is required'),
  gstApplicable: Yup.boolean(),
  gstRate: Yup.number().when('gstApplicable', {
    is: true,
    then: Yup.number().min(0).max(100).required('GST rate is required'),
  }),
  description: Yup.string(),
  unit: Yup.string().required('Unit is required'),
  brand: Yup.string(),
  manufacturer: Yup.string(),
});

const ProductManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [stockUpdate, setStockUpdate] = useState({ productId: null, quantity: 0, isDeduction: false });
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  // Fetch products
  const { data: productsData, isLoading } = useQuery(
    ['admin-products', paginationModel, searchTerm],
    () => productService.getProducts({
      page: paginationModel.page,
      size: paginationModel.pageSize,
      search: searchTerm,
    }),
    { keepPreviousData: true }
  );

  // Fetch categories
  const { data: categories = [] } = useQuery('categories', productService.getCategories);

  // Mutations
  const productMutation = useMutation(
    ({ id, data }) => (id ? productService.updateProduct(id, data) : productService.createProduct(data)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-products');
        toast.success(selectedProduct ? 'Product updated successfully' : 'Product created successfully');
        handleCloseDialog();
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Operation failed'),
    }
  );

  const deleteMutation = useMutation(productService.deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-products');
      toast.success('Product deleted successfully');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Delete failed'),
  });

  const toggleStatusMutation = useMutation(productService.toggleProductStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-products');
      toast.success('Product status updated');
    },
  });

  const updateStockMutation = useMutation(
    ({ id, quantity }) => productService.updateStock(id, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-products');
        toast.success('Stock updated successfully');
        handleCloseStockDialog();
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Stock update failed'),
    }
  );

  // Formik
  const formik = useFormik({
    initialValues: {
      name: '',
      sku: '',
      partNumber: '',
      categoryId: '',
      basePrice: '',
      businessPrice: '',
      stockQuantity: 0,
      minStockLevel: 0,
      gstApplicable: true,
      gstRate: 18,
      description: '',
      unit: 'PIECE',
      brand: '',
      manufacturer: '',
      active: true,
    },
    validationSchema,
    onSubmit: (values) => productMutation.mutate({ id: selectedProduct?.id, data: values }),
  });

  const handleOpenDialog = useCallback((product = null) => {
    if (product) {
      setSelectedProduct(product);
      formik.setValues({
        ...product,
        categoryId: product.category?.id || '',
      });
    } else {
      setSelectedProduct(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  }, [formik]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    formik.resetForm();
  };

  const handleOpenStockDialog = (product) => {
    setStockUpdate({
      productId: product.id,
      productName: product.name,
      currentStock: product.stockQuantity,
      quantity: 0,
      isDeduction: false,
    });
    setOpenStockDialog(true);
  };

  const handleCloseStockDialog = () => {
    setOpenStockDialog(false);
    setStockUpdate({ productId: null, quantity: 0, isDeduction: false });
  };

  const handleStockUpdate = () => {
    const qty = Math.abs(stockUpdate.quantity) * (stockUpdate.isDeduction ? -1 : 1);
    updateStockMutation.mutate({ id: stockUpdate.productId, quantity: qty });
  };

  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  }, []);

  const handleToggleStatus = useCallback((id) => {
    toggleStatusMutation.mutate(id);
  }, []);

  const columns = useMemo(() => [
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 200 },
    { field: 'partNumber', headerName: 'Part Number', width: 130 },
    { field: 'category', headerName: 'Category', width: 130, valueGetter: (params) => params.row.category?.name || '-' },
    { field: 'basePrice', headerName: 'Base Price', width: 120, valueFormatter: (params) => formatCurrency(params.value) },
    { field: 'businessPrice', headerName: 'Business Price', width: 120, valueFormatter: (params) => params.value ? formatCurrency(params.value) : '-' },
    {
      field: 'stockQuantity',
      headerName: 'Stock',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography color={params.value <= params.row.minStockLevel ? 'error' : 'inherit'} variant="body2">
            {params.value}
          </Typography>
          <IconButton size="small" onClick={() => handleOpenStockDialog(params.row)} color="primary">
            <InventoryIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Switch checked={params.value} onChange={() => handleToggleStatus(params.row.id)} size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row)} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ], [handleDelete, handleOpenDialog, handleToggleStatus]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Product Management</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add Product</Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          sx={{ mb: 3 }}
        />

        <DataGrid
          rows={productsData?.content || []}
          columns={columns}
          rowCount={productsData?.totalElements || 0}
          loading={isLoading}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          checkboxSelection
          disableRowSelectionOnClick
          autoHeight
          components={{ Toolbar: GridToolbar }}
        />
      </Paper>

      {/* Product Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Name, SKU, Part Number */}
              <Grid item xs={12} sm={4}><TextField fullWidth label="Product Name" name="name" {...formik.getFieldProps('name')} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth label="SKU" name="sku" {...formik.getFieldProps('sku')} error={formik.touched.sku && Boolean(formik.errors.sku)} helperText={formik.touched.sku && formik.errors.sku} /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth label="Part Number" name="partNumber" {...formik.getFieldProps('partNumber')} error={formik.touched.partNumber && Boolean(formik.errors.partNumber)} helperText={formik.touched.partNumber && formik.errors.partNumber} /></Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}>
                  <InputLabel>Category</InputLabel>
                  <Select name="categoryId" value={formik.values.categoryId} onChange={formik.handleChange}>
                    {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* Prices */}
              <Grid item xs={12} sm={3}><TextField fullWidth label="Base Price" type="number" name="basePrice" {...formik.getFieldProps('basePrice')} error={formik.touched.basePrice && Boolean(formik.errors.basePrice)} helperText={formik.touched.basePrice && formik.errors.basePrice} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
              <Grid item xs={12} sm={3}><TextField fullWidth label="Business Price" type="number" name="businessPrice" {...formik.getFieldProps('businessPrice')} error={formik.touched.businessPrice && Boolean(formik.errors.businessPrice)} helperText={formik.touched.businessPrice && formik.errors.businessPrice} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>

              {/* Stock */}
              <Grid item xs={12} sm={3}><TextField fullWidth label="Stock Quantity" type="number" name="stockQuantity" {...formik.getFieldProps('stockQuantity')} error={formik.touched.stockQuantity && Boolean(formik.errors.stockQuantity)} helperText={formik.touched.stockQuantity && formik.errors.stockQuantity} /></Grid>
              <Grid item xs={12} sm={3}><TextField fullWidth label="Minimum Stock Level" type="number" name="minStockLevel" {...formik.getFieldProps('minStockLevel')} error={formik.touched.minStockLevel && Boolean(formik.errors.minStockLevel)} helperText={formik.touched.minStockLevel && formik.errors.minStockLevel} /></Grid>

              {/* Unit & GST */}
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select name="unit" value={formik.values.unit} onChange={formik.handleChange}>
                    <MenuItem value="PIECE">Piece</MenuItem>
                    <MenuItem value="KG">Kilogram</MenuItem>
                    <MenuItem value="METER">Meter</MenuItem>
                    <MenuItem value="LITER">Liter</MenuItem>
                    <MenuItem value="BOX">Box</MenuItem>
                    <MenuItem value="SET">Set</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <FormControlLabel control={<Switch checked={formik.values.gstApplicable} onChange={(e) => formik.setFieldValue('gstApplicable', e.target.checked)} />} label="GST Applicable" />
                {formik.values.gstApplicable && <TextField fullWidth type="number" label="GST Rate (%)" name="gstRate" {...formik.getFieldProps('gstRate')} error={formik.touched.gstRate && Boolean(formik.errors.gstRate)} helperText={formik.touched.gstRate && formik.errors.gstRate} />}
              </Grid>

              {/* Brand, Manufacturer */}
              <Grid item xs={12} sm={6}><TextField fullWidth label="Brand" name="brand" {...formik.getFieldProps('brand')} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Manufacturer" name="manufacturer" {...formik.getFieldProps('manufacturer')} /></Grid>

              {/* Description */}
              <Grid item xs={12}><TextField fullWidth label="Description" name="description" multiline rows={3} {...formik.getFieldProps('description')} /></Grid>

              {/* Active */}
              <Grid item xs={12}><FormControlLabel control={<Switch checked={formik.values.active} onChange={(e) => formik.setFieldValue('active', e.target.checked)} />} label="Active" /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={productMutation.isLoading}>{selectedProduct ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Stock Dialog */}
      <Dialog open={openStockDialog} onClose={handleCloseStockDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2">Product: <strong>{stockUpdate.productName}</strong></Typography>
            <Typography variant="body2">Current Stock: <strong>{stockUpdate.currentStock}</strong></Typography>
            <FormControlLabel
              control={<Switch checked={stockUpdate.isDeduction} onChange={(e) => setStockUpdate({ ...stockUpdate, isDeduction: e.target.checked })} />}
              label="Deduct from stock"
            />
            <TextField
              fullWidth
              label={stockUpdate.isDeduction ? 'Quantity to Deduct' : 'Quantity to Add'}
              type="number"
              value={stockUpdate.quantity}
              onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: parseInt(e.target.value) || 0 })}
              sx={{ mt: 2 }}
              InputProps={{ inputProps: { min: 0 } }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              New Stock: {stockUpdate.currentStock + (stockUpdate.quantity * (stockUpdate.isDeduction ? -1 : 1))}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStockDialog}>Cancel</Button>
          <Button onClick={handleStockUpdate} variant="contained" disabled={stockUpdate.quantity === 0 || updateStockMutation.isLoading}>Update Stock</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
