import React from 'react';
import {useColorMode} from '@docusaurus/theme-common';

const ThemeBasedImage = ({ width, lightSrc, darkSrc, alt }) => {
  const { colorMode } = useColorMode();

  return (
    <img width={width} src={colorMode === "dark" ? darkSrc : lightSrc} alt={alt} />
  );
};

export default ThemeBasedImage;
