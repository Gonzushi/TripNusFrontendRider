import { type PropsWithChildren } from 'react';

export type SafeViewProps = PropsWithChildren<{
  statusBarStyle?: 'dark' | 'light';
  statusBackgroundColor?: string;
  isShowingTabBar?: boolean;
  isShowingPaddingTop?: boolean;
  isShowingPaddingBottom?: boolean;
}>;

export type TabConfig = {
  [key: string]: {
    name: string;
    icon: 'home' | 'time' | 'chatbubbles';
    path: string;
  };
};
