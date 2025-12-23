import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard';
import ProductListItem from './ProductListItem';
import ProductFilters from './ProductFilters';
import productService from '../../services/productService';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    search: searchParams.get('search') || '',
  });

  const { data, isLoading, error } = useQuery(
    ['products', page, sortBy, filters],
    () => productService.getProducts({
      page: page - 1,
      size: 12,
      sort: sortBy,
      ...filters,
    }),
    { keepPreviousData: true }
  );

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load products. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <ProductFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Products {filters.search && `- Search results for "${filters.search}"`}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={handleSortChange}>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                <MenuItem value="price_desc">Price: High to Low</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="rating">Top Rated</MenuItem>
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="grid">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ListViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {isLoading ? (
          <Grid container spacing={3}>
            {[...Array(12)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={viewMode === 'grid' ? 3 : 12} key={index}>
                <Skeleton variant="rectangular" height={viewMode === 'grid' ? 350 : 150} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing {data?.content?.length || 0} of {data?.totalElements || 0} products
            </Typography>

            <Grid container spacing={3}>
              {data?.content?.map((product) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={viewMode === 'grid' ? 6 : 12} 
                  md={viewMode === 'grid' ? 4 : 12} 
                  lg={viewMode === 'grid' ? 3 : 12} 
                  key={product.id}
                >
                  {viewMode === 'grid' ? (
                    <ProductCard product={product} />
                  ) : (
                    <ProductListItem product={product} />
                  )}
                </Grid>
              ))}
            </Grid>

            {data?.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={data.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ProductList;