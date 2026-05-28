import React from 'react';

const LIGHT_SRC = '/assets/icons/interflow-logo.svg';      // white wordmark, for dark surfaces
const DARK_SRC  = '/assets/icons/interflow-logo-dark.svg'; // dark wordmark, for light surfaces

/**
 * InterflowLogo
 *
 * variant:
 *   "dark"  → dark wordmark; use on light/white surfaces (default)
 *   "light" → white wordmark; use on dark surfaces
 *   "auto"  → follows the device color scheme via prefers-color-scheme;
 *             use on neutral surfaces that swap between light/dark mode
 */
const InterflowLogo = ({
  variant = 'dark',
  alt = 'Interflow',
  className,
  style,
  ...imgProps
}) => {
  if (variant === 'auto') {
    return (
      <picture>
        <source srcSet={LIGHT_SRC} media="(prefers-color-scheme: dark)" />
        <img
          src={DARK_SRC}
          alt={alt}
          className={className}
          style={style}
          {...imgProps}
        />
      </picture>
    );
  }

  const src = variant === 'light' ? LIGHT_SRC : DARK_SRC;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...imgProps}
    />
  );
};

export default InterflowLogo;
