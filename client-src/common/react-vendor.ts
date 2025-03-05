// React vendor bundle
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Re-export everything
export { React, ReactDOM };

// Also export individual items from React
export {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
  createContext,
  Component,
  Fragment,
  createElement,
  cloneElement,
  Children,
  isValidElement,
  memo,
  forwardRef,
} from 'react';