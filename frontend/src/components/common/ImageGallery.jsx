import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import {
    ArrowBackIos as PrevIcon, ArrowForwardIos as NextIcon, ZoomIn as ZoomIcon,
} from '@mui/icons-material';
const ImageGallery = ({ images }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };
    const handleNext = () => {
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    const handleThumbnailClick = (index) => {
        setSelectedIndex(index);
    };
    return (
        <Box>
            <Box sx={{ position: 'relative', mb: 2 }}>
                <Box
                    component="img" src={images[selectedIndex]}
                    alt="Product" sx={{
                        width: '100%', height: 400, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider',
                    }}
                />
                {images.length > 1 && (
                    <>
                        <IconButton
                            sx={{
                                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)',
                            }}
                            onClick={handlePrevious}
                        >
                            <PrevIcon />
                        </IconButton>
                        <IconButton
                            sx={{
                                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)',
                            }}
                            onClick={handleNext}
                        >
                            <NextIcon />
                        </IconButton>
                    </>
                )}
                <IconButton
                    sx={{
                        position: 'absolute', right: 8, top: 8, backgroundColor: 'rgba(255,255,255,0.8)',
                    }}
                >
                    <ZoomIcon />
                </IconButton>
            </Box>
            {images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
                    {images.map((image, index) => (
                        <Box
                            key={index}
                            component="img" src={image}
                            alt={`Thumbnail ${index + 1}`}
                            sx={{
                                width: 80,
                                height: 80, objectFit: 'cover', borderRadius: 1, border: '2px solid', borderColor: selectedIndex === index ? 'primary.main' : 'divider', cursor: 'pointer', opacity: selectedIndex === index ? 1 : 0.6,
                            }}
                            onClick={() => handleThumbnailClick(index)}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};
export default ImageGallery;