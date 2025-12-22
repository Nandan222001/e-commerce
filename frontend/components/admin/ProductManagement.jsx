import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
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
  Upload as UploadIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
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

  // Create/Update product mutation
  const productMutation = useMutation(
    ({ id, data }) => {
      if (id) {
        return productService.updateProduct(id, data);
      }
      return productService.createProduct(data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-products');
        toast.success(selectedProduct ? 'Product updated successfully' : 'Product created successfully');
        handleCloseDialog();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Operation failed');
      },
    }
  );

  // Delete product mutation
  const deleteMutation = useMutation(productService.deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-products');
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Delete failed');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation(productService.toggleProductStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-products');
      toast.success('Product status updated');
    },
  });

  // Update stock mutation
  const updateStockMutation = useMutation(
    ({ id, quantity }) => productService.updateStock(id, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-products');
        toast.success('Stock updated successfully');
        handleCloseStockDialog();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Stock update failed');
      },
    }
  );

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
    onSubmit: (values) => {
      productMutation.mutate({
        id: selectedProduct?.id,
        data: values,
      });
    },
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
  }, []);

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
    updateStockMutation.mutate({
      id: stockUpdate.productId,
      quantity: Math.abs(stockUpdate.quantity) * (stockUpdate.isDeduction ? -1 : 1),
    });
  };

  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  }, []);

  const handleToggleStatus = useCallback((id) => {
    toggleStatusMutation.mutate(id);
  }, []);

  const handleExport = () => {
    // Implement export functionality
    toast.info('Export functionality to be implemented');
  };

  const columns = useMemo(() => [
    {
      field: 'sku',
      headerName: 'SKU',
      width: 120,
    },
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'partNumber',
      headerName: 'Part Number',
      width: 130,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      valueGetter: (params) => params.row.category?.name || '-',
    },
    {
      field: 'basePrice',
      headerName: 'Base Price',
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'businessPrice',
      headerName: 'Business Price',
      width: 120,
      valueFormatter: (params) => params.value ? formatCurrency(params.value) : '-',
    },
    {
      field: 'stockQuantity',
      headerName: 'Stock',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            color={params.value <= params.row.minStockLevel ? 'error' : 'inherit'}
            variant="body2"
          >
            {params.value}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleOpenStockDialog(params.row)}
            color="primary"
          >
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
        <Switch
          checked={params.value}
          onChange={() => handleToggleStatus(params.row.id)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ], [handleDelete, handleOpenDialog, handleToggleStatus]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Product Management
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

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
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </Paper>

      {/* Product Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formik.values.sku}
                  onChange={formik.handleChange}
                  error={formik.touched.sku && Boolean(formik.errors.sku)}
                  helperText={formik.touched.sku && formik.errors.sku}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Part Number"
                  name="partNumber"
                  value={formik.values.partNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.partNumber && Boolean(formik.errors.partNumber)}
                  helperText={formik.touched.partNumber && formik.errors.partNumber}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="categoryId"
                    value={formik.values.categoryId}
                    onChange={formik.handleChange}
                    error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Base Price"
                  name="basePrice"
                  type="number"
                  value={formik.values.basePrice}
                  onChange={formik.handleChange}
                  error={formik.touched.basePrice && Boolean(formik.errors.basePrice)}
                  helperText={formik.touched.basePrice && formik.errors.basePrice}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Price"
                  name="businessPrice"
                  type="number"
                  value={formik.values.businessPrice}
                  onChange={formik.handleChange}
                  error={formik.touched.businessPrice && Boolean(formik.errors.businessPrice)}
                  helperText={formik.touched.businessPrice && formik.errors.businessPrice}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  name="stockQuantity"
                  type="number"
                  value={formik.values.stockQuantity}
                  onChange={formik.handleChange}
                  error={formik.touched.stockQuantity && Boolean(formik.errors.stockQuantity)}
                  helperText={formik.touched.stockQuantity && formik.errors.stockQuantity}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Stock Level"
                  name="minStockLevel"
                  type="number"
                  value={formik.values.minStockLevel}
                  onChange={formik.handleChange}
                  error={formik.touched.minStockLevel && Boolean(formik.errors.minStockLevel)}
                  helperText={formik.touched.minStockLevel && formik.errors.minStockLevel}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit"
                    value={formik.values.unit}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="PIECE">Piece</MenuItem>
                    <MenuItem value="KG">Kilogram</MenuItem>
                    <MenuItem value="METER">Meter</MenuItem>
                    <MenuItem value="LITER">Liter</MenuItem>
                    <MenuItem value="BOX">Box</MenuItem>
                    <MenuItem value="SET">Set</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="gstApplicable"
                        checked={formik.values.gstApplicable}
                        onChange={formik.handleChange}
                      />
                    }
                    label="GST Applicable"
                  />
                  
                  {formik.values.gstApplicable && (
                    <TextField
                      label="GST Rate (%)"
                      name="gstRate"
                      type="number"
                      value={formik.values.gstRate}
                      onChange={formik.handleChange}
                      error={formik.touched.gstRate && Boolean(formik.errors.gstRate)}
                      helperText={formik.touched.gstRate && formik.errors.gstRate}
                      sx={{ width: 120 }}
                    />
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={formik.values.brand}
                  onChange={formik.handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Manufacturer"
                  name="manufacturer"
                  value={formik.values.manufacturer}
                  onChange={formik.handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="active"
                      checked={formik.values.active}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={productMutation.isLoading}>
              {selectedProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={openStockDialog} onClose={handleCloseStockDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Product: <strong>{stockUpdate.productName}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              Current Stock: <strong>{stockUpdate.currentStock}</strong>
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={stockUpdate.isDeduction}
                    onChange={(e) => setStockUpdate({ ...stockUpdate, isDeduction: e.target.checked })}
                  />
                }
                label="Deduct from stock"
              />
              
              <TextField
                fullWidth
                label={stockUpdate.isDeduction ? 'Quantity to Deduct' : 'Quantity to Add'}
                type="number"
                value={stockUpdate.quantity}
                onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: parseInt(e.target.value) || 0 })}
                sx={{ mt: 2 }}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                New Stock: {stockUpdate.currentStock + (stockUpdate.quantity * (stockUpdate.isDeduction ? -1 : 1))}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStockDialog}>Cancel</Button>
          <Button 
            onClick={handleStockUpdate} 
            variant="contained"
            disabled={stockUpdate.quantity === 0 || updateStockMutation.isLoading}
          >
            Update Stock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;