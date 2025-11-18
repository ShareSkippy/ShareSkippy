import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock the Next.js Image component
// This prevents errors related to image source validation in the JSDOM environment.
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height = 'intrinsic', ...rest }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} {...rest} />;
  },
}));

if (globalThis.window !== undefined) {
  globalThis.window.scrollTo = jest.fn();
}
