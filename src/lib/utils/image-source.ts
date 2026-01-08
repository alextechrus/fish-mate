import { ImageSourcePropType } from 'react-native';
import { ImageSource } from '../types/fish';

/**
 * Converts ImageSource (string URL or require() number) to ImageSourcePropType
 * for use with React Native Image component
 */
export function getImageSource(source: ImageSource | undefined): ImageSourcePropType | undefined {
  if (source === undefined) {
    return undefined;
  }
  if (typeof source === 'number') {
    // It's a require() asset
    return source;
  }
  // It's a URL string
  return { uri: source };
}
