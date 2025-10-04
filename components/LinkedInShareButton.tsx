"use client";

import { useState, useEffect } from 'react';
import styles from './LinkedInShareButton.module.css';

export function LinkedInShareButton() {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    // This ensures `window.location.href` is available.
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      const shareText = `Excited to share my latest Three.js portfolio! Crafting award-winning digital experiences. Check it out: ${url} #WebDev #ThreeJS #Portfolio`;
      const encodedText = encodeURIComponent(shareText);
      setShareUrl(`https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`);
    }
  }, []); // The empty dependency array ensures this runs only once.

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.linkedinButton}
      // Disable the button until the URL is ready to prevent errors
      aria-disabled={!shareUrl}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.25 6.5 1.75 1.75 0 016.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.62 1.62 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 4.12z"></path>
      </svg>
      Share on LinkedIn
    </a>
  );
}
