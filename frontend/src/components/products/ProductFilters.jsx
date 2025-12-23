// src/components/products/ProductFilters.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox, Button, Slider, Divider, Accordion, AccordionSummary, AccordionDetails, Chip,
    TextField,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon, FilterList as FilterIcon, Clear as ClearIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import productService from '../../services/productService';
const ProductFilters = ({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [expanded, setExpanded] = useState(['category', 'price']);
    const { data: categories } = useQuery('categories', productService.getCategories);
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);
    const handleAccordionChange = (panel) => (event, isExpanded) => {
        if (isExpanded) {
            setExpanded([...expanded, panel]);
        } else {
            setExpanded(expanded.filter(p => p !== panel));
        }
    };
    const handleCategoryChange = (categoryId) => {
        setLocalFilters({ ...localFilters, category: categoryId });
    };
    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
        setLocalFilters({
            ...localFilters, minPrice: newValue[0], maxPrice: newValue[1],
        });
    };
    const handleInStockChange = (event) => {
        setLocalFilters({ ...localFilters, inStock: event.target.checked });
    };
    const applyFilters = () => {
        onFilterChange(localFilters);
    };
    const clearFilters = () => {
        const clearedFilters = {
            category: '', minPrice: '', maxPrice: '', inStock: false, search: localFilters.search || '',
        };
        setLocalFilters(clearedFilters);
        setPriceRange([0, 10000]);
        onFilterChange(clearedFilters);
    };
    return (
        <Paper sx={{ width: 280, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon /> Filters
                </Typography>
                <Button size="small" onClick={clearFilters} startIcon={<ClearIcon />}>
                    Clear
                </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {/* Categories */}
            <Accordion
                expanded={expanded.includes('category')}
                onChange={handleAccordionChange('category')}
                elevation={0}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Categories</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <RadioGroup
                        value={localFilters.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                        <FormControlLabel value="" control={<Radio size="small" />} label="All Categories" />
                        {categories?.map((category) => (
                            <FormControlLabel
                                key={category.id}
                                value={category.id}
                                control={<Radio size="small" />}
                                label={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <Typography variant="body2">{category.name}</Typography>
                                        <Chip label={category.productCount} size="small" />
                                    </Box>
                                }
                            />
                        ))}
                    </RadioGroup>
                </AccordionDetails>
            </Accordion>
            {/* Price Range */}
            <Accordion
                expanded={expanded.includes('price')}
                onChange={handleAccordionChange('price')}
                elevation={0}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Price Range</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ px: 1 }}>
                        <Slider
                            value={priceRange}
                            onChange={handlePriceChange}
                            valueLabelDisplay="auto" min={0}
                            max={10000}
                            step={100}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <TextField
                                size="small"
                                label="Min" type="number" value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                sx={{ width: '48%' }}
                            />
                            <TextField
                                size="small"
                                label="Max" type="number" value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                sx={{ width: '48%' }}
                            />
                        </Box>
                    </Box>
                </AccordionDetails>
            </Accordion>
            {/* Availability */}
            <Accordion
                expanded={expanded.includes('availability')}
                onChange={handleAccordionChange('availability')}
                elevation={0}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Availability</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={localFilters.inStock}
                                onChange={handleInStockChange}
                                size="small" />
                        }
                        label="In Stock Only" />
                </AccordionDetails>
            </Accordion>
            <Button
                fullWidth
                variant="contained"
                onClick={applyFilters}
                sx={{ mt: 2 }}
            >
                Apply Filters
            </Button>
        </Paper>
    );
};
export default ProductFilters;