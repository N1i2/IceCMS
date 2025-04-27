import React from 'react';
import styles from './Layout.module.css';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={styles.body}>
        <main>{children}</main>
      </body>
    </html>
  );
}
