/**
 * WebGL Capability Detection Utility
 * Safely tests whether the current browser environment supports WebGL
 * without throwing uncaught context creation errors.
 */
export const isWebGLSupported = () => {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!(gl && (typeof WebGLRenderingContext !== 'undefined' && gl instanceof WebGLRenderingContext || (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext)));
  } catch (e) {
    return false;
  }
};
